-- Migration: Add multi-role user system and admin access to registrations
-- This migration creates a users table with array-based role support
-- and adds RLS policies for admin access to registrations

-- ============================================================================
-- 1. Create users table with multi-role support
-- ============================================================================

CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  roles TEXT[] NOT NULL DEFAULT '{member}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT valid_roles CHECK (
    roles <@ ARRAY['admin', 'leader', 'instructor', 'assistant', 'attendee', 'member']
  )
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own record
CREATE POLICY "Users can read own record" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Add indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_roles ON users USING GIN(roles);

-- ============================================================================
-- 2. Create helper function to check if user has a specific role
-- ============================================================================

CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND required_role = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. Create trigger to auto-create user record on auth signup
-- ============================================================================

-- Function to handle new auth user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, roles)
  VALUES (NEW.id, NEW.email, ARRAY['member']);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user record when auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 4. Add admin access policies for registrations table
-- ============================================================================

-- Allow admins to read all registrations
CREATE POLICY "Admins can read all registrations" ON registrations
  FOR SELECT
  TO authenticated
  USING (has_role('admin'));

-- Allow admins to update registrations
CREATE POLICY "Admins can update registrations" ON registrations
  FOR UPDATE
  TO authenticated
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

-- ============================================================================
-- USAGE NOTES
-- ============================================================================
-- After this migration:
--
-- 1. New auth users automatically get a 'member' role via trigger
-- 2. To grant admin access to a user:
--    UPDATE users
--    SET roles = ARRAY['admin']
--    WHERE email = 'admin@example.com';
--
-- For multi-role users:
--    UPDATE users
--    SET roles = ARRAY['admin', 'leader', 'instructor']
--    WHERE email = 'user@example.com';
--
-- To add a role to existing user:
--    UPDATE users
--    SET roles = array_append(roles, 'instructor')
--    WHERE email = 'user@example.com';
--
-- To remove a role:
--    UPDATE users
--    SET roles = array_remove(roles, 'instructor')
--    WHERE email = 'user@example.com';
-- ============================================================================
