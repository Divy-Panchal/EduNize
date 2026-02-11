import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useDailyStats } from './DailyStatsContext';
import { getTimeOfDay, updateTimeBasedAchievements } from '../utils/achievementHelpers';
import { FirestoreService } from '../services/firestoreService';
import { LocalNotificationService } from '../services/localNotificationService';
import toast from 'react-hot-toast';

export type PomodoroMode = 'work' | 'short' | 'long';

interface PomodoroDurations {
    work: number;
    short: number;
    long: number;
}

interface PomodoroSettings {
    durations: PomodoroDurations;
    sessions: number;
    totalMinutes: number;
}

interface PomodoroContextType {
    // Timer state
    mode: PomodoroMode;
    timeLeft: number;
    isActive: boolean;
    isAlarmPlaying: boolean;

    // Session tracking
    sessions: number;
    totalMinutes: number;

    // Durations
    durations: PomodoroDurations;

    // Control functions
    toggleTimer: () => void;
    resetTimer: () => void;
    switchMode: (newMode: PomodoroMode, showToast?: boolean) => void;
    setTimeLeft: (time: number) => void;
    setDurations: (durations: PomodoroDurations) => Promise<void>;
    stopAlarm: () => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

const DEFAULT_DURATIONS = { work: 30 * 60, short: 5 * 60, long: 15 * 60 };
const MAX_SECONDS = 60 * 60;

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { addStudyTime, incrementFocusSession } = useDailyStats();

    const alarmRef = useRef<HTMLAudioElement | null>(null);

