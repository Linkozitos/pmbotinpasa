
-- Create storage bucket for knowledge documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge', 'knowledge', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload knowledge files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'knowledge');

-- Allow authenticated users to read knowledge files
CREATE POLICY "Authenticated users can read knowledge files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'knowledge');

-- Allow authenticated users to delete their own files (privileged users handle via app logic)
CREATE POLICY "Authenticated users can delete knowledge files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'knowledge');

-- Allow authenticated users to update knowledge files
CREATE POLICY "Authenticated users can update knowledge files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'knowledge');
