-- Migration: Add widget timing controls
-- Description: Adds duration, gap, loop, shuffle, and start_delay columns for per-widget timing customization
-- Date: 2025-01-21

-- Add duration column (notification display duration in seconds)
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 6;

-- Add gap column (pause between notifications in seconds)
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS gap INTEGER DEFAULT 2;

-- Add start_delay column (delay before first notification in seconds)
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS start_delay INTEGER DEFAULT 2;

-- Add loop column (whether to keep cycling notifications)
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS loop BOOLEAN DEFAULT true;

-- Add shuffle column (whether to randomize notification order)
ALTER TABLE widgets
ADD COLUMN IF NOT EXISTS shuffle BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN widgets.duration IS 'Notification display duration in seconds (3-30)';
COMMENT ON COLUMN widgets.gap IS 'Pause between notifications in seconds (1-60)';
COMMENT ON COLUMN widgets.start_delay IS 'Delay before first notification in seconds (0-10)';
COMMENT ON COLUMN widgets.loop IS 'Whether to keep cycling through notifications infinitely';
COMMENT ON COLUMN widgets.shuffle IS 'Whether to randomize notification order';

-- Update existing widgets to have default values
UPDATE widgets
SET 
  duration = COALESCE(duration, 6),
  gap = COALESCE(gap, 2),
  start_delay = COALESCE(start_delay, 2),
  loop = COALESCE(loop, true),
  shuffle = COALESCE(shuffle, false)
WHERE duration IS NULL OR gap IS NULL OR start_delay IS NULL OR loop IS NULL OR shuffle IS NULL;
