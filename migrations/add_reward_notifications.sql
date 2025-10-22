-- Add reward/gamification fields to notifications table
-- This enables scratch card and other gamification features

-- Add reward-specific fields
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS reward_type TEXT CHECK (reward_type IN ('discount_code', 'free_shipping', 'gift', 'points'));

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS reward_value TEXT; -- e.g., "20%", "FREE", "100 points"

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS reward_code TEXT; -- e.g., "PROOF20", "FREESHIP"

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS reward_expiry TIMESTAMP; -- When reward expires

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS reward_claimed_count INTEGER DEFAULT 0; -- How many times claimed

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS reward_max_claims INTEGER; -- Max claims allowed (NULL = unlimited)

-- Add comments
COMMENT ON COLUMN notifications.reward_type IS 'Type of reward: discount_code, free_shipping, gift, points. NULL for non-reward notifications.';
COMMENT ON COLUMN notifications.reward_value IS 'Display value of reward (e.g., "20% OFF", "FREE SHIPPING")';
COMMENT ON COLUMN notifications.reward_code IS 'Actual code to copy (e.g., "PROOF20", "SHIP2024")';
COMMENT ON COLUMN notifications.reward_expiry IS 'When the reward expires (NULL = no expiry)';
COMMENT ON COLUMN notifications.reward_claimed_count IS 'Number of times this reward has been claimed';
COMMENT ON COLUMN notifications.reward_max_claims IS 'Maximum number of claims allowed (NULL = unlimited)';

-- Create index for active rewards
CREATE INDEX IF NOT EXISTS idx_notifications_reward_active 
ON notifications(reward_type, is_active) 
WHERE reward_type IS NOT NULL AND is_active = true;

-- Example reward notification:
-- type: 'reward'
-- message: 'Scratch to reveal your exclusive discount!'
-- reward_type: 'discount_code'
-- reward_value: '20% OFF'
-- reward_code: 'PROOF20'
-- reward_expiry: NOW() + INTERVAL '7 days'
-- reward_max_claims: 100
