-- Add archived column to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "archived" boolean DEFAULT false NOT NULL;
