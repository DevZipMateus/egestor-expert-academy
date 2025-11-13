-- Create storage bucket for slide images
INSERT INTO storage.buckets (id, name, public)
VALUES ('slide-images', 'slide-images', true);

-- Policy: Anyone can view images
CREATE POLICY "Slide images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'slide-images');

-- Policy: Admins can upload images
CREATE POLICY "Admins can upload slide images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'slide-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Policy: Admins can update images
CREATE POLICY "Admins can update slide images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'slide-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Policy: Admins can delete images
CREATE POLICY "Admins can delete slide images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'slide-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);