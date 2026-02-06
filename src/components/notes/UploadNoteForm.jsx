import React, { useState, useCallback } from 'react';
import Button from '../common/Button';
import { isSupabaseConfigured } from '../../supabase/supabaseClient';

const UploadNoteForm = React.memo(({ subjectId, subjectName, onUpload }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    const supabaseReady = isSupabaseConfigured();

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        setError('');

        if (!file) {
            setSelectedFile(null);
            return;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Only PDF, JPG, and PNG files are allowed.');
            setSelectedFile(null);
            return;
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setError('File size exceeds 10MB limit.');
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
    }, []);

    const handleUpload = useCallback(async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }

        if (!supabaseReady) {
            setError('Supabase is not configured. File upload is currently disabled.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            await onUpload(selectedFile, subjectId, subjectName);
            // Reset form on success
            setSelectedFile(null);
            // Reset file input
            const fileInput = document.getElementById('note-file-input');
            if (fileInput) fileInput.value = '';
        } catch (err) {
            setError(err.message || 'Failed to upload note. Please try again.');
        } finally {
            setUploading(false);
        }
    }, [selectedFile, subjectId, subjectName, onUpload, supabaseReady]);

    return (
        <div className="card mb-lg">
            <h2 className="mb-md">Upload Note</h2>

            {!supabaseReady && (
                <div className="card mb-md" style={{
                    backgroundColor: 'var(--color-yellow-50)',
                    borderColor: 'var(--color-yellow-300)',
                    padding: 'var(--spacing-md)'
                }}>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                        ℹ️ File upload is currently disabled. Supabase configuration is required to enable this feature.
                    </p>
                </div>
            )}

            <form onSubmit={handleUpload}>
                <div className="mb-md">
                    <label htmlFor="note-file-input" style={styles.label}>
                        Select File (PDF, JPG, PNG - Max 10MB)
                    </label>
                    <input
                        id="note-file-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        disabled={uploading || !supabaseReady}
                        style={styles.fileInput}
                    />
                    {selectedFile && (
                        <p style={styles.fileName}>
                            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    )}
                </div>

                {error && (
                    <div className="form-error mb-md" role="alert">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    disabled={!selectedFile || uploading || !supabaseReady}
                >
                    {uploading ? 'Uploading...' : 'Upload Note'}
                </Button>
            </form>
        </div>
    );
});

UploadNoteForm.displayName = 'UploadNoteForm';

const styles = {
    label: {
        display: 'block',
        marginBottom: 'var(--spacing-xs)',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: 'var(--color-text-primary)',
    },
    fileInput: {
        display: 'block',
        width: '100%',
        padding: 'var(--spacing-sm)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        backgroundColor: 'var(--color-white)',
        cursor: 'pointer',
    },
    fileName: {
        marginTop: 'var(--spacing-xs)',
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
    },
};

export default UploadNoteForm;
