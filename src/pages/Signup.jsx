import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Signup = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await signup(formData.email, formData.password);
            // After signup, user will be redirected to profile creation
            navigate('/profile');
        } catch (err) {
            console.error('Signup error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Please log in instead.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak. Please use a stronger password.');
            } else {
                setError(err.message || 'Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Create Account</h1>
                <p style={styles.subtitle}>Sign up for MyStudySpace📚</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange('email')}
                        placeholder="your.email@example.com"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange('password')}
                        placeholder="At least 6 characters"
                        required
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        placeholder="Re-enter your password"
                        required
                    />

                    {error && (
                        <div className="form-error" role="alert">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        style={styles.submitButton}
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                </form>

                <p style={styles.loginPrompt}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.link}>
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-background)',
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        padding: 'var(--spacing-xl)',
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
    },
    title: {
        margin: 0,
        marginBottom: 'var(--spacing-xs)',
        fontSize: '1.875rem',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        textAlign: 'center',
    },
    subtitle: {
        margin: 0,
        marginBottom: 'var(--spacing-xl)',
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
    submitButton: {
        marginTop: 'var(--spacing-sm)',
    },
    loginPrompt: {
        marginTop: 'var(--spacing-lg)',
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        textAlign: 'center',
    },
    link: {
        color: 'var(--color-green-500)',
        textDecoration: 'none',
        fontWeight: '500',
    },
};

export default Signup;
