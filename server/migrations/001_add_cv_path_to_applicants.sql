-- Add cv_path column to applicants table
ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS cv_path VARCHAR(255);
