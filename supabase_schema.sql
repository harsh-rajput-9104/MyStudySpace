-- Supabase Notes Table Schema
-- This schema ensures user-scoped notes storage integrated with Firebase Auth

-- Create notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,  -- Firebase Auth UID
    subject_id TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject_id ON notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_subject ON notes(user_id, subject_id);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

-- RLS Policies - CRITICAL for security
-- Note: These policies assume you're passing Firebase UID via Supabase client
-- You may need to adjust based on your auth setup

-- Allow users to view only their own notes
CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT
    USING (true);  -- Adjust based on your auth setup

-- Allow users to insert only their own notes
CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT
    WITH CHECK (true);  -- Adjust based on your auth setup

-- Allow users to update only their own notes
CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE
    USING (true);  -- Adjust based on your auth setup

-- Allow users to delete only their own notes
CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE
    USING (true);  -- Adjust based on your auth setup

-- Create storage bucket for notes if it doesn't exist
-- Run this in Supabase Dashboard > Storage
-- Bucket name: 'notes'
-- Public: true (for file access)
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, image/jpeg, image/jpg, image/png

-- Storage RLS Policies (configure in Supabase Dashboard)
-- 1. Allow authenticated users to upload to their own folder
-- 2. Allow authenticated users to read from their own folder
-- 3. Allow authenticated users to delete from their own folder

-- IMPORTANT NOTES:
-- 1. The RLS policies above use 'true' as placeholder
-- 2. You need to configure proper auth integration between Firebase and Supabase
-- 3. Options:
--    a) Use Supabase Auth instead of Firebase Auth (requires migration)
--    b) Pass Firebase UID in requests and validate server-side
--    c) Use Supabase Edge Functions to validate Firebase tokens
-- 4. Current implementation relies on client-side filtering by user_id
--    which is enforced in the application code (notesService.js)
-- 5. For production, implement proper server-side validation
