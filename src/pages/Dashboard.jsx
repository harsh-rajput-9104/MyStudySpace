import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import { isPastDate, isUpcoming } from '../utils/validators';

const Dashboard = () => {
    const navigate = useNavigate();
    const { stats, assignments, exams } = useApp();
    const { profile } = useUser();

    // Get upcoming assignments and exams
    const upcomingItems = useMemo(() => {
        const upcomingAssignments = assignments
            .filter(a => a.status === 'pending' && !isPastDate(a.dueDate))
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 3);

        const upcomingExams = exams
            .filter(e => !isPastDate(e.examDate))
            .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
            .slice(0, 3);

        return { upcomingAssignments, upcomingExams };
    }, [assignments, exams]);

    if (!profile) {
        return (
            <div>
                <h1>Welcome to MyStudySpace</h1>
                <div className="card" style={{ backgroundColor: 'var(--color-green-50)', borderColor: 'var(--color-green-200)' }}>
                    <h2 style={{ color: 'var(--color-green-600)' }}>Get Started</h2>
                    <p style={{ color: 'var(--color-green-600)', marginBottom: 'var(--spacing-lg)' }}>
                        Please set up your profile to start using MyStudySpace.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/profile')}
                    >
                        Set Up Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-xl">
                <h1>Welcome back, {profile.name}! 👋</h1>
                <p className="text-secondary">
                    {profile.branch} • {profile.semester}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 mb-xl">
                <div className="card" style={styles.statCard}>
                    <div style={styles.statIcon}>📚</div>
                    <div style={styles.statValue}>{stats.totalSubjects}</div>
                    <div style={styles.statLabel}>Total Subjects</div>
                </div>

                <div className="card" style={styles.statCard}>
                    <div style={styles.statIcon}>📝</div>
                    <div style={styles.statValue}>{stats.pendingAssignments}</div>
                    <div style={styles.statLabel}>Pending Assignments</div>
                </div>

                <div className="card" style={styles.statCard}>
                    <div style={styles.statIcon}>📅</div>
                    <div style={styles.statValue}>{stats.upcomingExams}</div>
                    <div style={styles.statLabel}>Upcoming Exams</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card mb-xl">
                <h2 className="mb-md">Quick Actions</h2>
                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => navigate('/subjects')}>
                        Manage Subjects
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/assignments')}>
                        View Assignments
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/exams')}>
                        View Exams
                    </button>
                </div>
            </div>

            {/* Upcoming Section */}
            <div className="grid grid-cols-2">
                {/* Upcoming Assignments */}
                <div className="card">
                    <h3 className="mb-md">Upcoming Assignments</h3>
                    {upcomingItems.upcomingAssignments.length === 0 ? (
                        <p className="text-muted">No upcoming assignments</p>
                    ) : (
                        <div style={styles.itemList}>
                            {upcomingItems.upcomingAssignments.map(assignment => (
                                <div key={assignment.id} style={styles.item}>
                                    <div>
                                        <div style={styles.itemTitle}>{assignment.title}</div>
                                        <div style={styles.itemDate}>
                                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                            {isUpcoming(assignment.dueDate) && (
                                                <span className="badge badge-warning" style={{ marginLeft: 'var(--spacing-sm)' }}>
                                                    Soon
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Exams */}
                <div className="card">
                    <h3 className="mb-md">Upcoming Exams</h3>
                    {upcomingItems.upcomingExams.length === 0 ? (
                        <p className="text-muted">No upcoming exams</p>
                    ) : (
                        <div style={styles.itemList}>
                            {upcomingItems.upcomingExams.map(exam => (
                                <div key={exam.id} style={styles.item}>
                                    <div>
                                        <div style={styles.itemTitle}>{exam.name}</div>
                                        <div style={styles.itemDate}>
                                            Date: {new Date(exam.examDate).toLocaleDateString()}
                                            {isUpcoming(exam.examDate) && (
                                                <span className="badge badge-warning" style={{ marginLeft: 'var(--spacing-sm)' }}>
                                                    Soon
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    statCard: {
        textAlign: 'center',
    },
    statIcon: {
        fontSize: '2rem',
        marginBottom: 'var(--spacing-sm)',
    },
    statValue: {
        fontSize: '2rem',
        fontWeight: '700',
        color: 'var(--color-green-600)',
        marginBottom: 'var(--spacing-xs)',
    },
    statLabel: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
    },
    itemList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
    item: {
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-light-gray)',
        borderRadius: 'var(--radius-md)',
    },
    itemTitle: {
        fontWeight: '500',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-xs)',
    },
    itemDate: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
    },
};

export default Dashboard;
