// User Service - Firestore User Data Operations
// This service handles all user profile operations in Firestore

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Create a new user profile in Firestore
 * @param {string} uid - User ID from Firebase Auth
 * @param {Object} profileData - Profile data to save
 * @returns {Promise<void>}
 */
export const createUserProfile = async (uid, profileData) => {
    if (!uid) {
        throw new Error('User ID is required to create profile');
    }

    try {
        const userRef = doc(db, 'users', uid);

        await setDoc(userRef, {
            profile: {
                name: profileData.name || '',
                branch: profileData.branch || '',
                semester: profileData.semester || '',
                enrollmentNo: profileData.enrollmentNo || '',
                classSection: profileData.classSection || '',
                collegeName: profileData.collegeName || '',
                universityName: profileData.universityName || '',
                avatarId: profileData.avatarId || '',
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        console.log('User profile created successfully');
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw new Error(`Failed to create profile: ${error.message}`);
    }
};

/**
 * Get user profile from Firestore
 * @param {string} uid - User ID from Firebase Auth
 * @returns {Promise<Object|null>} - User profile data or null if not found
 */
export const getUserProfile = async (uid) => {
    if (!uid) {
        throw new Error('User ID is required to fetch profile');
    }

    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            console.log('No profile found for user:', uid);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw new Error(`Failed to fetch profile: ${error.message}`);
    }
};

/**
 * Update user profile in Firestore
 * @param {string} uid - User ID from Firebase Auth
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (uid, profileData) => {
    if (!uid) {
        throw new Error('User ID is required to update profile');
    }

    try {
        const userRef = doc(db, 'users', uid);

        await updateDoc(userRef, {
            profile: {
                name: profileData.name || '',
                branch: profileData.branch || '',
                semester: profileData.semester || '',
                enrollmentNo: profileData.enrollmentNo || '',
                classSection: profileData.classSection || '',
                collegeName: profileData.collegeName || '',
                universityName: profileData.universityName || '',
                avatarId: profileData.avatarId || '',
            },
            updatedAt: serverTimestamp(),
        });

        console.log('User profile updated successfully');
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw new Error(`Failed to update profile: ${error.message}`);
    }
};

/**
 * Check if user profile exists
 * @param {string} uid - User ID from Firebase Auth
 * @returns {Promise<boolean>} - True if profile exists, false otherwise
 */
export const checkProfileExists = async (uid) => {
    if (!uid) {
        return false;
    }

    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        return userSnap.exists();
    } catch (error) {
        console.error('Error checking profile existence:', error);
        return false;
    }
};
