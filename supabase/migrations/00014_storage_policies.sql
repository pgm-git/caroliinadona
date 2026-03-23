-- ============================================================================
-- Migration 00014: Storage bucket + policies for case documents
-- ============================================================================

-- Create bucket for case documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-documents',
  'case-documents',
  false,
  26214400, -- 25 MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/tiff']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: authenticated users can upload to their org folder
CREATE POLICY "org_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'case-documents'
    AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')
  );

-- Policy: authenticated users can read documents from their org
CREATE POLICY "org_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'case-documents'
    AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')
  );

-- Policy: authenticated users can update documents in their org
CREATE POLICY "org_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'case-documents'
    AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')
  );

-- Policy: authenticated users can delete documents from their org
CREATE POLICY "org_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'case-documents'
    AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')
  );
