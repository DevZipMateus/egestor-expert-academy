-- Add image_url field to slides table for attention slides
ALTER TABLE slides ADD COLUMN IF NOT EXISTS image_url text;