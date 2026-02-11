import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export class FCMService {
    private static isNative = Capacitor.isNativePlatform();
    private static fcmToken: string | null = null;

    /**
     * Initialize FCM and request permissions
     */
    static async initialize(): Promise<boolean> {
        if (!this.isNative) {
            console.log('Push notifications only work on native platforms');
            return false;
        }

        try {
            // Request permission
            const permResult = await PushNotifications.requestPermissions();

            if (permResult.receive !== 'granted') {
                console.log('Push notification permission denied');
                return false;
            }

            // Register with FCM
            await PushNotifications.register();

            // Create a high-importance channel for "WhatsApp-like" behavior
            await PushNotifications.createChannel({
                id: 'fcm_default_channel',
                name: 'Pop-up Notifications',
                description: 'Show notifications with sound and pop-up',
                importance: 5, // High importance (heads up)
                visibility: 1, // Public
                sound: 'default',
                vibration: true,
            });

            // Listen for registration success
            await PushNotifications.addListener('registration', (token: Token) => {
                console.log('FCM Token:', token.value);
                this.fcmToken = token.value;
                // Store token in Firestore for server-side notifications
                this.saveTokenToFirestore(token.value);
            });

            // Listen for registration errors
            await PushNotifications.addListener('registrationError', (error: any) => {
                console.error('FCM Registration Error:', error);
            });

            // Listen for push notifications received
            await PushNotifications.addListener(
                'pushNotificationReceived',
                (notification: PushNotificationSchema) => {
                    console.log('Push notification received:', notification);
                    this.handleNotificationReceived(notification);
                }
            );

            // Listen for notification tap
            await PushNotifications.addListener(
                'pushNotificationActionPerformed',
                (notification: ActionPerformed) => {
                    console.log('Push notification action performed:', notification);
                    this.handleNotificationTap(notification);
                }
            );

            console.log('FCM initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing FCM:', error);
            return false;
        }
    }

    /**
     * Get current FCM token
     */
    static getToken(): string | null {
        return this.fcmToken;
    }

    /**
     * Save FCM token to Firestore
     */
    private static async saveTokenToFirestore(token: string): Promise<void> {
        try {
            // Import dynamically to avoid circular dependencies
            const { getAuth } = await import('firebase/auth');
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../firebaseConfig');

            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const tokenRef = doc(db, 'users', user.uid, 'fcm_tokens', 'current');
                await setDoc(tokenRef, {
                    token,
                    platform: 'android',
                    updatedAt: new Date().toISOString()
                });
                console.log('FCM token saved to Firestore');
            }
        } catch (error) {
            console.error('Error saving FCM token:', error);
        }
    }

    /**
     * Handle notification received while app is open
     */
    private static handleNotificationReceived(notification: PushNotificationSchema): void {
        console.log('Notification received:', notification.title, notification.body);

        // Show in-app notification using existing NotificationContext
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('fcmNotification', {
                detail: {
                    title: notification.title,
                    message: notification.body,
                    data: notification.data
                }
            }));
        }
    }

    /**
     * Handle notification tap
     */
    private static handleNotificationTap(action: ActionPerformed): void {
        const notification = action.notification;
        console.log('Notification tapped:', notification);

        // Navigate based on notification type
        const data = notification.data;

        if (data.type === 'task') {
            // Navigate to tasks page
            window.location.href = '/tasks';
        } else if (data.type === 'class') {
            // Navigate to timetable page
            window.location.href = '/timetable';
        } else if (data.type === 'achievement') {
            // Navigate to profile page
            window.location.href = '/profile';
        }
    }

    /**
     * Send a test notification (for development)
     */
    static async sendTestNotification(): Promise<void> {
        console.log('Test notifications are sent from Firebase Console');
        console.log('FCM Token:', this.fcmToken);
        console.log('Go to Firebase Console > Cloud Messaging to send a test notification');
    }

    /**
     * Schedule a task reminder notification
     * Note: Actual scheduling happens server-side via Firebase Functions
     */
    static async scheduleTaskReminder(
        taskId: string,
        taskTitle: string,
        dueDate: Date
    ): Promise<void> {
        if (!this.isNative) return;

        try {
            // Import dynamically
            const { getAuth } = await import('firebase/auth');
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../firebaseConfig');

            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) return;

            // Store notification schedule in Firestore
            // Firebase Cloud Function will read this and send notifications
            const notificationRef = doc(db, 'users', user.uid, 'scheduled_notifications', taskId);

            await setDoc(notificationRef, {
                type: 'task',
                taskId,
                title: `📝 Task Reminder`,
                body: `"${taskTitle}" is due soon`,
                dueDate: dueDate.toISOString(),
                scheduledFor: new Date(dueDate.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour before
                data: {
                    type: 'task',
                    taskId
                },
                createdAt: new Date().toISOString()
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
        classTime: Date
    ): Promise<void> {
        if (!this.isNative) return;

        try {
            const { getAuth } = await import('firebase/auth');
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../firebaseConfig');

            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) return;

            const notificationRef = doc(db, 'users', user.uid, 'scheduled_notifications', classId);

            await setDoc(notificationRef, {
                type: 'class',
                classId,
                title: `🎓 Class Starting Soon`,
                body: `${subject} starts in 15 minutes`,
                scheduledFor: new Date(classTime.getTime() - 15 * 60 * 1000).toISOString(), // 15 min before
                data: {
                    type: 'class',
                    classId
                },
                createdAt: new Date().toISOString()
            });

            console.log(`Scheduled notification for class: ${subject}`);
        } catch (error) {
            console.error('Error scheduling class notification:', error);
        }
    }

    /**
     * Send achievement notification immediately
     */
    static async sendAchievementNotification(
        achievementTitle: string,
        achievementDescription: string
    ): Promise<void> {
        if (!this.isNative) return;

        try {
            const { getAuth } = await import('firebase/auth');
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../firebaseConfig');

            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) return;

            // Send immediate notification
            const notificationRef = doc(db, 'users', user.uid, 'immediate_notifications', Date.now().toString());

            await setDoc(notificationRef, {
                type: 'achievement',
                title: `🏆 Achievement Unlocked!`,
                body: `${achievementTitle}: ${achievementDescription}`,
                data: {
                    type: 'achievement'
                },
                createdAt: new Date().toISOString()
            });

            console.log(`Sent achievement notification: ${achievementTitle}`);
        } catch (error) {
            console.error('Error sending achievement notification:', error);
        }
    }

    /**
     * Remove all listeners (cleanup)
     */
    static async removeAllListeners(): Promise<void> {
        if (!this.isNative) return;

        await PushNotifications.removeAllListeners();
        console.log('All FCM listeners removed');
    }
}
