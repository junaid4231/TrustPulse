-- Add time-based rules field to widgets table
-- This allows users to control when widgets show based on time/day

ALTER TABLE widgets 
ADD COLUMN IF NOT EXISTS time_rules JSONB;

-- Add comment to explain the field
COMMENT ON COLUMN widgets.time_rules IS 'Time-based display rules. Format: {"enabled": true, "active_hours": {"start": 9, "end": 17}, "days": [1,2,3,4,5], "timezone": "America/New_York"}. NULL means show at all times (default behavior).';

-- Example values:
-- Business hours only: {"enabled": true, "active_hours": {"start": 9, "end": 17}, "days": [1,2,3,4,5], "timezone": "UTC"}
-- Weekends only: {"enabled": true, "days": [0,6], "timezone": "UTC"}
-- Specific hours: {"enabled": true, "active_hours": {"start": 18, "end": 23}, "timezone": "UTC"}
