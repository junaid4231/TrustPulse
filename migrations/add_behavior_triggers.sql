-- Migration: Add Behavior Triggers
-- Description: Add behavior trigger settings for notifications (exit intent, scroll depth, time on page, etc.)
-- This is backward compatible - existing notifications will work without triggers

-- Add behavior_triggers column to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS behavior_triggers JSONB DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN notifications.behavior_triggers IS 'Behavior trigger settings: exit_intent, scroll_depth, time_on_page, inactivity, element_visible';

-- Example structure for behavior_triggers JSONB:
-- {
--   "enabled": true,
--   "triggers": [
--     {
--       "type": "exit_intent",
--       "enabled": true,
--       "settings": {
--         "sensitivity": "medium"  // low, medium, high
--       }
--     },
--     {
--       "type": "scroll_depth",
--       "enabled": true,
--       "settings": {
--         "percentage": 50,  // 25, 50, 75, 100
--         "direction": "down"  // down, up
--       }
--     },
--     {
--       "type": "time_on_page",
--       "enabled": true,
--       "settings": {
--         "seconds": 30
--       }
--     },
--     {
--       "type": "inactivity",
--       "enabled": true,
--       "settings": {
--         "seconds": 20
--       }
--     },
--     {
--       "type": "element_visible",
--       "enabled": true,
--       "settings": {
--         "selector": "#pricing",  // CSS selector
--         "percentage": 50  // % of element visible
--       }
--     }
--   ],
--   "trigger_mode": "any"  // "any" (OR) or "all" (AND)
-- }

-- Create index for faster queries on notifications with behavior triggers
CREATE INDEX IF NOT EXISTS idx_notifications_behavior_triggers 
ON notifications USING GIN (behavior_triggers) 
WHERE behavior_triggers IS NOT NULL;

-- Migration completed successfully
-- Backward compatible: Notifications without behavior_triggers will show normally