    const [durations, setDurationsState] = useState<PomodoroDurations>(DEFAULT_DURATIONS);
    const [mode, setMode] = useState<PomodoroMode>('work');
    const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.work);
    const [isActive, setIsActive] = useState(false);
    const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [totalMinutes, setTotalMinutes] = useState(0);

    // Load Pomodoro settings from Firestore
    useEffect(() => {
        if (!user) {
            setDurationsState(DEFAULT_DURATIONS);
            setSessions(0);
            setTotalMinutes(0);
            setMode('work');
            setTimeLeft(DEFAULT_DURATIONS.work);
            setIsActive(false);
            return;
        }

        const pomodoroService = new FirestoreService<PomodoroSettings>(user.uid, 'pomodoro');

        // Load settings once
        const loadSettings = async () => {
            try {
                const settings = await pomodoroService.getDocument('settings');
                if (settings) {
                    setDurationsState(settings.durations || DEFAULT_DURATIONS);
                    setSessions(settings.sessions || 0);
                    setTotalMinutes(settings.totalMinutes || 0);
                }
            } catch (error) {
                console.error('Error loading Pomodoro settings:', error);
            }
        };

        loadSettings();
    }, [user]);

    // Save durations to Firestore when they change
    const setDurations = async (newDurations: PomodoroDurations) => {
        if (!user) return;

        setDurationsState(newDurations);

        try {
            const pomodoroService = new FirestoreService<PomodoroSettings>(user.uid, 'pomodoro');
            // Use setDocument instead of updateDocument to create the document if it doesn't exist
            await pomodoroService.setDocument('settings', { durations: newDurations });
        } catch (error) {
            console.error('Error saving Pomodoro durations:', error);
            toast.error('Failed to save timer settings. Please try again.');
        }
    };

    // Sync timeLeft with durations when mode changes (only if not active)
    useEffect(() => {
        if (!isActive) {
            setTimeLeft(durations[mode]);
        }
    }, [durations, mode, isActive]);

    // Save sessions to Firestore when they change
    useEffect(() => {
        if (!user || sessions === 0) return;

        const saveSessionsDebounced = setTimeout(async () => {
            try {
                const pomodoroService = new FirestoreService<PomodoroSettings>(user.uid, 'pomodoro');
                await pomodoroService.setDocument('settings', { sessions });
            } catch (error) {
                console.error('Error saving Pomodoro sessions:', error);
            }
        }, 500);

        return () => clearTimeout(saveSessionsDebounced);
    }, [sessions, user]);

    // Save total minutes to Firestore when they change
    useEffect(() => {
        if (!user || totalMinutes === 0) return;

        const saveTotalMinutesDebounced = setTimeout(async () => {
            try {
                const pomodoroService = new FirestoreService<PomodoroSettings>(user.uid, 'pomodoro');
                await pomodoroService.setDocument('settings', { totalMinutes });
            } catch (error) {
                console.error('Error saving Pomodoro total minutes:', error);
            }
        }, 1000);

        return () => clearTimeout(saveTotalMinutesDebounced);
    }, [totalMinutes, user]);

    // Play alarm sound
    const playAlarm = useCallback(() => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            const createBellTone = (frequency: number, startTime: number, duration: number) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                const vibrato = audioContext.createOscillator();
                const vibratoGain = audioContext.createGain();

                vibrato.frequency.value = 5;
                vibratoGain.gain.value = 2;

                vibrato.connect(vibratoGain);
                vibratoGain.connect(oscillator.frequency);
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.type = 'sine';
                oscillator.frequency.value = frequency;

                const now = audioContext.currentTime + startTime;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

                oscillator.start(now);
                vibrato.start(now);
                oscillator.stop(now + duration);
                vibrato.stop(now + duration);
            };

            // Create pleasant bell chord
            createBellTone(523.25, 0, 2.0);
            createBellTone(659.25, 0, 1.8);
            createBellTone(783.99, 0, 1.6);
            createBellTone(1046.50, 0, 1.2);

            setTimeout(() => {
                createBellTone(523.25, 0, 1.5);
                createBellTone(659.25, 0, 1.3);
                createBellTone(783.99, 0, 1.1);
            }, 800);

            setIsAlarmPlaying(true);
            setTimeout(() => setIsAlarmPlaying(false), 3000);
        } catch (error) {
            console.error('Error creating bell chime sound:', error);
        }
    }, []);

    const stopAlarm = useCallback(() => {
        if (alarmRef.current) {
            alarmRef.current.pause();
            alarmRef.current.currentTime = 0;
        }
        setIsAlarmPlaying(false);
    }, []);

    const switchMode = useCallback((newMode: PomodoroMode, showToast = false) => {
        stopAlarm();
        setIsActive(false);
        setMode(newMode);
        setTimeLeft(durations[newMode]);

        if (showToast) {
            const messages = {
                work: '🎯 Break over! Ready for another work session?',
                short: '☕ Work session complete! Take a short break.',
                long: '🎉 Great work! Time for a long break!',
            };
            toast.success(messages[newMode]);
        }
    }, [durations, stopAlarm]);

    // Timer countdown logic
    useEffect(() => {
        if (!isActive || timeLeft === 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
            if (mode === 'work') {
                setTotalMinutes(prev => prev + 1 / 60);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    // Handle timer completion
    useEffect(() => {
        if (!isActive || timeLeft > 0) return;

        playAlarm();

        if (mode === 'work') {
            const newSessions = sessions + 1;
            setSessions(newSessions);

            // Add study time to daily stats
            const studyMinutes = Math.floor(durations.work / 60);
            addStudyTime(studyMinutes);

            // Increment focus session count
            incrementFocusSession();

            // Track time-based achievements (Early Bird / Night Owl)
            if (user?.uid) {
                const timeOfDay = getTimeOfDay();
                updateTimeBasedAchievements(user.uid, timeOfDay);
            }

            // Trigger achievement check
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('checkAchievements'));
            }, 100);

            switchMode(newSessions % 4 === 0 ? 'long' : 'short', true);
        } else {
            switchMode('work', true);
        }
    }, [isActive, timeLeft, mode, sessions, switchMode, playAlarm, durations.work, addStudyTime, incrementFocusSession, user]);

    const toggleTimer = () => {
        const nextActive = !isActive;
        setIsActive(nextActive);

        if (nextActive) {
            // Schedule local notification for completion
            LocalNotificationService.scheduleFocusCompletion(timeLeft / 60);
        } else {
            stopAlarm();
            // Cancel local notification if paused
            LocalNotificationService.cancelFocusNotification();
        }
    };

    const resetTimer = () => {
        stopAlarm();
        setIsActive(false);
        setTimeLeft(durations[mode]);
    };

    return (
        <PomodoroContext.Provider
            value={{
                mode,
                timeLeft,
                isActive,
                isAlarmPlaying,
                sessions,
                totalMinutes,
                durations,
                toggleTimer,
                resetTimer,
                switchMode,
                setTimeLeft,
                setDurations,
                stopAlarm,
            }}
        >
            {children}
        </PomodoroContext.Provider>
    );
}

export function usePomodoro() {
    const context = useContext(PomodoroContext);
    if (!context) {
        throw new Error('usePomodoro must be used within PomodoroProvider');
    }
    return context;
}
