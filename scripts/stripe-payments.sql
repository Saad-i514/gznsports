-- Additive migration. Apply ONLY to a separate sandbox database for this release.
-- Requires setup_database.sql and secure-store.sql. Never resets existing data.
BEGIN;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_provider text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id text UNIQUE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_params jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_payment_intent text;
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id text PRIMARY KEY, order_id uuid NOT NULL REFERENCES public.orders(id),
  event_type text NOT NULL, processed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stripe_events FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.reserve_stripe_order(payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SET search_path='' AS $$
DECLARE previous public.orders%ROWTYPE; result jsonb; line record; available integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended((payload->>'request_key')::uuid::text,0));
  SELECT * INTO previous FROM public.orders WHERE request_key=(payload->>'request_key')::uuid FOR UPDATE;
  IF FOUND THEN
    IF previous.request_payload IS DISTINCT FROM payload OR previous.payment_provider IS DISTINCT FROM 'stripe_test' THEN
      RAISE EXCEPTION 'Request changed. Start a new order review.';
    END IF;
    RETURN to_jsonb(previous);
  END IF;
  -- Lock all products in deterministic order before authoritative validation.
  PERFORM id FROM public.products WHERE id IN
    (SELECT v->>'id' FROM jsonb_array_elements(payload->'items') v) ORDER BY id FOR UPDATE;
  result:=public.submit_order_request(payload);
  SELECT * INTO previous FROM public.orders WHERE id=(result->>'id')::uuid;
  IF previous.total < 0.50 THEN RAISE EXCEPTION 'Checkout requires a total of at least $0.50 after discounts.'; END IF;
  FOR line IN SELECT v->>'id' AS id,sum((v->>'quantity')::integer)::integer AS qty
    FROM jsonb_array_elements(previous.items) v GROUP BY v->>'id' ORDER BY v->>'id' LOOP
    SELECT stock_quantity INTO available FROM public.products WHERE id=line.id FOR UPDATE;
    IF available IS NULL OR available<line.qty THEN RAISE EXCEPTION 'Insufficient inventory.'; END IF;
    UPDATE public.products SET stock_quantity=stock_quantity-line.qty WHERE id=line.id;
  END LOOP;
  UPDATE public.orders SET inventory_reserved=true,payment_provider='stripe_test',payment_status='UNPAID'
    WHERE id=previous.id RETURNING * INTO previous;
  RETURN to_jsonb(previous);
END $$;
REVOKE ALL ON FUNCTION public.reserve_stripe_order(jsonb) FROM PUBLIC, anon, authenticated;

-- Receives only a session freshly retrieved by the trusted server from Stripe.
CREATE OR REPLACE FUNCTION public.apply_stripe_session(session jsonb, event_id text, event_type text)
RETURNS text LANGUAGE plpgsql SET search_path='' AS $$
DECLARE current_order public.orders%ROWTYPE; line record; paid boolean; next_payment text;
BEGIN
  SELECT * INTO current_order FROM public.orders WHERE id=(session->'metadata'->>'order_id')::uuid FOR UPDATE;
  IF NOT FOUND OR current_order.payment_provider IS DISTINCT FROM 'stripe_test'
    OR session->>'livemode' IS DISTINCT FROM 'false' OR session->>'mode' IS DISTINCT FROM 'payment'
    OR session->>'currency' IS DISTINCT FROM 'usd'
    OR (session->>'amount_total')::numeric IS DISTINCT FROM round(current_order.total*100)
    OR session->>'client_reference_id' IS DISTINCT FROM current_order.id::text
    OR session->>'id' IS DISTINCT FROM current_order.stripe_session_id THEN
    RAISE EXCEPTION 'Stripe session does not match the order.';
  END IF;
  IF EXISTS(SELECT 1 FROM public.stripe_events WHERE id=event_id) THEN RETURN current_order.payment_status; END IF;
  paid:=session->>'payment_status'='paid' AND session->>'status'='complete';
  next_payment:=current_order.payment_status;
  IF paid AND current_order.payment_status<>'PAID' THEN
    IF NOT current_order.inventory_reserved OR current_order.status='CANCELLED' THEN
      RAISE EXCEPTION 'Paid order needs manual inventory reconciliation.';
    END IF;
    next_payment:='PAID';
  ELSIF current_order.payment_status<>'PAID' AND current_order.inventory_reserved AND
    (session->>'status'='expired' OR (event_type='checkout.session.async_payment_failed' AND session->>'status'='complete')) THEN
    FOR line IN SELECT v->>'id' AS id,sum((v->>'quantity')::integer)::integer AS qty
      FROM jsonb_array_elements(current_order.items) v GROUP BY v->>'id' ORDER BY v->>'id' LOOP
      UPDATE public.products SET stock_quantity=stock_quantity+line.qty WHERE id=line.id;
    END LOOP;
    next_payment:=CASE WHEN session->>'status'='expired' THEN 'EXPIRED' ELSE 'FAILED' END;
    UPDATE public.orders SET inventory_reserved=false,status='CANCELLED' WHERE id=current_order.id;
  ELSIF current_order.payment_status='UNPAID' AND session->>'status'='complete' THEN
    next_payment:='PROCESSING';
  END IF;
  UPDATE public.orders SET payment_status=next_payment,
    stripe_payment_intent=coalesce(session->>'payment_intent',stripe_payment_intent) WHERE id=current_order.id;
  INSERT INTO public.stripe_events(id,order_id,event_type) VALUES(event_id,current_order.id,event_type);
  RETURN next_payment;
