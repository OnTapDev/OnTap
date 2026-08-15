-- Add RLS policies for the 'ontap' storage bucket
-- Allow authenticated users to read/write to the bucket

-- Enable RLS on storage.objects for the ontap bucket
-- (RLS is enabled by default on storage.objects in Supabase)

-- Policy: Allow public read access to all files in the ontap bucket
CREATE POLICY "Public read access on ontap bucket" ON storage.objects
FOR SELECT ON storage.objects
TO public
USING (bucket_id = 'ontap');

-- Policy: Allow authenticated users to upload to the ontap bucket
CREATE POLICY "Authenticated users can upload to ontap bucket" ON storage.objects
FOR INSERT ON storage.objects
TO authenticated
WITH CHECK (bucket_id = 'ontap');

-- Policy: Allow authenticated users to update files in the ontap bucket
CREATE POLICY "Authenticated users can update ontap bucket files" ON storage.objects
FOR UPDATE ON storage.objects
TO authenticated
USING (bucket_id = 'ontap')
WITH CHECK (bucket_id = 'ontap');

-- Policy: Allow authenticated users to delete files from the ontap bucket
CREATE POLICY "Authenticated users can delete from ontap bucket" ON storage.objects
FOR DELETE ON storage.objects
TO authenticated
USING (bucket_id = 'ontap');
