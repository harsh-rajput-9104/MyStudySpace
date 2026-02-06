import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    writeBatch,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const { user: currentUser, loading: authLoading } = useAuth();

    // State
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper to safely format Firestore docs (handling Timestamps vs Strings)
    const formatDoc = (doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Safe conversion: handles Firestore Timestamp or existing string
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
        };
    };

    // Fetch all data for the current user
    const fetchAllData = useCallback(async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            // Fetch Subjects (ordered by creation time)
            const subjectsRef = collection(db, 'users', currentUser.uid, 'subjects');
            const subjectsQuery = query(subjectsRef, orderBy('createdAt', 'asc'));
            const subjectsSnap = await getDocs(subjectsQuery);
            const subjectsData = subjectsSnap.docs.map(formatDoc);

            // Fetch Assignments
            const assignmentsRef = collection(db, 'users', currentUser.uid, 'assignments');
            const assignmentsQuery = query(assignmentsRef, orderBy('createdAt', 'asc'));
            const assignmentsSnap = await getDocs(assignmentsQuery);
            const assignmentsData = assignmentsSnap.docs.map(formatDoc);

            // Fetch Exams
            const examsRef = collection(db, 'users', currentUser.uid, 'exams');
            const examsQuery = query(examsRef, orderBy('createdAt', 'asc'));
            const examsSnap = await getDocs(examsQuery);
            const examsData = examsSnap.docs.map(formatDoc);

            setSubjects(subjectsData);
            setAssignments(assignmentsData);
            setExams(examsData);
        } catch (error) {
            console.error('Error fetching app data:', error);
            // On error, clear state to prevent stale data
            setSubjects([]);
            setAssignments([]);
            setExams([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // Lifecycle Management - Wait for auth to complete before fetching
    useEffect(() => {
        // Don't do anything while auth is still loading
        if (authLoading) return;

        if (!currentUser) {
            // Logout: Clear all state immediately
            setSubjects([]);
            setAssignments([]);
            setExams([]);
            setLoading(false);
        } else {
            // Login/Refresh: Fetch data only after auth is confirmed
            fetchAllData();
        }
    }, [currentUser, authLoading, fetchAllData]);

    // --- Actions ---

    // Subject Actions
    const addSubject = useCallback(async (subject) => {
        if (!currentUser) throw new Error('User must be authenticated');

        try {
            // Add to Firestore
            const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'subjects'), {
                ...subject,
                createdAt: serverTimestamp()
            });

            // Optimistic update - add to local state immediately
            const newSubject = {
                id: docRef.id,
                ...subject,
                createdAt: new Date().toISOString()
            };

            setSubjects((prevSubjects) => [...prevSubjects, newSubject]);

            return newSubject;
        } catch (error) {
            console.error('Error adding subject:', error);
            throw error;
        }
    }, [currentUser]);

    const deleteSubject = useCallback(async (subjectId) => {
        if (!currentUser) throw new Error('User must be authenticated');

        try {
            const batch = writeBatch(db);

            // 1. Delete subject
            const subjectRef = doc(db, 'users', currentUser.uid, 'subjects', subjectId);
            batch.delete(subjectRef);

            // 2. Cascade delete assignments
            const assignmentsRef = collection(db, 'users', currentUser.uid, 'assignments');
            const qAssignments = query(assignmentsRef, where('subjectId', '==', subjectId));
            const assignmentsSnap = await getDocs(qAssignments);
            assignmentsSnap.forEach((doc) => batch.delete(doc.ref));

            // 3. Cascade delete exams
            const examsRef = collection(db, 'users', currentUser.uid, 'exams');
            const qExams = query(examsRef, where('subjectId', '==', subjectId));
            const examsSnap = await getDocs(qExams);
            examsSnap.forEach((doc) => batch.delete(doc.ref));

            await batch.commit();

            // Refetch to ensure consistency
            await fetchAllData();
        } catch (error) {
            console.error('Error deleting subject:', error);
            throw error;
        }
    }, [currentUser, fetchAllData]);

    // Assignment Actions
    const addAssignment = useCallback(async (assignment) => {
        if (!currentUser) throw new Error('User must be authenticated');

        try {
            const data = {
                ...assignment,
                status: assignment.status || 'pending',
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'assignments'), data);

            // Refetch to get server timestamp
            await fetchAllData();

            return { id: docRef.id, ...assignment, status: data.status };
        } catch (error) {
            console.error('Error adding assignment:', error);
            throw error;
        }
    }, [currentUser, fetchAllData]);

    const updateAssignmentStatus = useCallback(async (assignmentId, status) => {
        if (!currentUser) throw new Error('User must be authenticated');

        try {
            const ref = doc(db, 'users', currentUser.uid, 'assignments', assignmentId);
            await updateDoc(ref, { status });

            // Optimistic update
            setAssignments(prev => prev.map(a =>
                a.id === assignmentId ? { ...a, status } : a
            ));
        } catch (error) {
            console.error('Error updating assignment status:', error);
            // Revert on error
            await fetchAllData();
            throw error;
        }
    }, [currentUser, fetchAllData]);

    const deleteAssignment = useCallback(async (assignmentId) => {
        if (!currentUser) throw new Error('User must be authenticated');

        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'assignments', assignmentId));

            // Optimistic update
            setAssignments(prev => prev.filter(a => a.id !== assignmentId));
        } catch (error) {
            console.error('Error deleting assignment:', error);
            // Revert on error
            await fetchAllData();
            throw error;
        }
    }, [currentUser, fetchAllData]);

    // Exam Actions
    const addExam = useCallback(async (exam) => {
        if (!currentUser) throw new Error('User must be authenticated');

        try {
            const data = {
                ...exam,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'exams'), data);

            // Refetch to get server timestamp
            await fetchAllData();

            return { id: docRef.id, ...exam };
        } catch (error) {
            console.error('Error adding exam:', error);
            throw error;
        }
    }, [currentUser, fetchAllData]);

    const deleteExam = useCallback(async (examId) => {
        if (!currentUser) throw new Error('User must be authenticated');

        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'exams', examId));

            // Optimistic update
            setExams(prev => prev.filter(e => e.id !== examId));
        } catch (error) {
            console.error('Error deleting exam:', error);
            // Revert on error
            await fetchAllData();
            throw error;
        }
    }, [currentUser, fetchAllData]);

    // Helpers
    const getSubjectById = useCallback((subjectId) => {
        return subjects.find(s => s.id === subjectId);
    }, [subjects]);

    const getAssignmentsBySubject = useCallback((subjectId) => {
        return assignments.filter(a => a.subjectId === subjectId);
    }, [assignments]);

    const getExamsBySubject = useCallback((subjectId) => {
        return exams.filter(e => e.subjectId === subjectId);
    }, [exams]);

    // Stats
    const stats = useMemo(() => {
        const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
        const submittedAssignments = assignments.filter(a => a.status === 'submitted').length;
        const upcomingExams = exams.filter(e => {
            const examDate = new Date(e.examDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return examDate >= today;
        }).length;

        return {
            totalSubjects: subjects.length,
            totalAssignments: assignments.length,
            pendingAssignments,
            submittedAssignments,
            totalExams: exams.length,
            upcomingExams,
        };
    }, [subjects, assignments, exams]);

    const value = useMemo(() => ({
        subjects, assignments, exams, stats, loading,
        addSubject, deleteSubject,
        addAssignment, updateAssignmentStatus, deleteAssignment,
        addExam, deleteExam,
        getSubjectById, getAssignmentsBySubject, getExamsBySubject
    }), [
        subjects, assignments, exams, stats, loading,
        addSubject, deleteSubject,
        addAssignment, updateAssignmentStatus, deleteAssignment,
        addExam, deleteExam,
        getSubjectById, getAssignmentsBySubject, getExamsBySubject
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};
