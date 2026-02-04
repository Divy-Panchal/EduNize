import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FirestoreService } from '../services/firestoreService';
import toast from 'react-hot-toast';

interface DailyStats {
    date: string; // YYYY-MM-DD format
    studyMinutes: number; // Total minutes studied today
    focusSessions: number; // Number of completed Pomodoro sessions
}

interface DailyStatsContextType {
    studyMinutes: number;
    focusSessions: number;
    addStudyTime: (minutes: number) => Promise<void>;
    incrementFocusSession: () => Promise<void>;
    getStudyHours: () => string;
}

const DailyStatsContext = createContext<DailyStatsContextType | undefined>(undefined);

export function DailyStatsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [dailyStats, setDailyStats] = useState<DailyStats>({
        date: getTodayDate(),
        studyMinutes: 0,
        focusSessions: 0,
    });

    // Get today's date in YYYY-MM-DD format (local timezone)
    function getTodayDate(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Load stats from Firestore with real-time sync
    useEffect(() => {
        if (!user) {
            setDailyStats({
                date: getTodayDate(),
                studyMinutes: 0,
                focusSessions: 0,
            });
            return;
        }

        const dailyStatsService = new FirestoreService<DailyStats>(user.uid, 'dailyStats');
        const today = getTodayDate();

        // Subscribe to today's stats
        const unsubscribe = dailyStatsService.subscribeToDocument(
            today,
            (stats) => {
                if (stats) {
                    setDailyStats(stats);
                } else {
                    // No stats for today, initialize
                    const newStats: DailyStats = {
                        date: today,
                        studyMinutes: 0,
                        focusSessions: 0,
                    };
                    setDailyStats(newStats);
                    dailyStatsService.setDocument(today, newStats);
                }
            },
            (error) => {
                console.error('Error loading daily stats:', error);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [user]);

    // Check for date change every minute
    useEffect(() => {
        const interval = setInterval(() => {
            const today = getTodayDate();
            if (dailyStats.date !== today) {
                // Date changed, reset stats
                resetStats();
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [dailyStats.date, user]);

    const resetStats = async () => {
        if (!user) return;

        const newStats: DailyStats = {
            date: getTodayDate(),
            studyMinutes: 0,
            focusSessions: 0,
        };
        setDailyStats(newStats);

        try {
            const dailyStatsService = new FirestoreService<DailyStats>(user.uid, 'dailyStats');
            await dailyStatsService.setDocument(newStats.date, newStats);
        } catch (error) {
            console.error('Error resetting daily stats:', error);
        }
    };

    const addStudyTime = async (minutes: number) => {
        if (!user) return;

        const updatedStats = {
            ...dailyStats,
            studyMinutes: dailyStats.studyMinutes + minutes,
        };
        setDailyStats(updatedStats);

        try {
            const dailyStatsService = new FirestoreService<DailyStats>(user.uid, 'dailyStats');
            await dailyStatsService.updateDocument(dailyStats.date, {
                studyMinutes: updatedStats.studyMinutes
            });
        } catch (error) {
            console.error('Error updating study time:', error);
        }
    };

    const incrementFocusSession = async () => {
        if (!user) return;

        const updatedStats = {
            ...dailyStats,
            focusSessions: dailyStats.focusSessions + 1,
        };
        setDailyStats(updatedStats);

        try {
            const dailyStatsService = new FirestoreService<DailyStats>(user.uid, 'dailyStats');
            await dailyStatsService.updateDocument(dailyStats.date, {
                focusSessions: updatedStats.focusSessions
            });
        } catch (error) {
            console.error('Error incrementing focus session:', error);
        }
    };

    const getStudyHours = (): string => {
        const hours = Math.floor(dailyStats.studyMinutes / 60);
        const minutes = dailyStats.studyMinutes % 60;

        if (hours === 0 && minutes === 0) {
            return '0h';
        } else if (hours === 0) {
            return `${minutes}m`;
        } else if (minutes === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${minutes}m`;
        }
    };

    return (
        <DailyStatsContext.Provider
            value={{
                studyMinutes: dailyStats.studyMinutes,
                focusSessions: dailyStats.focusSessions,
                addStudyTime,
                incrementFocusSession,
                getStudyHours,
            }}
        >
            {children}
        </DailyStatsContext.Provider>
    );
}

export function useDailyStats() {
    const context = useContext(DailyStatsContext);
    if (!context) {
        throw new Error('useDailyStats must be used within DailyStatsProvider');
    }
    return context;
}
