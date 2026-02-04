import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { FirestoreService } from '../services/firestoreService';
import toast from 'react-hot-toast';

export interface Notification {
    id: string;
    type: 'task' | 'pomodoro' | 'achievement' | 'progress' | 'general';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    icon?: string;
}

export interface NotificationSettings {
    taskReminders: boolean;
    pomodoroBreaks: boolean;
    weeklyProgress: boolean;
    achievementUnlocked: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    settings: NotificationSettings;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    removeNotification: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
    updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEFAULT_SETTINGS: NotificationSettings = {
    taskReminders: true,
    pomodoroBreaks: true,
    weeklyProgress: false,
    achievementUnlocked: true,
};

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

    // Load notifications from Firestore with real-time sync
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setSettings(DEFAULT_SETTINGS);
            return;
        }

        const notificationService = new FirestoreService<Notification>(user.uid, 'notifications');
        const settingsService = new FirestoreService<NotificationSettings>(user.uid, 'settings');

        // Subscribe to real-time notification updates
        const unsubscribeNotifications = notificationService.subscribeToCollection(
            (firestoreNotifications) => {
                // Sort by timestamp (newest first) and limit to 50
                const sorted = firestoreNotifications
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 50);
                setNotifications(sorted);
            },
            (error) => {
                console.error('Error loading notifications:', error);
                toast.error('Failed to load notifications. Please check your connection.');
            }
        );

        // Load notification settings
        const loadSettings = async () => {
            try {
                const savedSettings = await settingsService.getDocument('notificationSettings');
                if (savedSettings) {
                    setSettings(savedSettings as NotificationSettings);
                }
            } catch (error) {
                console.error('Error loading notification settings:', error);
            }
        };
        loadSettings();

        return () => {
            unsubscribeNotifications();
        };
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        if (!user) {
            console.warn('Cannot add notification: user not logged in');
            return;
        }

        // Check if notification type is enabled in settings
        const settingKey = {
            task: 'taskReminders',
            pomodoro: 'pomodoroBreaks',
            progress: 'weeklyProgress',
            achievement: 'achievementUnlocked',
            general: 'taskReminders', // Default to taskReminders for general notifications
        }[notification.type] as keyof NotificationSettings;

        if (!settings[settingKey]) {
            return; // Don't add notification if this type is disabled
        }

        try {
            const notificationService = new FirestoreService<Notification>(user.uid, 'notifications');
            const newNotification: Notification = {
                ...notification,
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                read: false,
            };

            await notificationService.setDocument(newNotification.id, newNotification);
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    };

    const markAsRead = async (id: string) => {
        if (!user) return;

        try {
            const notificationService = new FirestoreService<Notification>(user.uid, 'notifications');
            await notificationService.updateDocument(id, { read: true });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;

        try {
            const notificationService = new FirestoreService<Notification>(user.uid, 'notifications');
            const unreadNotifications = notifications.filter(n => !n.read);

            // Update all unread notifications
            await Promise.all(
                unreadNotifications.map(n =>
                    notificationService.updateDocument(n.id, { read: true })
                )
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all as read. Please try again.');
        }
    };

    const removeNotification = async (id: string) => {
        if (!user) return;

        try {
            const notificationService = new FirestoreService<Notification>(user.uid, 'notifications');
            await notificationService.deleteDocument(id);
        } catch (error) {
            console.error('Error removing notification:', error);
            toast.error('Failed to remove notification. Please try again.');
        }
    };

    const clearAll = async () => {
        if (!user) return;

        try {
            const notificationService = new FirestoreService<Notification>(user.uid, 'notifications');

            // Delete all notifications
            await Promise.all(
                notifications.map(n => notificationService.deleteDocument(n.id))
            );
        } catch (error) {
            console.error('Error clearing all notifications:', error);
            toast.error('Failed to clear notifications. Please try again.');
        }
    };

    const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
        if (!user) return;

        try {
            const updatedSettings = { ...settings, ...newSettings };
            setSettings(updatedSettings);

            const settingsService = new FirestoreService<NotificationSettings>(user.uid, 'settings');
            await settingsService.setDocument('notificationSettings', updatedSettings);
        } catch (error) {
            console.error('Error updating notification settings:', error);
            toast.error('Failed to update settings. Please try again.');
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                settings,
                addNotification,
                markAsRead,
                markAllAsRead,
                removeNotification,
                clearAll,
                updateSettings,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        // Return a safe default when context is not available
        return {
            notifications: [],
            unreadCount: 0,
            settings: DEFAULT_SETTINGS,
            addNotification: async () => { },
            markAsRead: async () => { },
            markAllAsRead: async () => { },
            removeNotification: async () => { },
            clearAll: async () => { },
            updateSettings: async () => { },
        };
    }
    return context;
}
