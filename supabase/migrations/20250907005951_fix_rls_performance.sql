-- Fix RLS performance issue by replacing auth.role() with subquery pattern
-- This prevents re-evaluation of auth.role() for each row

-- Drop the existing policy
DROP POLICY IF EXISTS "Service role can manage registrations" ON registrations;

-- Create new policy with optimized subquery pattern
CREATE POLICY "Service role can manage registrations" ON registrations FOR ALL USING ((SELECT auth.role()) = 'service_role');