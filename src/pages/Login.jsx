import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
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
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to log in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Welcome Back</h1>
                <p style={styles.subtitle}>Log in to MyStudySpace📚</p>

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
                        placeholder="Enter your password"
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
                        {loading ? 'Logging in...' : 'Log In'}
                    </Button>
                </form>

                <p style={styles.signupPrompt}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={styles.link}>
                        Sign up
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
    signupPrompt: {
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

export default Login;
