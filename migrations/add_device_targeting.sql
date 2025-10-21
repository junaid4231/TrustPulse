-- Add device targeting field to widgets table
-- This is a non-breaking change - NULL means show on all devices (default behavior)

ALTER TABLE widgets 
ADD COLUMN IF NOT EXISTS device_targeting TEXT[];

-- Add comment to explain the field
COMMENT ON COLUMN widgets.device_targeting IS 'Array of device types to show widget on: ["mobile", "tablet", "desktop"]. NULL or empty array means show on all devices.';
