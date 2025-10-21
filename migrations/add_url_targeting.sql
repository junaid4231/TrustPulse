-- Add URL targeting field to widgets table
-- This is a non-breaking change - NULL means show on all pages (default behavior)

ALTER TABLE widgets 
ADD COLUMN IF NOT EXISTS url_targeting TEXT[];

-- Add comment to explain the field
COMMENT ON COLUMN widgets.url_targeting IS 'Array of URL patterns to control where widget shows. Supports wildcards (* and **) and exclude rules (!pattern). Examples: ["/products/*", "!/checkout", "/blog/**"]. NULL or empty array means show on all pages.';
