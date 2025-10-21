-- Migration: Add widget customization fields
-- Description: Adds radius, shadow, and anim columns to widgets table for real-time customization
-- Date: 2025-01-20

-- Add radius column (border radius in pixels)
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS radius INTEGER DEFAULT 14;

-- Add shadow column (shadow style: minimal, medium, bold)
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS shadow TEXT DEFAULT 'medium'
CHECK (shadow IN ('minimal', 'medium', 'bold'));

-- Add anim column (animation style: subtle, standard, vivid)
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS anim TEXT DEFAULT 'standard'
CHECK (anim IN ('subtle', 'standard', 'vivid'));

-- Add comments for documentation
COMMENT ON COLUMN widgets.radius IS 'Border radius in pixels (0-32)';
COMMENT ON COLUMN widgets.shadow IS 'Shadow style: minimal, medium, or bold';
COMMENT ON COLUMN widgets.anim IS 'Animation style: subtle, standard, or vivid';

-- Update existing widgets to have default values (if any exist without these fields)
UPDATE widgets
SET 
  radius = COALESCE(radius, 14),
  shadow = COALESCE(shadow, 'medium'),
  anim = COALESCE(anim, 'standard')
WHERE radius IS NULL OR shadow IS NULL OR anim IS NULL;
