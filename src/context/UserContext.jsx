import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../firebase/firebase';
import { createUserProfile, updateUserProfile } from '../services/userService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileExists, setProfileExists] = useState(false);

    // Real-time listener for user profile
    useEffect(() => {
        // No user - clear everything
        if (!user) {
            setProfile(null);
            setProfileExists(false);
            setLoading(false);
            setError(null);
            return;
        }

        // User exists - subscribe to Firestore in real-time
        setLoading(true);
        setError(null);

        const userDocRef = doc(db, 'users', user.uid);

        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(
            userDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    if (userData && userData.profile) {
                        setProfile(userData.profile);
                        setProfileExists(true);
                    } else {
                        // Document exists but no profile field
                        setProfile(null);
                        setProfileExists(false);
                    }
                } else {
                    // Document doesn't exist - new user
                    setProfile(null);
                    setProfileExists(false);
                }
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error listening to user profile:', err);
                setError(err.message);
                setProfile(null);
                setProfileExists(false);
                setLoading(false);
            }
        );

        // Cleanup subscription on unmount or user change
        return () => {
            unsubscribe();
        };
    }, [user]);

    // Create new profile
    const createProfile = useCallback(async (profileData) => {
        if (!user) {
            throw new Error('User must be logged in to create profile');
        }

        setError(null);

        try {
            // Write to Firestore - onSnapshot will update the state automatically
            await createUserProfile(user.uid, profileData);
            // DO NOT manually update state - let the snapshot listener handle it
        } catch (err) {
            console.error('Error creating profile:', err);
            setError(err.message);
            throw err;
        }
    }, [user]);

    // Update existing profile
    const updateProfile = useCallback(async (profileData) => {
        if (!user) {
            throw new Error('User must be logged in to update profile');
        }

        setError(null);

        try {
            // Write to Firestore - onSnapshot will update the state automatically
            await updateUserProfile(user.uid, profileData);
            // DO NOT manually update state - let the snapshot listener handle it
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message);
            throw err;
        }
    }, [user]);

    // Check if profile is complete
    const isProfileComplete = useMemo(() => {
        return Boolean(
            profile &&
            profile.name &&
            profile.branch &&
            profile.semester &&
            profile.enrollmentNo &&
            profile.classSection &&
            profile.collegeName &&
            profile.universityName &&
            profile.avatarId
        );
    }, [profile]);

    const value = useMemo(() => ({
        profile,
        loading,
        error,
        profileExists,
        isProfileComplete,
        createProfile,
        updateProfile,
    }), [
        profile,
        loading,
        error,
        profileExists,
        isProfileComplete,
        createProfile,
        updateProfile,
    ]);

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use user context
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};
