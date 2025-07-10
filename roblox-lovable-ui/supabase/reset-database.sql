-- WARNING: This will delete all data! Only use if you want to start fresh

-- Drop all existing tables
DROP TABLE IF EXISTS usage_tracking CASCADE;
DROP TABLE IF EXISTS template_scripts CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS generation_sessions CASCADE;
DROP TABLE IF EXISTS code_versions CASCADE;
DROP TABLE IF EXISTS scripts CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Now run the schema.sql file to recreate everything fresh