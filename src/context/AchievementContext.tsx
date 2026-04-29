import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { FirestoreService } from '../services/firestoreService';
import toast from 'react-hot-toast';

// Achievement type definition
export interface Achievement {
    id: string;
    name: string;
    icon: string;
    description: string;
    unlocked: boolean;
    claimed: boolean;
    progress: number;
    maxProgress: number;
    category?: string;
    points?: number;
}

interface AchievementContextType {
    achievements: Achievement[];
    checkAchievements: () => void;
    claimAchievement: (achievementId: string) => Promise<void>;
    updateAchievementProgress: (achievementId: string, progress: number) => Promise<void>;
    getTotalPoints: () => number;
    getUnlockedCount: () => number;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

// Default achievements
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'early_bird',
        name: 'Early Bird',
        icon: '🌅',
        description: 'Study before 8 AM',
        unlocked: false,
        claimed: false,
        progress: 0,
        maxProgress: 1,
        category: 'time',
        points: 50
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        icon: '🦉',
        description: 'Study after 10 PM',
        unlocked: false,
        claimed: false,
        progress: 0,
        maxProgress: 1,
        category: 'time',
        points: 50
    },
    {
        id: 'streak_master',
        name: 'Streak Master',
        icon: '🔥',
        description: '7 day study streak',
        unlocked: false,
        claimed: false,
        progress: 0,
        maxProgress: 7,
        category: 'consistency',
        points: 100
    },
    {
        id: 'task_crusher',
        name: 'Task Crusher',
        icon: '✅',
        description: 'Complete 50 tasks',
        unlocked: false,
        claimed: false,
        progress: 0,
        maxProgress: 50,
        category: 'productivity',
        points: 150
    },
    {
        id: 'focus_master',
        name: 'Focus Master',
        icon: '🎯',
        description: 'Complete 100 Pomodoro sessions',
        unlocked: false,
        claimed: false,
        progress: 0,
        maxProgress: 100,
        category: 'focus',
        points: 200
    }
];

