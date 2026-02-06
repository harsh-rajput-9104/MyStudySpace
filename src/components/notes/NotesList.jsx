import React from 'react';
import NoteItem from './NoteItem';

const NotesList = React.memo(({ notes, loading, error, subjectName }) => {
    if (loading) {
        return (
            <div className="card">
                <div style={styles.loadingContainer}>
                    <p style={styles.loadingText}>Loading notes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={styles.errorCard}>
                <p style={styles.errorText}>❌ {error}</p>
            </div>
        );
    }

    if (!notes || notes.length === 0) {
        return (
            <div className="card">
                <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <p className="empty-state-text">
                        No notes uploaded yet for {subjectName}.
                    </p>
                    <p style={styles.emptyHint}>
                        Upload your first note using the form above!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h2 className="mb-md">Notes for {subjectName} ({notes.length})</h2>
            <div style={styles.notesList}>
                {notes.map((note) => (
                    <NoteItem key={note.id} note={note} />
                ))}
            </div>
        </div>
    );
});

NotesList.displayName = 'NotesList';

const styles = {
    loadingContainer: {
        textAlign: 'center',
        padding: 'var(--spacing-xl)',
    },
    loadingText: {
        color: 'var(--color-text-secondary)',
        margin: 0,
    },
    errorCard: {
        backgroundColor: 'var(--color-red-50)',
        borderColor: 'var(--color-red-200)',
    },
    errorText: {
        color: 'var(--color-red-600)',
        margin: 0,
    },
    emptyHint: {
        fontSize: '0.875rem',
        color: 'var(--color-text-muted)',
        marginTop: 'var(--spacing-sm)',
    },
    notesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
};

export default NotesList;
