import React, { useState, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import { validateAssignment, hasErrors, isPastDate } from '../utils/validators';

const Assignments = () => {
    const { subjects, assignments, addAssignment, updateAssignmentStatus, deleteAssignment, getSubjectById } = useApp();

    const [formData, setFormData] = useState({
        subjectId: '',
        title: '',
        dueDate: '',
    });

    const [errors, setErrors] = useState({});

    const subjectOptions = useMemo(() =>
        subjects.map(s => ({ value: s.id, label: s.name })),
        [subjects]
    );

    const groupedAssignments = useMemo(() => {
        const groups = {};
        assignments.forEach(assignment => {
            const subjectId = assignment.subjectId;
            if (!groups[subjectId]) {
                groups[subjectId] = [];
            }
            groups[subjectId].push(assignment);
        });

        // Sort assignments within each group by due date
        Object.keys(groups).forEach(subjectId => {
            groups[subjectId].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        });

        return groups;
    }, [assignments]);

    const handleChange = useCallback((field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [errors]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        const validationErrors = validateAssignment(formData, subjects);

        if (hasErrors(validationErrors)) {
            setErrors(validationErrors);
            return;
        }

        addAssignment({
            subjectId: formData.subjectId,
            title: formData.title.trim(),
            dueDate: formData.dueDate,
        });

        // Reset form
        setFormData({ subjectId: '', title: '', dueDate: '' });
        setErrors({});
    }, [formData, subjects, addAssignment]);

    const handleStatusChange = useCallback((assignmentId, newStatus) => {
        updateAssignmentStatus(assignmentId, newStatus);
    }, [updateAssignmentStatus]);

    const handleDelete = useCallback((assignmentId) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            deleteAssignment(assignmentId);
        }
    }, [deleteAssignment]);

    if (subjects.length === 0) {
        return (
            <div>
                <h1>Assignments</h1>
                <div className="card" style={{ backgroundColor: 'var(--color-green-50)', borderColor: 'var(--color-green-200)' }}>
                    <p style={{ color: 'var(--color-green-600)' }}>
                        Please add subjects first before creating assignments.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1>Assignments</h1>

            {/* Add Assignment Form */}
            <div className="card mb-xl">
                <h2 className="mb-md">Add New Assignment</h2>
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
                            label="Assignment Title"
                            value={formData.title}
                            onChange={handleChange('title')}
                            error={errors.title}
                            placeholder="e.g., Lab Assignment 3"
                            required
                        />

                        <Input
                            label="Due Date"
                            type="date"
                            value={formData.dueDate}
                            onChange={handleChange('dueDate')}
                            error={errors.dueDate}
                            required
                        />
                    </div>

                    <Button type="submit" variant="primary">
                        Add Assignment
                    </Button>
                </form>
            </div>

            {/* Assignments List */}
            <div className="card">
                <h2 className="mb-md">My Assignments ({assignments.length})</h2>

                {assignments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <p className="empty-state-text">No assignments added yet. Add your first assignment above!</p>
                    </div>
                ) : (
                    <div style={styles.groupsContainer}>
                        {Object.keys(groupedAssignments).map(subjectId => {
                            const subject = getSubjectById(subjectId);
                            if (!subject) return null;

                            return (
                                <div key={subjectId} style={styles.group}>
                                    <h3 style={styles.groupTitle}>{subject.name}</h3>
                                    <div style={styles.assignmentsList}>
                                        {groupedAssignments[subjectId].map(assignment => (
                                            <AssignmentCard
                                                key={assignment.id}
                                                assignment={assignment}
                                                onStatusChange={handleStatusChange}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const AssignmentCard = React.memo(({ assignment, onStatusChange, onDelete }) => {
    const isPast = isPastDate(assignment.dueDate);
    const isSubmitted = assignment.status === 'submitted';

    return (
        <div className="card" style={styles.assignmentCard}>
            <div style={styles.assignmentHeader}>
                <div style={{ flex: 1 }}>
                    <h4 style={styles.assignmentTitle}>{assignment.title}</h4>
                    <div style={styles.assignmentMeta}>
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        {isPast && !isSubmitted && (
                            <span className="badge badge-error" style={{ marginLeft: 'var(--spacing-sm)' }}>
                                Overdue
                            </span>
                        )}
                    </div>
                </div>

                <div style={styles.actions}>
                    <select
                        value={assignment.status}
                        onChange={(e) => onStatusChange(assignment.id, e.target.value)}
                        style={styles.statusSelect}
                        className={`badge ${isSubmitted ? 'badge-success' : 'badge-warning'}`}
                    >
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                    </select>

                    <button
                        onClick={() => onDelete(assignment.id)}
                        style={styles.deleteButton}
                        aria-label="Delete assignment"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
});

AssignmentCard.displayName = 'AssignmentCard';

const styles = {
    groupsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xl)',
    },
    group: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
    groupTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: 'var(--color-green-600)',
        margin: 0,
        paddingBottom: 'var(--spacing-sm)',
        borderBottom: '2px solid var(--color-green-200)',
    },
    assignmentsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
    assignmentCard: {
        backgroundColor: 'var(--color-light-gray)',
    },
    assignmentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 'var(--spacing-md)',
    },
    assignmentTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
        margin: 0,
        marginBottom: 'var(--spacing-xs)',
    },
    assignmentMeta: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
    },
    statusSelect: {
        border: 'none',
        cursor: 'pointer',
        fontWeight: '500',
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

export default Assignments;
