-- Add public read policy for organizations (for public profile pages)
CREATE POLICY "Public organizations are viewable by everyone" ON organizations
  FOR SELECT USING (true);

-- Also ensure packages and gallery_items have public read policies
CREATE POLICY "Public packages are viewable by everyone" ON packages
  FOR SELECT USING (true);

CREATE POLICY "Public gallery items are viewable by everyone" ON gallery_items
  FOR SELECT USING (is_public = true);