-- Add click_url field to notifications table
-- This allows notifications to be clickable and redirect to product pages

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS click_url TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN notifications.click_url IS 'Optional URL to redirect when notification is clicked. Can be absolute (https://example.com/product) or relative (/products/premium). NULL means notification is not clickable.';

-- Add index for better query performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_notifications_click_url ON notifications(click_url) WHERE click_url IS NOT NULL;

-- Example values:
-- Absolute URL: 'https://yoursite.com/products/premium-plan'
-- Relative URL: '/products/premium-plan'
-- With query params: '/checkout?product=premium&utm_source=proofpulse'
-- NULL: Non-clickable notification (default)
