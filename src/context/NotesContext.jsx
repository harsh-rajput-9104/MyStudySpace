import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchNotesBySubject, saveNoteMetadata, uploadNoteFile } from '../services/notesService';

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
    const { user } = useAuth();

    // State - stores metadata only, never File objects
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentSubjectId, setCurrentSubjectId] = useState(null);

    // Clear notes when user logs out
    useEffect(() => {
        if (!user) {
            setNotes([]);
            setCurrentSubjectId(null);
            setError(null);
        }
    }, [user]);

    // Load notes for a specific subject
    const loadNotes = useCallback(async (subjectId) => {
        if (!user) {
            setError('User must be authenticated to load notes');
            return;
        }

        if (!subjectId) {
            setError('Subject ID is required');
            return;
        }

        setLoading(true);
        setError(null);
        setCurrentSubjectId(subjectId);

        try {
            // Pass user.uid to ensure notes are user-scoped
            const fetchedNotes = await fetchNotesBySubject(subjectId, user.uid);
            setNotes(fetchedNotes);
        } catch (err) {
            console.error('Error loading notes:', err);
            setError(err.message || 'Failed to load notes');
            setNotes([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Add a new note (upload file + save metadata)
    const addNote = useCallback(async (file, subjectId, subjectName) => {
        if (!user) {
            throw new Error('User must be authenticated to add notes');
        }

        if (!file || !subjectId || !subjectName) {
            throw new Error('File, subject ID, and subject name are required');
        }

        setLoading(true);
        setError(null);

        try {
            // Step 1: Upload file to Supabase Storage (with user.uid for scoping)
            const { filePath, fileUrl } = await uploadNoteFile(file, subjectId, user.uid);

            // Step 2: Prepare metadata with user.uid
            const noteMetadata = {
                user_id: user.uid, // CRITICAL: Scope notes to user
                subject_id: subjectId,
                subject_name: subjectName,
                file_name: file.name,
                file_path: filePath,
                file_url: fileUrl,
                file_type: file.type,
                file_size: file.size
            };

            // Step 3: Save metadata to Supabase database
            const savedNote = await saveNoteMetadata(noteMetadata);

            // Step 4: Update local state
            setNotes(prev => [savedNote, ...prev]);

            return savedNote;
        } catch (err) {
            console.error('Error adding note:', err);
            setError(err.message || 'Failed to add note');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Clear notes (useful when changing subjects or logging out)
    const clearNotes = useCallback(() => {
        setNotes([]);
        setCurrentSubjectId(null);
        setError(null);
    }, []);

    // Get notes for current subject
    const getCurrentSubjectNotes = useCallback(() => {
        return notes;
    }, [notes]);

    const value = useMemo(() => ({
        // State
        notes,
        loading,
        error,
        currentSubjectId,

        // Methods
        loadNotes,
        addNote,
        clearNotes,
        getCurrentSubjectNotes,
    }), [
        notes,
        loading,
        error,
        currentSubjectId,
        loadNotes,
        addNote,
        clearNotes,
        getCurrentSubjectNotes,
    ]);

    return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

// Custom hook to use the context
export const useNotes = () => {
    const context = useContext(NotesContext);
    if (!context) {
        throw new Error('useNotes must be used within NotesProvider');
    }
    return context;
};