END $$;
REVOKE ALL ON FUNCTION public.apply_stripe_session(jsonb,text,text) FROM PUBLIC, anon, authenticated;
-- Recover reservations only after the server has exhaustively checked Stripe for
-- sessions created during the allowed creation window. Not callable by browsers.
CREATE OR REPLACE FUNCTION public.release_orphan_stripe_order(order_id uuid)
RETURNS void LANGUAGE plpgsql SET search_path='' AS $$
DECLARE current_order public.orders%ROWTYPE; line record;
BEGIN
  SELECT * INTO current_order FROM public.orders WHERE id=order_id FOR UPDATE;
  IF NOT FOUND OR current_order.payment_provider IS DISTINCT FROM 'stripe_test'
    OR current_order.stripe_session_id IS NOT NULL OR NOT current_order.inventory_reserved
    OR current_order.created_at > now()-interval '2 hours' OR current_order.payment_status<>'UNPAID' THEN
    RAISE EXCEPTION 'Reservation is not eligible for orphan recovery.';
  END IF;
  FOR line IN SELECT v->>'id' AS id,sum((v->>'quantity')::integer)::integer AS qty
    FROM jsonb_array_elements(current_order.items) v GROUP BY v->>'id' ORDER BY v->>'id' LOOP
    UPDATE public.products SET stock_quantity=stock_quantity+line.qty WHERE id=line.id;
  END LOOP;
  UPDATE public.orders SET inventory_reserved=false,status='CANCELLED',payment_status='EXPIRED' WHERE id=order_id;
END $$;
REVOKE ALL ON FUNCTION public.release_orphan_stripe_order(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.transition_order(order_id uuid, next_status text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_order public.orders%ROWTYPE; line record; available integer;
BEGIN
  IF (auth.jwt()->'app_metadata'->>'role') IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Administrator access required.'; END IF;
  SELECT * INTO current_order FROM public.orders WHERE id=order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found.'; END IF;
  IF next_status=current_order.status THEN RETURN to_jsonb(current_order)-'request_payload'; END IF;
  IF NOT ((current_order.status='PENDING' AND next_status IN ('PROCESSING','CANCELLED')) OR
    (current_order.status='PROCESSING' AND next_status IN ('DISPATCHED','CANCELLED')) OR
    (current_order.status='DISPATCHED' AND next_status='DELIVERED')) OR next_status IS NULL THEN
    RAISE EXCEPTION 'Invalid fulfillment transition.';
  END IF;
  IF current_order.payment_provider='stripe_test' AND (current_order.payment_status<>'PAID' OR next_status='CANCELLED') THEN
    RAISE EXCEPTION 'Stripe orders require confirmed payment; cancellation requires refund reconciliation.';
  END IF;
  IF next_status='PROCESSING' AND NOT current_order.inventory_reserved THEN
    FOR line IN SELECT v->>'id' AS id,sum((v->>'quantity')::integer)::integer AS qty FROM jsonb_array_elements(current_order.items) v GROUP BY v->>'id' ORDER BY v->>'id' LOOP
      SELECT stock_quantity INTO available FROM public.products WHERE id=line.id FOR UPDATE;
      IF NOT FOUND OR available IS NULL OR available<line.qty THEN RAISE EXCEPTION 'Insufficient inventory. Order was not confirmed.'; END IF;
      UPDATE public.products SET stock_quantity=stock_quantity-line.qty,updated_at=now() WHERE id=line.id;
    END LOOP;
  ELSIF next_status='CANCELLED' AND current_order.inventory_reserved THEN
    FOR line IN SELECT v->>'id' AS id,sum((v->>'quantity')::integer)::integer AS qty FROM jsonb_array_elements(current_order.items) v GROUP BY v->>'id' ORDER BY v->>'id' LOOP
      UPDATE public.products SET stock_quantity=stock_quantity+line.qty,updated_at=now() WHERE id=line.id;
    END LOOP;
  END IF;
  UPDATE public.orders SET status=next_status,inventory_reserved=CASE WHEN next_status='PROCESSING' THEN true WHEN next_status='CANCELLED' THEN false ELSE inventory_reserved END WHERE id=order_id RETURNING * INTO current_order;
  RETURN to_jsonb(current_order)-'request_payload';
END $$;
REVOKE ALL ON FUNCTION public.transition_order(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_order(uuid,text) TO authenticated;
COMMIT;

