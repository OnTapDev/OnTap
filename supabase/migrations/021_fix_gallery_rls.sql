-- Fix gallery_items RLS to work with Clerk authentication
-- Drop existing policies and recreate with proper Clerk integration

DROP POLICY IF EXISTS "Org members can manage gallery" ON gallery_items;
DROP POLICY IF EXISTS "Public can view public gallery" ON gallery_items;

-- Allow org members to manage their own gallery (using get_user_org_id() function)
CREATE POLICY "Org members can manage gallery" ON gallery_items
  FOR ALL USING (org_id = get_user_org_id());

-- Allow public read of public gallery items
CREATE POLICY "Public can view public gallery" ON gallery_items
  FOR SELECT USING (is_public = true);