export function AchievementProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);

    // Load achievements from Firestore with real-time sync
    useEffect(() => {
        if (!user) {
            setAchievements([]);
            return;
        }

        const achievementService = new FirestoreService<Achievement>(user.uid, 'achievements');

        // Subscribe to real-time achievement updates
        const unsubscribe = achievementService.subscribeToCollection(
            (firestoreAchievements) => {
                if (firestoreAchievements.length === 0) {
                    // Initialize with default achievements if none exist
                    initializeDefaultAchievements();
                } else {
                    setAchievements(firestoreAchievements);
                }
            },
            (error) => {
                console.error('Error loading achievements:', error);
                toast.error('Failed to load achievements. Please check your connection.');
            }
        );

        return () => {
            unsubscribe();
        };
    }, [user]);

    // Initialize default achievements in Firestore
    const initializeDefaultAchievements = async () => {
        if (!user) return;

        try {
            const achievementService = new FirestoreService<Achievement>(user.uid, 'achievements');
            for (const achievement of DEFAULT_ACHIEVEMENTS) {
                await achievementService.setDocument(achievement.id, achievement);
            }
        } catch (error) {
            console.error('Error initializing achievements:', error);
        }
    };

    // Check and update achievements based on current stats
    const checkAchievements = useCallback(() => {
        if (!user) return;

        const now = new Date();
        const hour = now.getHours();

        // Get stats from localStorage (these will be migrated later)
        const completedTasks = parseInt(localStorage.getItem(`completedTasksCount_${user.uid}`) || '0');
        const studyStreak = parseInt(localStorage.getItem(`studyStreak_${user.uid}`) || '0');
        const pomodoroSessions = parseInt(localStorage.getItem('pomodoroSessions') || '0');

        const achievementService = new FirestoreService<Achievement>(user.uid, 'achievements');

        achievements.forEach(async (achievement) => {
            let shouldUpdate = false;
            let newProgress = achievement.progress;
            let newUnlocked = achievement.unlocked;

            // Early Bird - Study before 8 AM
            if (achievement.id === 'early_bird' && hour < 8 && !achievement.unlocked) {
                newProgress = 1;
                newUnlocked = true;
                shouldUpdate = true;
            }

            // Night Owl - Study after 10 PM
            if (achievement.id === 'night_owl' && hour >= 22 && !achievement.unlocked) {
                newProgress = 1;
                newUnlocked = true;
                shouldUpdate = true;
            }

            // Streak Master - 7 day streak
            if (achievement.id === 'streak_master') {
                const calculatedProgress = Math.min(studyStreak, 7);
                if (achievement.progress !== calculatedProgress) {
                    newProgress = calculatedProgress;
                    shouldUpdate = true;
                }
                if (studyStreak >= 7 && !achievement.unlocked) {
                    newUnlocked = true;
                    shouldUpdate = true;
                }
            }

            // Task Crusher - Complete 50 tasks
            if (achievement.id === 'task_crusher') {
                const calculatedProgress = Math.min(completedTasks, 50);
                if (achievement.progress !== calculatedProgress) {
                    newProgress = calculatedProgress;
                    shouldUpdate = true;
                }
                if (completedTasks >= 50 && !achievement.unlocked) {
                    newUnlocked = true;
                    shouldUpdate = true;
                }
            }

            // Focus Master - 100 Pomodoro sessions
            if (achievement.id === 'focus_master') {
                const calculatedProgress = Math.min(pomodoroSessions, 100);
                if (achievement.progress !== calculatedProgress) {
                    newProgress = calculatedProgress;
                    shouldUpdate = true;
                }
                if (pomodoroSessions >= 100 && !achievement.unlocked) {
                    newUnlocked = true;
                    shouldUpdate = true;
                }
            }

            if (shouldUpdate) {
                try {
                    await achievementService.updateDocument(achievement.id, {
                        progress: newProgress,
                        unlocked: newUnlocked
                    });
                } catch (error) {
                    console.error(`Error updating achievement ${achievement.id}:`, error);
                }
            }
        });
    }, [user, achievements]);

    // Listen for achievement check events
    useEffect(() => {
        const handleCheckAchievements = () => {
            checkAchievements();
        };

        window.addEventListener('checkAchievements', handleCheckAchievements);
        return () => window.removeEventListener('checkAchievements', handleCheckAchievements);
    }, [checkAchievements]);

    // Claim achievement
    const claimAchievement = useCallback(async (achievementId: string) => {
        if (!user) return;

        try {
            const achievementService = new FirestoreService<Achievement>(user.uid, 'achievements');
            const achievement = achievements.find(a => a.id === achievementId);

            if (achievement && achievement.unlocked && !achievement.claimed) {
                await achievementService.updateDocument(achievementId, { claimed: true });
            }
        } catch (error) {
            console.error('Error claiming achievement:', error);
            toast.error('Failed to claim achievement. Please try again.');
        }
    }, [user, achievements]);

    // Update achievement progress manually
    const updateAchievementProgress = useCallback(async (achievementId: string, progress: number) => {
        if (!user) return;

        try {
            const achievement = achievements.find(a => a.id === achievementId);
            if (!achievement) return;

            const newProgress = Math.min(progress, achievement.maxProgress);
            const unlocked = newProgress >= achievement.maxProgress;

            const achievementService = new FirestoreService<Achievement>(user.uid, 'achievements');
            await achievementService.updateDocument(achievementId, {
                progress: newProgress,
                unlocked
            });
        } catch (error) {
            console.error('Error updating achievement progress:', error);
        }
    }, [user, achievements]);

    // Get total points from claimed achievements
    const getTotalPoints = useCallback(() => {
        return achievements
            .filter(a => a.claimed)
            .reduce((sum, a) => sum + (a.points || 0), 0);
    }, [achievements]);

    // Get count of unlocked achievements
    const getUnlockedCount = useCallback(() => {
        return achievements.filter(a => a.unlocked).length;
    }, [achievements]);

    const value: AchievementContextType = {
        achievements,
        checkAchievements,
        claimAchievement,
        updateAchievementProgress,
        getTotalPoints,
        getUnlockedCount
    };

    return (
        <AchievementContext.Provider value={value}>
            {children}
        </AchievementContext.Provider>
    );
}

export function useAchievement() {
    const context = useContext(AchievementContext);
    if (context === undefined) {
        throw new Error('useAchievement must be used within an AchievementProvider');
    }
    return context;
}
