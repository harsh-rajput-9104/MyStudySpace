import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { getAvatarImage } from '../../utils/avatars';

const Header = React.memo(({ currentPage }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { profile } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'subjects', label: 'Subjects', path: '/subjects' },
        { id: 'assignments', label: 'Assignments', path: '/assignments' },
        { id: 'exams', label: 'Exams', path: '/exams' },
        { id: 'profile', label: 'Profile', path: '/profile' },
    ];

    const handleNavClick = (path) => {
        navigate(path);
        setMenuOpen(false); // Close mobile menu after navigation
    };

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to sign out?')) {
            try {
                // Logout only ends the session - data remains in Firestore
                await logout();
                navigate('/login');
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        setMenuOpen(false);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Determine active page from current location
    const getActivePage = () => {
        const path = location.pathname;
        if (path.includes('/subjects')) return 'subjects';
        if (path.includes('/assignments')) return 'assignments';
        if (path.includes('/exams')) return 'exams';
        if (path.includes('/profile')) return 'profile';
        if (path.includes('/dashboard')) return 'dashboard';
        return currentPage || 'dashboard';
    };

    const activePage = getActivePage();

    return (
        <>
            <header className="app-header">
                <div className="container">
                    <div className="header-wrapper">
                        <div className="header-left">
                            <h1 className="header-logo">📚 MyStudySpace</h1>
                        </div>

                        {/* Desktop Navigation - Hidden on Mobile */}
                        <nav className="header-nav desktop-only">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.path)}
                                    className={`nav-button ${activePage === item.id ? 'active' : ''}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {/* Desktop Profile - Hidden on Mobile */}
                        {user && profile && (
                            <div className="header-profile desktop-only">
                                {profile.avatarId && getAvatarImage(profile.avatarId) && (
                                    <img
                                        src={getAvatarImage(profile.avatarId)}
                                        alt="Profile Avatar"
                                        className="header-avatar"
                                    />
                                )}
                                <span className="header-profile-name">{profile.name}</span>
                            </div>
                        )}

                        {/* Hamburger Button - Visible on Mobile Only */}
                        <button
                            className="hamburger-btn mobile-only"
                            onClick={toggleMenu}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu - Visible on Mobile Only */}
            <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
                <div className="container">
                    <nav className="mobile-nav">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.path)}
                                className={`mobile-nav-button ${activePage === item.id ? 'active' : ''}`}
                            >
                                {item.label}
                            </button>
                        ))}

                        {/* Logout Button in Mobile Menu */}
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="mobile-nav-button logout-button"
                                style={{
                                    marginTop: 'var(--spacing-md)',
                                    color: 'var(--color-red-600)',
                                    borderTop: '1px solid var(--color-border)'
                                }}
                            >
                                Logout
                            </button>
                        )}

                        {/* Profile in Mobile Menu */}
                        {user && profile && (
                            <div className="mobile-profile">
                                {profile.avatarId && getAvatarImage(profile.avatarId) && (
                                    <img
                                        src={getAvatarImage(profile.avatarId)}
                                        alt="Profile Avatar"
                                        className="mobile-profile-avatar"
                                    />
                                )}
                                <span className="mobile-profile-name">{profile.name}</span>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </>
    );
});

Header.displayName = 'Header';

export default Header;
