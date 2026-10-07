-- Review and run once in the Supabase SQL editor as project owner.
-- This file does not grant an admin role to any account.
BEGIN;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS request_key uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS request_payload jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS inventory_reserved boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS orders_request_key ON public.orders(request_key);
CREATE INDEX IF NOT EXISTS orders_email_created ON public.orders(lower(customer_email),created_at);
CREATE OR REPLACE FUNCTION public.validate_store_product()
RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
  IF length(trim(NEW.title)) NOT BETWEEN 1 AND 200 OR NEW.category NOT IN ('hoodies','tracksuits','tshirts','fashion','bags','others')
    OR NEW.price IS NULL OR NEW.price<0 OR NEW.price::text IN ('NaN','Infinity','-Infinity') OR NEW.price<>round(NEW.price,2)
    OR NEW.stock_quantity IS NULL OR NEW.stock_quantity<0 THEN RAISE EXCEPTION 'Invalid product title, collection, price or stock.'; END IF;
  IF jsonb_typeof(NEW.sizes) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Sizes must be an array.'; END IF;
  IF jsonb_array_length(NEW.sizes) NOT BETWEEN 1 AND 30 OR EXISTS(SELECT 1 FROM jsonb_array_elements(NEW.sizes) s WHERE jsonb_typeof(s)<>'string' OR length(trim(s #>> '{}')) NOT BETWEEN 1 AND 60) THEN RAISE EXCEPTION 'Provide valid product sizes.'; END IF;
  IF NEW.image IS NULL OR NEW.image !~ '^(https://[^[:space:]]+|/[^/[:space:]][^[:space:]]*)$' THEN RAISE EXCEPTION 'Invalid image URL.'; END IF;
  NEW.updated_at:=now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS validate_store_product ON public.products;
CREATE TRIGGER validate_store_product BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.validate_store_product();
ALTER TABLE public.orders ALTER COLUMN payment_status SET DEFAULT 'UNPAID';
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Replace legacy permissive policies, including policies from older setup scripts.
DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT tablename, policyname FROM pg_policies WHERE schemaname='public' AND tablename IN ('products','site_settings','orders') LOOP
    EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,p.tablename);
  END LOOP;
END $$;
REVOKE ALL ON public.products, public.site_settings, public.orders FROM anon, authenticated;
GRANT SELECT ON public.products, public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products, public.site_settings TO authenticated;
GRANT SELECT ON public.orders TO authenticated;
CREATE POLICY catalog_read ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY settings_read ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY catalog_admin ON public.products FOR ALL TO authenticated USING ((auth.jwt()->'app_metadata'->>'role')='admin') WITH CHECK ((auth.jwt()->'app_metadata'->>'role')='admin');
CREATE POLICY settings_admin ON public.site_settings FOR ALL TO authenticated USING ((auth.jwt()->'app_metadata'->>'role')='admin') WITH CHECK ((auth.jwt()->'app_metadata'->>'role')='admin');
CREATE POLICY orders_admin_read ON public.orders FOR SELECT TO authenticated USING ((auth.jwt()->'app_metadata'->>'role')='admin');
CREATE POLICY orders_admin_update ON public.orders FOR UPDATE TO authenticated USING ((auth.jwt()->'app_metadata'->>'role')='admin') WITH CHECK ((auth.jwt()->'app_metadata'->>'role')='admin');

-- Public order requests use catalog prices. No public order-table reads or writes.
CREATE OR REPLACE FUNCTION public.submit_order_request(payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  item jsonb; product public.products%ROWTYPE; count_requested integer;
  qty integer; subtotal numeric := 0; discount numeric := 0;
  normalized jsonb := '[]'::jsonb; order_id uuid;
  customer text := trim(payload->>'customer_name');
  email text := trim(payload->>'customer_email');
  address text := trim(payload->'shipping_address'->>'address');
  request_id uuid; previous public.orders%ROWTYPE;
BEGIN
  IF pg_column_size(payload)>64000 THEN RAISE EXCEPTION 'Order is too large.'; END IF;
  BEGIN request_id := (payload->>'request_key')::uuid;
  EXCEPTION WHEN invalid_text_representation THEN RAISE EXCEPTION 'Invalid request key.'; END;
  IF request_id IS NULL THEN RAISE EXCEPTION 'Request key is required.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(request_id::text,0));
  SELECT * INTO previous FROM public.orders WHERE request_key=request_id;
  IF FOUND THEN
    IF previous.request_payload IS DISTINCT FROM payload THEN RAISE EXCEPTION 'Request changed. Start a new order review.'; END IF;
    RETURN jsonb_build_object('id',previous.id);
  END IF;
  IF customer IS NULL OR length(customer) NOT BETWEEN 1 AND 120 OR email IS NULL OR length(email)>254 OR email NOT LIKE '%_@_%._%' OR address IS NULL OR length(address) NOT BETWEEN 1 AND 1000 THEN
    RAISE EXCEPTION 'Please provide a valid name, email and shipping address.';
  END IF;
  IF jsonb_typeof(payload->'items') IS DISTINCT FROM 'array' OR jsonb_array_length(payload->'items') NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'Your bag is invalid.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(lower(email),1));
  IF (SELECT count(*) FROM public.orders WHERE lower(customer_email)=lower(email) AND created_at>now()-interval '1 hour')>=5 THEN RAISE EXCEPTION 'Too many requests. Please contact the store or try again later.'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(payload->'items') v WHERE coalesce(v->>'quantity','') !~ '^[1-9][0-9]?$') THEN RAISE EXCEPTION 'Invalid quantity.'; END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(payload->'items') LOOP
    IF (item->>'quantity') IS NULL OR (item->>'quantity') !~ '^[0-9]{1,2}$' THEN RAISE EXCEPTION 'Invalid quantity.'; END IF;
    qty := (item->>'quantity')::integer;
    IF qty < 1 THEN RAISE EXCEPTION 'Invalid quantity.'; END IF;
    SELECT * INTO product FROM public.products WHERE id=item->>'id';
    IF NOT FOUND THEN RAISE EXCEPTION 'A product is no longer available.'; END IF;
    IF product.category NOT IN ('hoodies','tracksuits','tshirts','fashion','bags','others') OR (product.id || ' ' || product.title) ~* 'belt' THEN RAISE EXCEPTION 'This product is no longer offered.'; END IF;
    IF (product.sizes ? (item->>'size')) IS DISTINCT FROM true THEN RAISE EXCEPTION 'Choose an available size for %.', product.title; END IF;
    IF product.price IS NULL OR product.price<0 OR product.price::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Product price is unavailable.'; END IF;
    SELECT sum((v->>'quantity')::integer) INTO count_requested FROM jsonb_array_elements(payload->'items') v WHERE v->>'id'=product.id;
    IF count_requested>coalesce(product.stock_quantity,0) OR count_requested>99 THEN RAISE EXCEPTION 'Insufficient stock for %.',product.title; END IF;
    subtotal := subtotal + product.price*qty;
    normalized := normalized || jsonb_build_array(jsonb_build_object('id',product.id,'title',product.title,'price',product.price,'image',product.image,'size',item->>'size','quantity',qty));
  END LOOP;
  IF upper(payload->>'promo_code')='CHAMPION10' THEN discount:=round(subtotal*0.1,2);
  ELSIF upper(payload->>'promo_code')='GENZVIP' THEN discount:=least(50,subtotal);
  ELSIF coalesce(payload->>'promo_code','')<>'' THEN RAISE EXCEPTION 'The discount code is invalid.'; END IF;
  subtotal:=round(subtotal,2);
  IF coalesce(payload->>'total','') !~ '^[0-9]+(\.[0-9]{1,2})?$' OR abs((payload->>'total')::numeric-(subtotal-discount))>0.01 THEN RAISE EXCEPTION 'Prices changed. Review your bag and submit again.'; END IF;
  INSERT INTO public.orders (user_id,customer_name,customer_email,customer_phone,items,subtotal,shipping_cost,discount,total,status,payment_status,shipping_address,request_key,request_payload)
  VALUES (auth.uid(),customer,email,left(coalesce(payload->>'customer_phone',''),50),normalized,subtotal,0,discount,subtotal-discount,'PENDING','UNPAID',jsonb_build_object('address',address),request_id,payload) RETURNING id INTO order_id;
  RETURN jsonb_build_object('id',order_id);
END $$;
REVOKE ALL ON FUNCTION public.submit_order_request(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_order_request(jsonb) TO anon, authenticated;

-- Confirming an order reserves stock atomically; cancellation returns it once.
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
  IF next_status='PROCESSING' THEN
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
