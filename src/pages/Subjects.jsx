import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { validateSubjectName } from '../utils/validators';

const Subjects = () => {
    const navigate = useNavigate();
    const { subjects, addSubject, deleteSubject } = useApp();
    const { isProfileComplete } = useUser();

    const [formData, setFormData] = useState({
        name: '',
        code: '',
    });

    const [error, setError] = useState('');

    const handleChange = useCallback((field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (error) setError('');
    }, [error]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        // Profile prerequisite check - MANDATORY
        if (!isProfileComplete) {
            alert('Please complete your profile before adding subjects.');
            navigate('/profile');
            return;
        }

        const validationError = validateSubjectName(formData.name, subjects);

        if (validationError) {
            setError(validationError);
            return;
        }

        addSubject({
            name: formData.name.trim(),
            code: formData.code.trim(),
        });

        // Reset form
        setFormData({ name: '', code: '' });
        setError('');
    }, [formData, subjects, addSubject, isProfileComplete, navigate]);

    const handleDelete = useCallback((subjectId) => {
        if (window.confirm('Are you sure? This will also delete all related assignments and exams.')) {
            deleteSubject(subjectId);
        }
    }, [deleteSubject]);

    const handleViewNotes = useCallback((subjectId) => {
        navigate(`/subjects/${subjectId}/notes`);
    }, [navigate]);


    return (
        <div>
            <h1>Subjects</h1>

            {/* Profile Incomplete Warning - ALWAYS SHOWN when profile incomplete */}
            {!isProfileComplete && (
                <div className="card mb-lg" style={{
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
                                You must complete your profile before adding subjects.
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
            )}

            {/* Subjects UI - ONLY SHOWN when profile is complete */}
            {isProfileComplete && (
                <>
                    {/* Add Subject Form */}
                    <div className="card mb-xl">
                        <h2 className="mb-md">Add New Subject</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2">
                                <Input
                                    label="Subject Name"
                                    value={formData.name}
                                    onChange={handleChange('name')}
                                    error={error}
                                    placeholder="e.g., Data Structures"
                                    required
                                />

                                <Input
                                    label="Subject Code (Optional)"
                                    value={formData.code}
                                    onChange={handleChange('code')}
                                    placeholder="e.g., CS301"
                                />
                            </div>

                            <Button type="submit" variant="primary">
                                Add Subject
                            </Button>
                        </form>
                    </div>

                    {/* Subjects List */}
                    <div className="card">
                        <h2 className="mb-md">My Subjects ({subjects.length})</h2>

                        {subjects.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📚</div>
                                <p className="empty-state-text">No subjects added yet. Add your first subject above!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2">
                                {subjects.map(subject => (
                                    <SubjectCard
                                        key={subject.id}
                                        subject={subject}
                                        onDelete={handleDelete}
                                        onViewNotes={handleViewNotes}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const SubjectCard = React.memo(({ subject, onDelete, onViewNotes }) => {
    return (
        <div className="card" style={styles.subjectCard}>
            <div style={styles.subjectHeader}>
                <div>
                    <h3 style={styles.subjectName}>{subject.name}</h3>
                    {subject.code && (
                        <p style={styles.subjectCode}>{subject.code}</p>
                    )}
                </div>
                <div style={styles.actions}>
                    <button
                        onClick={() => onViewNotes(subject.id)}
                        style={styles.notesButton}
                        aria-label="View notes"
                        title="View notes for this subject"
                    >
                        📝
                    </button>
                    <button
                        onClick={() => onDelete(subject.id)}
                        style={styles.deleteButton}
                        aria-label="Delete subject"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
});

SubjectCard.displayName = 'SubjectCard';

const styles = {
    subjectCard: {
        backgroundColor: 'var(--color-green-50)',
        borderColor: 'var(--color-green-200)',
    },
    subjectHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    subjectName: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
        margin: 0,
        marginBottom: 'var(--spacing-xs)',
    },
    subjectCode: {
        fontSize: '0.875rem',
        color: 'var(--color-text-muted)',
        margin: 0,
    },
    actions: {
        display: 'flex',
        gap: 'var(--spacing-xs)',
    },
    notesButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.25rem',
        cursor: 'pointer',
        padding: 'var(--spacing-xs)',
        opacity: 0.7,
        transition: 'opacity var(--transition-fast)',
    },
    deleteButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.25rem',
        cursor: 'pointer',
        padding: 'var(--spacing-xs)',
        opacity: 0.6,
        transition: 'opacity var(--transition-fast)',
    },
};

export default Subjects;
