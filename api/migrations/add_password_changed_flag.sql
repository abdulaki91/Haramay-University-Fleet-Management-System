-- Add password_changed flag to users table
-- This tracks whether user has changed their default password

ALTER TABLE users 
ADD COLUMN password_changed BOOLEAN DEFAULT FALSE AFTER is_active;

-- Update existing users to require password change
-- (except admin who should have already changed it)
UPDATE users 
SET password_changed = FALSE 
WHERE role_id != 1;

-- Set admin as already changed (assuming they changed it)
UPDATE users 
SET password_changed = TRUE 
WHERE role_id = 1;
