-- Add the missing INSERT policy for profiles
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Also ensure the table is accessible via the API
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant ALL permissions on profiles table
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;

-- Make sure the API can access the table
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- Enable realtime (optional but useful)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Test the policies are working
SELECT * FROM profiles WHERE FALSE; -- Should return empty, not error