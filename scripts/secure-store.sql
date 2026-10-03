-- Review and run once in the Supabase SQL editor as project owner.
-- This file does not grant an admin role to any account.
BEGIN;
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
GRANT SELECT, UPDATE ON public.orders TO authenticated;
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
BEGIN
  IF customer IS NULL OR length(customer) NOT BETWEEN 1 AND 120 OR email IS NULL OR length(email)>254 OR email NOT LIKE '%_@_%._%' OR address IS NULL OR length(address) NOT BETWEEN 1 AND 1000 THEN
    RAISE EXCEPTION 'Please provide a valid name, email and shipping address.';
  END IF;
  IF jsonb_typeof(payload->'items') IS DISTINCT FROM 'array' OR jsonb_array_length(payload->'items') NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'Your bag is invalid.'; END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(payload->'items') LOOP
    IF (item->>'quantity') IS NULL OR (item->>'quantity') !~ '^[0-9]{1,2}$' THEN RAISE EXCEPTION 'Invalid quantity.'; END IF;
    qty := (item->>'quantity')::integer;
    IF qty < 1 THEN RAISE EXCEPTION 'Invalid quantity.'; END IF;
    SELECT * INTO product FROM public.products WHERE id=item->>'id';
    IF NOT FOUND THEN RAISE EXCEPTION 'A product is no longer available.'; END IF;
    IF NOT (product.sizes ? (item->>'size')) THEN RAISE EXCEPTION 'Choose an available size for %.', product.title; END IF;
    SELECT sum((v->>'quantity')::integer) INTO count_requested FROM jsonb_array_elements(payload->'items') v WHERE v->>'id'=product.id;
    IF count_requested>coalesce(product.stock_quantity,0) OR count_requested>99 THEN RAISE EXCEPTION 'Insufficient stock for %.',product.title; END IF;
    subtotal := subtotal + product.price*qty;
    normalized := normalized || jsonb_build_array(jsonb_build_object('id',product.id,'title',product.title,'price',product.price,'image',product.image,'size',item->>'size','quantity',qty));
  END LOOP;
  IF upper(payload->>'promo_code')='CHAMPION10' THEN discount:=round(subtotal*0.1,2);
  ELSIF upper(payload->>'promo_code')='GENZVIP' THEN discount:=least(50,subtotal);
  ELSIF coalesce(payload->>'promo_code','')<>'' THEN RAISE EXCEPTION 'The discount code is invalid.'; END IF;
  IF abs(coalesce((payload->>'total')::numeric,-1)-(subtotal-discount))>0.01 THEN RAISE EXCEPTION 'Prices changed. Review your bag and submit again.'; END IF;
  INSERT INTO public.orders (user_id,customer_name,customer_email,customer_phone,items,subtotal,shipping_cost,discount,total,status,payment_status,shipping_address)
  VALUES (auth.uid(),customer,email,left(coalesce(payload->>'customer_phone',''),50),normalized,subtotal,0,discount,subtotal-discount,'PENDING','UNPAID',jsonb_build_object('address',address)) RETURNING id INTO order_id;
  RETURN jsonb_build_object('id',order_id);
END $$;
REVOKE ALL ON FUNCTION public.submit_order_request(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_order_request(jsonb) TO anon, authenticated;
COMMIT;
