-- Additive customer order access and shipment tracking. No deletion or reset.
BEGIN;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_access_token uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipment jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS orders_customer_created ON public.orders(user_id,created_at DESC);

CREATE OR REPLACE FUNCTION public.customer_order_summary(o public.orders)
RETURNS jsonb LANGUAGE sql SET search_path='' AS $$
  SELECT jsonb_build_object('id',o.id,'created_at',o.created_at,'items',o.items,
    'subtotal',o.subtotal,'discount',o.discount,'shipping_cost',o.shipping_cost,'total',o.total,
    'status',o.status,'payment_status',o.payment_status,'shipment',o.shipment,'currency','USD')
$$;
REVOKE ALL ON FUNCTION public.customer_order_summary(public.orders) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.submit_store_order(payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb; saved public.orders%ROWTYPE;
BEGIN
  result:=public.submit_order_request(payload);
  SELECT * INTO saved FROM public.orders WHERE id=(result->>'id')::uuid;
  RETURN public.customer_order_summary(saved) || jsonb_build_object('access_token',saved.customer_access_token);
END $$;
REVOKE ALL ON FUNCTION public.submit_store_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_store_order(jsonb) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.my_store_orders(page_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to view your orders.'; END IF;
  RETURN coalesce((SELECT jsonb_agg(public.customer_order_summary(o)) FROM
    (SELECT * FROM public.orders WHERE user_id=auth.uid() ORDER BY created_at DESC,id
     LIMIT 20 OFFSET greatest(0,least(coalesce(page_offset,0),10000))) o),'[]'::jsonb);
END $$;
REVOKE ALL ON FUNCTION public.my_store_orders(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_store_orders(integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.track_store_order(order_id uuid, access_code uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE saved public.orders%ROWTYPE;
BEGIN
  SELECT * INTO saved FROM public.orders WHERE id=order_id AND
    ((auth.uid() IS NOT NULL AND user_id=auth.uid()) OR customer_access_token=access_code);
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found. Check the reference and access code from your confirmation.'; END IF;
  RETURN public.customer_order_summary(saved);
END $$;
REVOKE ALL ON FUNCTION public.track_store_order(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_store_order(uuid,uuid) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.update_order_shipment(order_id uuid, details jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE saved public.orders%ROWTYPE; tracking_url text:=trim(coalesce(details->>'url',''));
BEGIN
  IF (auth.jwt()->'app_metadata'->>'role') IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Administrator access required.'; END IF;
  IF jsonb_typeof(details) IS DISTINCT FROM 'object' OR length(coalesce(details->>'carrier',''))>100
    OR length(coalesce(details->>'number',''))>100 OR length(tracking_url)>2000
    OR (tracking_url<>'' AND tracking_url !~ '^https://[^[:space:]<>"\\]+$') THEN
    RAISE EXCEPTION 'Provide a carrier, tracking number and a valid HTTPS tracking URL (optional).';
  END IF;
  SELECT * INTO saved FROM public.orders WHERE id=order_id FOR UPDATE;
  IF NOT FOUND OR saved.status NOT IN ('PROCESSING','DISPATCHED','DELIVERED') THEN RAISE EXCEPTION 'Confirm the order before adding shipment tracking.'; END IF;
  UPDATE public.orders SET shipment=jsonb_build_object('carrier',trim(coalesce(details->>'carrier','')),
    'number',trim(coalesce(details->>'number','')),'url',tracking_url,'updated_at',now()) WHERE id=order_id RETURNING * INTO saved;
  RETURN public.customer_order_summary(saved);
END $$;
REVOKE ALL ON FUNCTION public.update_order_shipment(uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_order_shipment(uuid,jsonb) TO authenticated;
COMMIT;
