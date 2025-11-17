-- Fix Google OAuth Profile Creation
-- Issue: Google OAuth users were not getting profiles created properly

-- Drop existing function
DROP FUNCTION IF EXISTS create_profile_for_new_user() CASCADE;

-- Recreate with Google OAuth support
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
  user_avatar_url TEXT;
  user_role TEXT;
BEGIN
  -- Extract full_name from various possible sources (Google OAuth returns 'name', regular signup returns 'full_name')
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',  -- Regular email signup
    NEW.raw_user_meta_data->>'name',        -- Google OAuth
    NEW.raw_user_meta_data->>'given_name',  -- Fallback
    split_part(NEW.email, '@', 1)           -- Email username as last resort
  );

  -- Extract avatar_url (Google provides this)
  user_avatar_url := NEW.raw_user_meta_data->>'avatar_url';

  -- Extract role (default to 'trainee')
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'trainee'
  );

  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_avatar_url,
    user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();

-- Add default role if column doesn't have one
ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'trainee';

-- Update existing NULL roles
UPDATE public.profiles
SET role = 'trainee'
WHERE role IS NULL;
