-- Run each query separately to see results

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 3. Check policies on profiles
SELECT pol.polname, pol.polcmd, pol.polroles 
FROM pg_policy pol 
JOIN pg_class cls ON pol.polrelid = cls.oid 
WHERE cls.relname = 'profiles';

-- 4. Check if trigger exists
SELECT tgname, proname 
FROM pg_trigger t 
JOIN pg_proc p ON t.tgfoid = p.oid 
WHERE tgname = 'on_auth_user_created';

-- 5. Check if any users exist
SELECT COUNT(*) as user_count FROM auth.users;

-- 6. Check if any profiles exist
SELECT COUNT(*) as profile_count FROM profiles;

-- 7. Check the profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;