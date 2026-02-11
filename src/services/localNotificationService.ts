import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const LocalNotificationService = {
    // Request permissions
    async requestPermissions() {
        if (Capacitor.getPlatform() === 'web') return true;

        try {
            const status = await LocalNotifications.requestPermissions();
            return status.display === 'granted';
        } catch (error) {
            console.error('Error requesting local notification permissions:', error);
            return false;
        }
    },

    // Schedule task reminder (1 hour before due date)
    async scheduleTaskReminder(taskId: string, title: string, dueDate: Date) {
        if (Capacitor.getPlatform() === 'web') return;

        const scheduleDate = new Date(dueDate.getTime() - 60 * 60 * 1000); // 1 hour before

        if (scheduleDate < new Date()) return; // Already passed

        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: '📝 Task Reminder',
                        body: `"${title}" is due in 1 hour!`,
                        id: this.generateNotificationId(taskId),
                        schedule: { at: scheduleDate },
                        sound: 'default',
                        attachments: [],
                        actionTypeId: '',
                        extra: { taskId }
                    },
                ],
            });
            console.log(`Scheduled local notification for task: ${title} at ${scheduleDate}`);
        } catch (error) {
            console.error('Error scheduling task local notification:', error);
        }
    },

    // Schedule class reminder (15 minutes before)
    async scheduleClassReminder(classId: string, subject: string, classTime: Date) {
        if (Capacitor.getPlatform() === 'web') return;

        const scheduleDate = new Date(classTime.getTime() - 15 * 60 * 1000); // 15 min before

        if (scheduleDate < new Date()) return;

        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: '🎓 Class Starting Soon',
                        body: `Your ${subject} class starts in 15 minutes!`,
                        id: this.generateNotificationId(classId),
                        schedule: { at: scheduleDate },
                        sound: 'default',
                        extra: { classId }
                    },
                ],
            });
            console.log(`Scheduled local notification for class: ${subject} at ${scheduleDate}`);
        } catch (error) {
            console.error('Error scheduling class local notification:', error);
        }
    },

    // Schedule Focus Session completion
    async scheduleFocusCompletion(durationMinutes: number) {
        if (Capacitor.getPlatform() === 'web') return;

        const scheduleDate = new Date(new Date().getTime() + durationMinutes * 60 * 1000);

        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: '🎯 Focus Session Complete!',
                        body: 'Great job! Time for a short break.',
                        id: 9999, // Unique ID for focus timer
                        schedule: { at: scheduleDate },
                        sound: 'default',
                    },
                ],
            });
            console.log(`Scheduled local notification for focus completion at ${scheduleDate}`);
        } catch (error) {
            console.error('Error scheduling focus local notification:', error);
        }
    },

    // Cancel focus notification if timer stopped
    async cancelFocusNotification() {
        if (Capacitor.getPlatform() === 'web') return;
        await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
    },

    // Helper to generate a numeric ID from a string ID
    generateNotificationId(id: string): number {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            const char = id.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
};
