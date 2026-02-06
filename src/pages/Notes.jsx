import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import { useNotes } from '../context/NotesContext';
import UploadNoteForm from '../components/notes/UploadNoteForm';
import NotesList from '../components/notes/NotesList';
import Button from '../components/common/Button';

const Notes = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const { getSubjectById } = useApp();
    const { isProfileComplete } = useUser();
    const { notes, loading, error, loadNotes, addNote } = useNotes();

    const subject = getSubjectById(subjectId);

    // Load notes when component mounts or subjectId changes
    useEffect(() => {
        if (isProfileComplete && subjectId && subject) {
            loadNotes(subjectId);
        }
    }, [isProfileComplete, subjectId, subject, loadNotes]);

    // Handle note upload
    const handleUpload = useCallback(async (file, subId, subName) => {
        try {
            await addNote(file, subId, subName);
            // Success feedback could be added here
        } catch (err) {
            // Error is handled in the form component
            console.error('Upload error:', err);
        }
    }, [addNote]);

    // Guard: Profile not complete
    if (!isProfileComplete) {
        return (
            <div>
                <h1>Notes</h1>
                <div className="card" style={{
                    backgroundColor: 'var(--color-yellow-50)',
                    borderColor: 'var(--color-yellow-300)',
                    borderWidth: '2px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <span style={{ fontSize: '2rem' }}>⚠️</span>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, marginBottom: 'var(--spacing-xs)', color: 'var(--color-yellow-700)' }}>
                                Profile Required
                            </h3>
                            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                                You must complete your profile before accessing notes.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => navigate('/profile')}
                        >
                            Complete Profile
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Guard: Subject not found
    if (!subject) {
        return (
            <div>
                <h1>Notes</h1>
                <div className="card" style={{
                    backgroundColor: 'var(--color-red-50)',
                    borderColor: 'var(--color-red-200)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <span style={{ fontSize: '2rem' }}>❌</span>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, marginBottom: 'var(--spacing-xs)', color: 'var(--color-red-700)' }}>
                                Subject Not Found
                            </h3>
                            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                                The requested subject does not exist. Please select a valid subject.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => navigate('/subjects')}
                        >
                            Go to Subjects
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Notes UI
    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Notes</h1>
                    <p style={styles.subtitle}>
                        Subject: <strong>{subject.name}</strong>
                        {subject.code && <span style={styles.code}> ({subject.code})</span>}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/subjects')}
                >
                    ← Back to Subjects
                </Button>
            </div>

            {/* Upload Form */}
            <UploadNoteForm
                subjectId={subjectId}
                subjectName={subject.name}
                onUpload={handleUpload}
            />

            {/* Notes List */}
            <NotesList
                notes={notes}
                loading={loading}
                error={error}
                subjectName={subject.name}
            />
        </div>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'var(--spacing-lg)',
        gap: 'var(--spacing-md)',
    },
    title: {
        margin: 0,
        marginBottom: 'var(--spacing-xs)',
    },
    subtitle: {
        margin: 0,
        color: 'var(--color-text-secondary)',
        fontSize: '0.875rem',
    },
    code: {
        color: 'var(--color-text-muted)',
    },
};

export default Notes;
