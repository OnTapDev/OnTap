-- Add RLS policies for the 'ontap' storage bucket
-- Correct Supabase storage policy syntax

-- Policy: Allow public read access to all files in the ontap bucket
CREATE POLICY "Public read access on ontap bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'ontap');

-- Policy: Allow authenticated users to upload to the ontap bucket
CREATE POLICY "Authenticated users can upload to ontap bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'ontap');

-- Policy: Allow authenticated users to update files in the ontap bucket
CREATE POLICY "Authenticated users can update ontap bucket files" ON storage.objects
FOR UPDATE USING (bucket_id = 'ontap') WITH CHECK (bucket_id = 'ontap');

-- Policy: Allow authenticated users to delete files from the ontap bucket
CREATE POLICY "Authenticated users can delete from ontap bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'ontap');