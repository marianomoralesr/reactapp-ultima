-- Step 6: Storage Buckets & Policies
-- This script creates the necessary storage buckets for documents and profile pictures,
-- and applies Row Level Security to ensure files are accessed securely.

-- 1. BUCKET CREATION
-- Create a private bucket for sensitive user-uploaded documents with a 5MB size limit.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 5242880, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/zip'])
ON CONFLICT (id) DO NOTHING;
COMMENT ON BUCKET documents IS 'Stores sensitive documents for financing applications.';

-- Create a private bucket for user profile pictures with a 2MB size limit.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile_pictures', 'profile_pictures', false, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;
COMMENT ON BUCKET profile_pictures IS 'Stores user profile pictures.';


-- 2. RLS POLICIES FOR STORAGE OBJECTS
-- Note: Supabase automatically enables RLS on storage.objects when a bucket is not public.
-- These policies define the access rules.

-- Policies for the 'documents' bucket
CREATE POLICY "Users can manage their own application documents." ON storage.objects
  FOR ALL
  USING (bucket_id = 'documents' AND auth.uid() = owner);

CREATE POLICY "Admins and sales staff can view all documents." ON storage.objects
  FOR SELECT
  USING (bucket_id = 'documents' AND public.get_my_role() IN ('admin', 'sales'));

-- Policies for the 'profile_pictures' bucket
CREATE POLICY "Users can manage their own profile picture." ON storage.objects
  FOR ALL
  USING (bucket_id = 'profile_pictures' AND auth.uid() = owner);

CREATE POLICY "Authenticated users can view all profile pictures." ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile_pictures' AND auth.role() = 'authenticated');
