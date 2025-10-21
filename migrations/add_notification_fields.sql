-- Migration: Add notification fields for time display and emoji control
-- Description: Adds time_ago, use_emoji, rating, visitor_count, stock_count, milestone_text, and product_name columns
-- Date: 2025-01-20

-- Add time_ago column (for user-selected time display)
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS time_ago TEXT;

-- Add use_emoji column (boolean for emoji toggle)
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS use_emoji BOOLEAN DEFAULT true;

-- Add rating column (for review notifications, 1-5 stars)
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS rating INTEGER;

-- Add visitor_count column (for live activity notifications)
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS visitor_count INTEGER;

-- Add stock_count column (for low stock notifications)
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS stock_count INTEGER;

-- Add milestone_text column (for milestone notifications, e.g., "1,000th")
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS milestone_text TEXT;

-- Add product_name column (for purchase and low stock notifications)
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN notifications.time_ago IS 'User-selected time display (just_now, 1_min, 2_min, 5_min, 10_min, 30_min, 1_hour)';
COMMENT ON COLUMN notifications.use_emoji IS 'Whether to show emoji in notification';
COMMENT ON COLUMN notifications.rating IS 'Star rating for review notifications (1-5)';
COMMENT ON COLUMN notifications.visitor_count IS 'Number of visitors for live activity notifications';
COMMENT ON COLUMN notifications.stock_count IS 'Remaining stock count for low stock notifications';
COMMENT ON COLUMN notifications.milestone_text IS 'Milestone text (e.g., "1,000th", "500th")';
COMMENT ON COLUMN notifications.product_name IS 'Product name for purchase and low stock notifications';
