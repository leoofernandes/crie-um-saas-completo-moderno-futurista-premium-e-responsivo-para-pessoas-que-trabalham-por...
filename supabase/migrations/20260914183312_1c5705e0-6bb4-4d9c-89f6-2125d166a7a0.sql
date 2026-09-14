CREATE POLICY "media_public_read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('vehicle-photos','site-assets'));
CREATE POLICY "media_owner_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('vehicle-photos','site-assets') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "media_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('vehicle-photos','site-assets') AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id IN ('vehicle-photos','site-assets') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "media_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('vehicle-photos','site-assets') AND (storage.foldername(name))[1] = auth.uid()::text);