import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FirestoreService } from '../services/firestoreService';
import toast from 'react-hot-toast';

export interface TimetableClass {
    id?: string;
    day: number;
    time: string;
    duration: number;
    subject: string;
    type: string;
    color: string;
}

interface TimetableContextType {
    classes: TimetableClass[];
    addClass: (classData: TimetableClass) => Promise<void>;
    deleteClass: (id: string) => Promise<void>;
    updateClass: (id: string, updates: Partial<TimetableClass>) => Promise<void>;
    getTodayClasses: () => TimetableClass[];
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

export function TimetableProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [classes, setClasses] = useState<TimetableClass[]>([]);

    // Load classes from Firestore with real-time sync
    useEffect(() => {
        if (!user) {
            setClasses([]);
            return;
        }

        const timetableService = new FirestoreService<TimetableClass>(user.uid, 'timetable');

        // Subscribe to real-time timetable updates
        const unsubscribe = timetableService.subscribeToCollection(
            (firestoreClasses) => {
                setClasses(firestoreClasses);
            },
            (error) => {
                console.error('Error loading timetable:', error);
                toast.error('Failed to load timetable. Please check your connection.');
            }
        );

        return () => {
            unsubscribe();
        };
    }, [user]);


    const addClass = async (classData: TimetableClass) => {
        if (!user) {
            toast.error('You must be logged in to add classes');
            return;
        }

        try {
            const timetableService = new FirestoreService<TimetableClass>(user.uid, 'timetable');
            const newClass: TimetableClass = {
                ...classData,
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };
            await timetableService.setDocument(newClass.id!, newClass);
        } catch (error) {
            console.error('Error adding class:', error);
            toast.error('Failed to add class. Please try again.');
        }
    };

    const deleteClass = async (id: string) => {
        if (!user) {
            toast.error('You must be logged in to delete classes');
            return;
        }

        try {
            const timetableService = new FirestoreService<TimetableClass>(user.uid, 'timetable');
            await timetableService.deleteDocument(id);
        } catch (error) {
            console.error('Error deleting class:', error);
            toast.error('Failed to delete class. Please try again.');
        }
    };

    const updateClass = async (id: string, updates: Partial<TimetableClass>) => {
        if (!user) {
            toast.error('You must be logged in to update classes');
            return;
        }

        try {
            const timetableService = new FirestoreService<TimetableClass>(user.uid, 'timetable');
            await timetableService.updateDocument(id, updates);
        } catch (error) {
            console.error('Error updating class:', error);
            toast.error('Failed to update class. Please try again.');
        }
    };


    const getTodayClasses = () => {
        const today = new Date().getDay();
        // Convert Sunday (0) to 6, and shift Monday-Saturday to 0-5
        const dayIndex = today === 0 ? 6 : today - 1;

        return classes
            .filter(cls => cls.day === dayIndex)
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    return (
        <TimetableContext.Provider value={{
            classes,
            addClass,
            deleteClass,
            updateClass,
            getTodayClasses,
        }}>
            {children}
        </TimetableContext.Provider>
    );
}

export function useTimetable() {
    const context = useContext(TimetableContext);
    if (!context) {
        throw new Error('useTimetable must be used within TimetableProvider');
    }
    return context;
}
