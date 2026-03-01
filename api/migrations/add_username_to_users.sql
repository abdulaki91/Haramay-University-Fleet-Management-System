-- Add username column to users table
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER email;

-- Update existing users with username based on email
UPDATE users SET username = SUBSTRING_INDEX(email, '@', 1);
