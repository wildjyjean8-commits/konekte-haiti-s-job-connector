
-- CV bucket: owner folder = auth.uid()
CREATE POLICY "cv_owner_all" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "cv_read_by_recruiter" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'cvs' AND EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.institutions i ON i.id = a.institution_id
    WHERE i.owner_id = auth.uid()
      AND a.applicant_id::text = (storage.foldername(name))[1]
  )
);

-- assets bucket: logos + avatars, readable by any signed-in user
CREATE POLICY "assets_read" ON storage.objects FOR SELECT TO authenticated, anon
USING (bucket_id = 'assets');

CREATE POLICY "assets_owner_write" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "assets_owner_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "assets_owner_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text);
