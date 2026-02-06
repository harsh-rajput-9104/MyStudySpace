import React from 'react';

const NoteItem = React.memo(({ note }) => {
    const handleOpen = () => {
        if (note.file_url) {
            window.open(note.file_url, '_blank', 'noopener,noreferrer');
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType?.includes('pdf')) return '📄';
        if (fileType?.includes('image')) return '🖼️';
        return '📎';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'Unknown date';
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const mb = bytes / 1024 / 1024;
        return `${mb.toFixed(2)} MB`;
    };

    return (
        <div className="card" style={styles.noteCard}>
            <div style={styles.noteHeader}>
                <div style={styles.iconContainer}>
                    <span style={styles.icon}>{getFileIcon(note.file_type)}</span>
                </div>
                <div style={styles.noteInfo}>
                    <h4 style={styles.fileName}>{note.file_name}</h4>
                    <div style={styles.metadata}>
                        <span style={styles.metadataItem}>
                            📅 {formatDate(note.created_at)}
                        </span>
                        {note.file_size && (
                            <span style={styles.metadataItem}>
                                💾 {formatFileSize(note.file_size)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div style={styles.actions}>
                <button
                    onClick={handleOpen}
                    disabled={!note.file_url}
                    style={styles.openButton}
                    title={note.file_url ? 'Open file' : 'File URL not available'}
                >
                    Open
                </button>
            </div>
        </div>
    );
});

NoteItem.displayName = 'NoteItem';

const styles = {
    noteCard: {
        backgroundColor: 'var(--color-green-50)',
        borderColor: 'var(--color-green-200)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
    },
    noteHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        flex: 1,
        minWidth: 0, // Allow text truncation
    },
    iconContainer: {
        flexShrink: 0,
    },
    icon: {
        fontSize: '2rem',
    },
    noteInfo: {
        flex: 1,
        minWidth: 0, // Allow text truncation
    },
    fileName: {
        margin: 0,
        marginBottom: 'var(--spacing-xs)',
        fontSize: '1rem',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    metadata: {
        display: 'flex',
        gap: 'var(--spacing-md)',
        flexWrap: 'wrap',
    },
    metadataItem: {
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
    },
    actions: {
        flexShrink: 0,
    },
    openButton: {
        padding: 'var(--spacing-sm) var(--spacing-md)',
        backgroundColor: 'var(--color-green-500)',
        color: 'var(--color-white)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color var(--transition-fast)',
    },
};

export default NoteItem;
