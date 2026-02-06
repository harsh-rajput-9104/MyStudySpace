import React, { useState, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import { validateExam, hasErrors, isPastDate, isUpcoming } from '../utils/validators';

const Exams = () => {
    const { subjects, exams, addExam, deleteExam, getSubjectById } = useApp();

    const [formData, setFormData] = useState({
        subjectId: '',
        name: '',
        examDate: '',
    });

    const [errors, setErrors] = useState({});

    const subjectOptions = useMemo(() =>
        subjects.map(s => ({ value: s.id, label: s.name })),
        [subjects]
    );

    const sortedExams = useMemo(() => {
        return [...exams].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
    }, [exams]);

    const handleChange = useCallback((field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [errors]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        const validationErrors = validateExam(formData, subjects);

        if (hasErrors(validationErrors)) {
            setErrors(validationErrors);
            return;
        }

        addExam({
            subjectId: formData.subjectId,
            name: formData.name.trim(),
            examDate: formData.examDate,
        });

        // Reset form
        setFormData({ subjectId: '', name: '', examDate: '' });
        setErrors({});
    }, [formData, subjects, addExam]);

    const handleDelete = useCallback((examId) => {
        if (window.confirm('Are you sure you want to delete this exam?')) {
            deleteExam(examId);
        }
    }, [deleteExam]);

    if (subjects.length === 0) {
        return (
            <div>
                <h1>Exams</h1>
                <div className="card" style={{ backgroundColor: 'var(--color-green-50)', borderColor: 'var(--color-green-200)' }}>
                    <p style={{ color: 'var(--color-green-600)' }}>
                        Please add subjects first before scheduling exams.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1>Exams</h1>

            {/* Add Exam Form */}
            <div className="card mb-xl">
                <h2 className="mb-md">Schedule New Exam</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-3">
                        <Select
                            label="Subject"
                            value={formData.subjectId}
                            onChange={handleChange('subjectId')}
                            options={subjectOptions}
                            error={errors.subjectId}
                            placeholder="Select a subject"
                            required
                        />

                        <Input
                            label="Exam Name"
                            value={formData.name}
                            onChange={handleChange('name')}
                            error={errors.name}
                            placeholder="e.g., Mid-Term, Final"
                            required
                        />

                        <Input
                            label="Exam Date"
                            type="date"
                            value={formData.examDate}
                            onChange={handleChange('examDate')}
                            error={errors.examDate}
                            required
                        />
                    </div>

                    <Button type="submit" variant="primary">
                        Schedule Exam
                    </Button>
                </form>
            </div>

            {/* Exams List */}
            <div className="card">
                <h2 className="mb-md">Exam Schedule ({exams.length})</h2>

                {exams.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <p className="empty-state-text">No exams scheduled yet. Schedule your first exam above!</p>
                    </div>
                ) : (
                    <div style={styles.examsList}>
                        {sortedExams.map(exam => (
                            <ExamCard
                                key={exam.id}
                                exam={exam}
                                subject={getSubjectById(exam.subjectId)}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ExamCard = React.memo(({ exam, subject, onDelete }) => {
    const isPast = isPastDate(exam.examDate);
    const upcoming = isUpcoming(exam.examDate);
    const examDate = new Date(exam.examDate);

    return (
        <div
            className="card"
            style={{
                ...styles.examCard,
                ...(upcoming ? styles.upcomingCard : {}),
                ...(isPast ? styles.pastCard : {}),
            }}
        >
            <div style={styles.examHeader}>
                <div style={{ flex: 1 }}>
                    <div style={styles.examSubject}>{subject?.name || 'Unknown Subject'}</div>
                    <h4 style={styles.examName}>{exam.name}</h4>
                    <div style={styles.examDate}>
                        <span>📅 {examDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</span>
                    </div>
                </div>

                <div style={styles.examActions}>
                    {upcoming && (
                        <span className="badge badge-warning">Upcoming</span>
                    )}
                    {isPast && (
                        <span className="badge badge-success">Completed</span>
                    )}
                    <button
                        onClick={() => onDelete(exam.id)}
                        style={styles.deleteButton}
                        aria-label="Delete exam"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
});

ExamCard.displayName = 'ExamCard';

const styles = {
    examsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
    examCard: {
        backgroundColor: 'var(--color-light-gray)',
        transition: 'all var(--transition-base)',
    },
    upcomingCard: {
        backgroundColor: 'var(--color-green-50)',
        borderColor: 'var(--color-green-300)',
        borderWidth: '2px',
    },
    pastCard: {
        opacity: 0.7,
    },
    examHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 'var(--spacing-md)',
    },
    examSubject: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'var(--color-green-600)',
        marginBottom: 'var(--spacing-xs)',
    },
    examName: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
        margin: 0,
        marginBottom: 'var(--spacing-sm)',
    },
    examDate: {
        fontSize: '0.9375rem',
        color: 'var(--color-text-secondary)',
    },
    examActions: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
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

export default Exams;
