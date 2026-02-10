import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export class NotificationService {
    private static isNative = Capacitor.isNativePlatform();

    /**
     * Request notification permissions
     */
    static async requestPermissions(): Promise<boolean> {
        if (!this.isNative) {
            console.log('Notifications only work on native platforms');
            return false;
        }

        try {
            const result = await LocalNotifications.requestPermissions();
            return result.display === 'granted';
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            return false;
        }
    }

    /**
     * Check if notifications are enabled
     */
    static async checkPermissions(): Promise<boolean> {
        if (!this.isNative) return false;

        try {
            const result = await LocalNotifications.checkPermissions();
            return result.display === 'granted';
        } catch (error) {
            console.error('Error checking notification permissions:', error);
            return false;
        }
    }

    /**
     * Schedule a task reminder notification
     */
    static async scheduleTaskReminder(
        taskId: string,
        taskTitle: string,
        dueDate: Date,
        reminderMinutes: number = 60
    ): Promise<void> {
        if (!this.isNative) return;

        const hasPermission = await this.checkPermissions();
        if (!hasPermission) {
            await this.requestPermissions();
            return;
        }

        try {
            const notificationTime = new Date(dueDate.getTime() - reminderMinutes * 60 * 1000);

            // Don't schedule if time is in the past
            if (notificationTime < new Date()) return;

            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: parseInt(taskId.replace(/\D/g, '').slice(0, 9)) || Math.floor(Math.random() * 1000000),
                        title: '📝 Task Reminder',
                        body: `"${taskTitle}" is due ${reminderMinutes === 60 ? 'in 1 hour' : `in ${reminderMinutes} minutes`}`,
                        schedule: { at: notificationTime },
                        sound: 'default',
                        smallIcon: 'ic_stat_icon_config_sample',
                        channelId: 'tasks',
                    },
                ],
            });

            console.log(`Scheduled notification for task: ${taskTitle}`);
        } catch (error) {
            console.error('Error scheduling task notification:', error);
        }
    }

    /**
     * Schedule a class notification
     */
    static async scheduleClassNotification(
        classId: string,
        subject: string,
        classTime: string,
        day: number
    ): Promise<void> {
        if (!this.isNative) return;

        const hasPermission = await this.checkPermissions();
        if (!hasPermission) {
            await this.requestPermissions();
            return;
        }

        try {
            // Calculate next occurrence of this class
            const now = new Date();
            const currentDay = now.getDay();
            const targetDay = day === 6 ? 0 : day + 1; // Convert our format to JS format

            let daysUntilClass = targetDay - currentDay;
            if (daysUntilClass < 0) daysUntilClass += 7;
            if (daysUntilClass === 0 && now.getHours() >= parseInt(classTime.split(':')[0])) {
                daysUntilClass = 7; // If today but time passed, schedule for next week
            }

            const classDate = new Date(now);
            classDate.setDate(classDate.getDate() + daysUntilClass);
            const [hours, minutes] = classTime.split(':');
            classDate.setHours(parseInt(hours), parseInt(minutes) - 15, 0, 0); // 15 min before

            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: parseInt(classId.replace(/\D/g, '').slice(0, 9)) || Math.floor(Math.random() * 1000000),
                        title: '🎓 Class Starting Soon',
                        body: `${subject} starts in 15 minutes`,
                        schedule: { at: classDate },
                        sound: 'default',
                        smallIcon: 'ic_stat_icon_config_sample',
                        channelId: 'classes',
                    },
                ],
            });

            console.log(`Scheduled notification for class: ${subject}`);
        } catch (error) {
            console.error('Error scheduling class notification:', error);
        }
    }

    /**
     * Send achievement unlocked notification
     */
    static async sendAchievementNotification(
        achievementTitle: string,
        achievementDescription: string
    ): Promise<void> {
        if (!this.isNative) return;

        const hasPermission = await this.checkPermissions();
        if (!hasPermission) return;

        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: Math.floor(Math.random() * 1000000),
                        title: '🏆 Achievement Unlocked!',
                        body: `${achievementTitle}: ${achievementDescription}`,
                        schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
                        sound: 'default',
                        smallIcon: 'ic_stat_icon_config_sample',
                        channelId: 'achievements',
                    },
                ],
            });

            console.log(`Sent achievement notification: ${achievementTitle}`);
        } catch (error) {
            console.error('Error sending achievement notification:', error);
        }
    }

    /**
     * Schedule daily study reminder
     */
    static async scheduleDailyReminder(hour: number = 9, minute: number = 0): Promise<void> {
        if (!this.isNative) return;

        const hasPermission = await this.checkPermissions();
        if (!hasPermission) {
            await this.requestPermissions();
            return;
        }

        try {
            const reminderTime = new Date();
            reminderTime.setHours(hour, minute, 0, 0);

            // If time has passed today, schedule for tomorrow
            if (reminderTime < new Date()) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }

            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: 999999, // Fixed ID for daily reminder
                        title: '📚 Time to Study!',
                        body: 'Start your day with some productive studying',
                        schedule: {
                            at: reminderTime,
                            every: 'day'
                        },
                        sound: 'default',
                        smallIcon: 'ic_stat_icon_config_sample',
                        channelId: 'reminders',
                    },
                ],
            });

            console.log('Scheduled daily study reminder');
        } catch (error) {
            console.error('Error scheduling daily reminder:', error);
        }
    }

    /**
     * Cancel a specific notification
     */
    static async cancelNotification(notificationId: number): Promise<void> {
        if (!this.isNative) return;

        try {
            await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
            console.log(`Cancelled notification: ${notificationId}`);
        } catch (error) {
            console.error('Error cancelling notification:', error);
        }
    }

    /**
     * Cancel all pending notifications
     */
    static async cancelAllNotifications(): Promise<void> {
        if (!this.isNative) return;

        try {
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel({ notifications: pending.notifications });
                console.log(`Cancelled ${pending.notifications.length} notifications`);
            }
        } catch (error) {
            console.error('Error cancelling all notifications:', error);
        }
    }

    /**
     * Get all pending notifications
     */
    static async getPendingNotifications(): Promise<any[]> {
        if (!this.isNative) return [];

        try {
            const result = await LocalNotifications.getPending();
            return result.notifications;
        } catch (error) {
            console.error('Error getting pending notifications:', error);
            return [];
        }
    }
}
