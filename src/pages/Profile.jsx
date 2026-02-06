import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { validateProfile, hasErrors } from '../utils/validators';
import { AVATARS } from '../utils/avatars';

const Profile = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { profile, updateProfile, createProfile, profileExists, loading } = useUser();

    const [formData, setFormData] = useState({
        name: '',
        branch: '',
        semester: '',
        enrollmentNo: '',
        classSection: '',
        collegeName: '',
        universityName: '',
        avatarId: '',
    });

    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleChange = useCallback((field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [errors]);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name ?? '',
                branch: profile.branch ?? '',
                semester: profile.semester ?? '',
                enrollmentNo: profile.enrollmentNo ?? '',
                classSection: profile.classSection ?? '',
                collegeName: profile.collegeName ?? '',
                universityName: profile.universityName ?? '',
                avatarId: profile.avatarId ?? '',
            });
            setIsEditing(false);
        } else {
            // New user, no profile yet
            setIsEditing(true);
        }
    }, [profile]);



    const handleAvatarSelect = useCallback((avatarId) => {
        setFormData(prev => ({ ...prev, avatarId }));
        // Clear avatar error when user selects
        if (errors.avatarId) {
            setErrors(prev => ({ ...prev, avatarId: '' }));
        }
    }, [errors]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const validationErrors = validateProfile(formData);

        if (hasErrors(validationErrors)) {
            setErrors(validationErrors);
            return;
        }

        setSaving(true);
        setErrors({});

        try {
            if (profileExists) {
                // Update existing profile
                await updateProfile(formData);
            } else {
                // Create new profile
                await createProfile(formData);
            }
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            setErrors({ submit: 'Failed to save profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    }, [formData, updateProfile, createProfile, profileExists]);

    const handleEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleCancel = useCallback(() => {
        if (profile) {
            setFormData({
                name: profile.name,
                branch: profile.branch,
                semester: profile.semester,
                enrollmentNo: profile.enrollmentNo,
                classSection: profile.classSection,
                collegeName: profile.collegeName,
                universityName: profile.universityName,
                avatarId: profile.avatarId,
            });
            setIsEditing(false);
            setErrors({});
        }
    }, [profile]);

    const handleLogout = useCallback(async () => {
        const confirmed = window.confirm(
            'Are you sure you want to sign out?'
        );

        if (confirmed) {
            try {
                // Logout from Firebase - this ends the session only
                // User data remains in Firestore and will be loaded on next login
                await logout();
                // Navigate to login
                navigate('/login');
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
    }, [logout, navigate]);
    if (loading) {
        return (
            <div className="card">
                <p>Loading profile…</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Profile</h1>

            {!profile && (
                <div className="card mb-lg" style={{ backgroundColor: 'var(--color-green-50)', borderColor: 'var(--color-green-200)' }}>
                    <p style={{ margin: 0, color: 'var(--color-green-600)' }}>
                        👋 Welcome! Please set up your profile to get started.
                    </p>
                </div>
            )}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    {/* Personal Information Section */}
                    <h3 className="mb-md" style={{ color: 'var(--color-green-600)' }}>Personal Information</h3>

                    <div className="grid grid-cols-2">
                        <Input
                            label="Full Name"
                            value={formData.name}
                            onChange={handleChange('name')}
                            error={errors.name}
                            placeholder="Enter your full name"
                            required
                            disabled={!isEditing}
                        />

                        <Input
                            label="Enrollment Number"
                            value={formData.enrollmentNo}
                            onChange={handleChange('enrollmentNo')}
                            error={errors.enrollmentNo}
                            placeholder="e.g., 2021CS001"
                            required
                            disabled={!isEditing}
                        />
                    </div>

                    {/* Academic Information Section */}
                    <h3 className="mb-md mt-lg" style={{ color: 'var(--color-green-600)' }}>Academic Information</h3>

                    <div className="grid grid-cols-3">
                        <Input
                            label="Branch"
                            value={formData.branch}
                            onChange={handleChange('branch')}
                            error={errors.branch}
                            placeholder="e.g., Computer Science"
                            required
                            disabled={!isEditing}
                        />

                        <Input
                            label="Semester"
                            value={formData.semester}
                            onChange={handleChange('semester')}
                            error={errors.semester}
                            placeholder="e.g., 5th Semester"
                            required
                            disabled={!isEditing}
                        />

                        <Input
                            label="Class / Section"
                            value={formData.classSection}
                            onChange={handleChange('classSection')}
                            error={errors.classSection}
                            placeholder="e.g., A, CSE-B"
                            required
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="grid grid-cols-2">
                        <Input
                            label="College Name"
                            value={formData.collegeName}
                            onChange={handleChange('collegeName')}
                            error={errors.collegeName}
                            placeholder="Enter your college name"
                            required
                            disabled={!isEditing}
                        />

                        <Input
                            label="University Name"
                            value={formData.universityName}
                            onChange={handleChange('universityName')}
                            error={errors.universityName}
                            placeholder="Enter your university name"
                            required
                            disabled={!isEditing}
                        />
                    </div>

                    {/* Avatar Selection Section */}
                    <h3 className="mb-md mt-lg" style={{ color: 'var(--color-green-600)' }}>
                        Select Your Avatar
                    </h3>

                    {isEditing && (
                        <>
                            <div style={styles.avatarSection}>
                                <h4 style={styles.avatarGroupTitle}>Male Avatars</h4>
                                <div className="avatar-grid">
                                    {AVATARS.male.map((avatar) => (
                                        <button
                                            key={avatar.id}
                                            type="button"
                                            onClick={() => handleAvatarSelect(avatar.id)}
                                            className={`avatar-button ${formData.avatarId === avatar.id ? 'selected' : ''}`}
                                            disabled={!isEditing}
                                        >
                                            <img
                                                src={avatar.image}
                                                alt={avatar.label}
                                                className="avatar-image"
                                            />
                                        </button>
                                    ))}
                                </div>

                                <h4 style={styles.avatarGroupTitle}>Female Avatars</h4>
                                <div className="avatar-grid">
                                    {AVATARS.female.map((avatar) => (
                                        <button
                                            key={avatar.id}
                                            type="button"
                                            onClick={() => handleAvatarSelect(avatar.id)}
                                            className={`avatar-button ${formData.avatarId === avatar.id ? 'selected' : ''}`}
                                            disabled={!isEditing}
                                        >
                                            <img
                                                src={avatar.image}
                                                alt={avatar.label}
                                                className="avatar-image"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {errors.avatarId && (
                                <span className="form-error">{errors.avatarId}</span>
                            )}
                        </>
                    )}
                    {/* Form Actions */}
                    <div className="mt-lg">
                        {errors.submit && (
                            <div className="form-error" role="alert" style={{ marginBottom: 'var(--spacing-md)' }}>
                                {errors.submit}
                            </div>
                        )}
                        {isEditing ? (
                            <div className="flex gap-md">
                                <Button type="submit" variant="primary" disabled={saving}>
                                    {saving ? 'Saving...' : (profile ? 'Save Changes' : 'Create Profile')}
                                </Button>
                                {profile && (
                                    <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Button type="button" variant="primary" onClick={handleEdit}>
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            {/* Profile Summary */}
            {profile && !isEditing && (
                <div className="card mt-lg">
                    <h3 className="mb-md">Profile Summary</h3>
                    <div style={styles.summaryGrid}>
                        <div style={styles.summaryItem}>
                            <span style={styles.summaryLabel}>Name</span>
                            <span style={styles.summaryValue}>{profile.name}</span>
                        </div>
                        <div style={styles.summaryItem}>
                            <span style={styles.summaryLabel}>Enrollment Number</span>
                            <span style={styles.summaryValue}>{profile.enrollmentNo}</span>
                        </div>
                        <div style={styles.summaryItem}>
                            <span style={styles.summaryLabel}>Branch</span>
                            <span style={styles.summaryValue}>{profile.branch}</span>
                        </div>
                        <div style={styles.summaryItem}>
                            <span style={styles.summaryLabel}>Semester</span>
                            <span style={styles.summaryValue}>{profile.semester}</span>
                        </div>
                        <div style={styles.summaryItem}>
                            <span style={styles.summaryLabel}>Class / Section</span>
                            <span style={styles.summaryValue}>{profile.classSection}</span>
                        </div>
                        <div style={styles.summaryItem}>
                            <span style={styles.summaryLabel}>College</span>
                            <span style={styles.summaryValue}>{profile.collegeName}</span>
                        </div>
                        <div style={styles.summaryItem}>
                            <span style={styles.summaryLabel}>University</span>
                            <span style={styles.summaryValue}>{profile.universityName}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Section */}
            {profile && !isEditing && (
                <div
                    className="card mt-lg"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <h3 className="mb-sm">Account</h3>

                    <p
                        style={{
                            marginBottom: 'var(--spacing-lg)',
                            color: 'var(--color-text-secondary)',
                            maxWidth: '700px',
                            lineHeight: 1.6,
                        }}
                    >
                        You can sign out anytime, your data stays safe and ready when you return.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            )}

        </div>
    );
};

const styles = {
    avatarSection: {
        marginBottom: 'var(--spacing-lg)',
    },
    avatarGroupTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-md)',
        marginTop: 'var(--spacing-md)',
    },
    // Avatar styles removed - now using CSS classes in theme.css
    selectedAvatarDisplay: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-green-50)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-green-200)',
    },
    selectedAvatarEmoji: {
        fontSize: '3rem',
    },
    selectedAvatarText: {
        fontSize: '1rem',
        fontWeight: '500',
        color: 'var(--color-green-600)',
    },
    summaryGrid: {
        display: 'grid',
        gap: 'var(--spacing-lg)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    },
    summaryItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xs)',
    },
    summaryLabel: {
        fontSize: '0.875rem',
        fontWeight: '500',
        color: 'var(--color-text-muted)',
    },
    summaryValue: {
        fontSize: '1rem',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
    },
};

export default Profile;
