-- Test basic auth functionality

-- 1. First, let's see if we can query auth schema
SELECT current_setting('request.jwt.claims', true)::json->>'sub' as current_user_id;

-- 2. Check auth configuration
SELECT 
  CASE 
    WHEN current_setting('app.settings.jwt_secret', true) IS NOT NULL 
    THEN 'JWT configured' 
    ELSE 'JWT not configured' 
  END as jwt_status;

-- 3. Test if we can insert a test user directly (admin only)
-- This helps verify if the auth system is working
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Generate a test user ID
  test_user_id := gen_random_uuid();
  
  -- Try to insert into auth.users
  BEGIN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      test_user_id,
      '00000000-0000-0000-0000-000000000000',
      'test_' || test_user_id::text || '@example.com',
      crypt('testpassword123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}'
    );
    
    RAISE NOTICE 'Test user created successfully with ID: %', test_user_id;
    
    -- Check if trigger created profile
    IF EXISTS (SELECT 1 FROM profiles WHERE id = test_user_id) THEN
      RAISE NOTICE 'Profile was created by trigger!';
    ELSE
      RAISE NOTICE 'Profile was NOT created - trigger may not be working';
    END IF;
    
    -- Clean up
    DELETE FROM auth.users WHERE id = test_user_id;
    RAISE NOTICE 'Test user cleaned up';
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to create test user: %', SQLERRM;
  END;
END $$;