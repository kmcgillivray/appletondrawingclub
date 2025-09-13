-- Add quantity column to registrations table for ADC-08
-- Allows users to register multiple people (1-6) per registration

-- Add quantity column with default value of 1 for backward compatibility
ALTER TABLE registrations ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;

-- Add check constraint to ensure reasonable quantities (1-6 people)
ALTER TABLE registrations ADD CONSTRAINT valid_quantity CHECK (quantity >= 1 AND quantity <= 6);