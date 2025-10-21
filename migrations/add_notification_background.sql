-- Migration: Add notification background customization
-- Description: Adds bg_color and bg_opacity columns for customizable notification backgrounds
-- Date: 2025-01-21

-- Add bg_color column (notification background color)
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS bg_color TEXT DEFAULT '#FFFFFF';

-- Add bg_opacity column (background opacity 0-100)
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS bg_opacity INTEGER DEFAULT 100;

-- Add comments for documentation
COMMENT ON COLUMN widgets.bg_color IS 'Notification background color (hex code)';
COMMENT ON COLUMN widgets.bg_opacity IS 'Background opacity percentage (0-100)';

-- Update existing widgets to have default values
UPDATE widgets
SET 
  bg_color = COALESCE(bg_color, '#FFFFFF'),
  bg_opacity = COALESCE(bg_opacity, 100)
WHERE bg_color IS NULL OR bg_opacity IS NULL;
