// Notes Service - Supabase Storage & Database Operations
// This service handles all file upload and metadata operations
// CRITICAL: All operations are user-scoped via user.uid

import { supabase, isSupabaseConfigured } from '../supabase/supabaseClient';

/**
 * Upload a note file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} subjectId - The subject ID this note belongs to
 * @param {string} userId - The Firebase user UID (for scoping)
 * @returns {Promise<Object>} - Object containing file path and public URL
 */
export const uploadNoteFile = async (file, subjectId, userId) => {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Please add credentials to .env file.');
    }

    if (!userId) {
        throw new Error('User ID is required for file upload');
    }

    // Validate file
    if (!file) {
        throw new Error('No file provided');
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit.');
    }

    try {
        // Create unique file path scoped by user ID
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const filePath = `notes/${userId}/${subjectId}/${fileName}`;

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
            .from('notes')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
            .from('notes')
            .getPublicUrl(filePath);

        return {
            filePath: data.path,
            fileUrl: publicUrl
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

/**
 * Save note metadata to Supabase database
 * @param {Object} noteData - Note metadata (must include user_id)
 * @returns {Promise<Object>} - The created note record
 */
export const saveNoteMetadata = async (noteData) => {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Please add credentials to .env file.');
    }

    // Validate required fields including user_id
    if (!noteData.user_id) {
        throw new Error('User ID is required for note metadata');
    }

    if (!noteData.subject_id || !noteData.subject_name || !noteData.file_name || !noteData.file_url) {
        throw new Error('Missing required note metadata fields.');
    }

    try {
        const { data, error } = await supabase
            .from('notes')
            .insert([
                {
                    user_id: noteData.user_id, // CRITICAL: User scoping
                    subject_id: noteData.subject_id,
                    subject_name: noteData.subject_name,
                    file_name: noteData.file_name,
                    file_path: noteData.file_path,
                    file_url: noteData.file_url,
                    file_type: noteData.file_type,
                    file_size: noteData.file_size
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            throw new Error(`Failed to save note: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Error saving note metadata:', error);
        throw error;
    }
};

/**
 * Fetch all notes for a specific subject (user-scoped)
 * @param {string} subjectId - The subject ID
 * @param {string} userId - The Firebase user UID
 * @returns {Promise<Array>} - Array of note records
 */
export const fetchNotesBySubject = async (subjectId, userId) => {
    if (!isSupabaseConfigured()) {
        // Return empty array if Supabase not configured (graceful degradation)
        return [];
    }

    if (!userId) {
        throw new Error('User ID is required to fetch notes');
    }

    if (!subjectId) {
        throw new Error('Subject ID is required to fetch notes.');
    }

    try {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', userId) // CRITICAL: Filter by user
            .eq('subject_id', subjectId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase fetch error:', error);
            throw new Error(`Failed to fetch notes: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching notes:', error);
        throw error;
    }
};

/**
 * Delete a note (file + metadata) - user-scoped
 * @param {string} noteId - The note record ID
 * @param {string} filePath - The file path in storage
 * @param {string} userId - The Firebase user UID
 * @returns {Promise<void>}
 */
export const deleteNote = async (noteId, filePath, userId) => {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured.');
    }

    if (!userId) {
        throw new Error('User ID is required to delete notes');
    }

    try {
        // Delete from database (with user_id check for security)
        const { error: dbError } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId)
            .eq('user_id', userId); // CRITICAL: Ensure user owns the note

        if (dbError) {
            console.error('Database delete error:', dbError);
            throw new Error(`Failed to delete note record: ${dbError.message}`);
        }

        // Delete from storage
        if (filePath) {
            const { error: storageError } = await supabase.storage
                .from('notes')
                .remove([filePath]);

            if (storageError) {
                console.error('Storage delete error:', storageError);
                // Don't throw here - metadata is already deleted
            }
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
    }
};
