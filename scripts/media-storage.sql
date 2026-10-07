BEGIN;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('product-images','product-images',true,5242880,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT(id) DO UPDATE SET public=true,file_size_limit=5242880,allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp'];
DROP POLICY IF EXISTS gnz_media_admin ON storage.objects;
CREATE POLICY gnz_media_admin ON storage.objects FOR ALL TO authenticated
USING (bucket_id='product-images' AND (auth.jwt()->'app_metadata'->>'role')='admin')
WITH CHECK (bucket_id='product-images' AND (auth.jwt()->'app_metadata'->>'role')='admin');
COMMIT;
