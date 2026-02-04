import { FirestoreService } from '../services/firestoreService';
import toast from 'react-hot-toast';

/**
 * Migrate existing localStorage data to Firestore for a user
 * This should be run once per user after they log in
 */
export async function migrateLocalStorageToFirestore(userId: string): Promise<boolean> {
    try {
        console.log('🔄 Starting localStorage to Firestore migration...');

        // Migrate Grades
        const gradesKey = `grades_${userId}`;
        const savedGrades = localStorage.getItem(gradesKey);
        if (savedGrades) {
            try {
                const grades = JSON.parse(savedGrades);
                const gradeService = new FirestoreService(userId, 'grades');
                for (const grade of grades) {
                    await gradeService.setDocument(grade.id, grade);
                }
                console.log(`✅ Migrated ${grades.length} grades`);
            } catch (error) {
                console.error('Error migrating grades:', error);
            }
        }

        // Migrate Grading System Preference
        const systemKey = `gradingSystem_${userId}`;
        const savedSystem = localStorage.getItem(systemKey);
        if (savedSystem) {
            try {
                const settingsService = new FirestoreService(userId, 'settings');
                await settingsService.setDocument('preferences', { gradingSystem: savedSystem });
                console.log('✅ Migrated grading system preference');
            } catch (error) {
                console.error('Error migrating grading system:', error);
            }
        }

        // Migrate Tasks (global key - needs migration for all users)
        const savedTasks = localStorage.getItem('eduorganize-tasks');
        if (savedTasks) {
            try {
                const tasks = JSON.parse(savedTasks);
                const taskService = new FirestoreService(userId, 'tasks');
                for (const task of tasks) {
                    await taskService.setDocument(task.id, task);
                }
                console.log(`✅ Migrated ${tasks.length} tasks`);
            } catch (error) {
                console.error('Error migrating tasks:', error);
            }
        }

        // Migrate Timetable (global key - needs migration)
        const savedClasses = localStorage.getItem('edunize-timetable');
        if (savedClasses) {
            try {
                const classes = JSON.parse(savedClasses);
                const timetableService = new FirestoreService(userId, 'timetable');
                for (const cls of classes) {
                    if (cls.id) {
                        await timetableService.setDocument(cls.id, cls);
                    }
                }
                console.log(`✅ Migrated ${classes.length} timetable classes`);
            } catch (error) {
                console.error('Error migrating timetable:', error);
            }
        }

        // Migrate Subjects (global key - needs migration)
        const savedSubjects = localStorage.getItem('edunize-subjects');
        if (savedSubjects) {
            try {
                const subjects = JSON.parse(savedSubjects);
                const subjectService = new FirestoreService(userId, 'subjects');
                for (const subject of subjects) {
                    await subjectService.setDocument(subject.id, subject);
                }
                console.log(`✅ Migrated ${subjects.length} subjects`);
            } catch (error) {
                console.error('Error migrating subjects:', error);
            }
        }

        // Migrate Achievements
        const achievementsKey = `achievements_${userId}`;
        const savedAchievements = localStorage.getItem(achievementsKey);
        if (savedAchievements) {
            try {
                const achievements = JSON.parse(savedAchievements);
                const achievementService = new FirestoreService(userId, 'achievements');
                for (const achievement of achievements) {
                    await achievementService.setDocument(achievement.id, achievement);
                }
                console.log(`✅ Migrated ${achievements.length} achievements`);
            } catch (error) {
                console.error('Error migrating achievements:', error);
            }
        }

        // Migrate Daily Stats
        const dailyStatsKey = `dailyStats_${userId}`;
        const savedDailyStats = localStorage.getItem(dailyStatsKey);
        if (savedDailyStats) {
            try {
                const dailyStats = JSON.parse(savedDailyStats);
                const dailyStatsService = new FirestoreService(userId, 'dailyStats');
                await dailyStatsService.setDocument(dailyStats.date, dailyStats);
                console.log('✅ Migrated daily stats');
            } catch (error) {
                console.error('Error migrating daily stats:', error);
            }
        }

        // Migrate Notifications (global key - needs migration)
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications) {
            try {
                const notifications = JSON.parse(savedNotifications);
                const notificationService = new FirestoreService(userId, 'notifications');
                for (const notification of notifications) {
                    await notificationService.setDocument(notification.id, notification);
                }
                console.log(`✅ Migrated ${notifications.length} notifications`);
            } catch (error) {
                console.error('Error migrating notifications:', error);
            }
        }

        // Migrate Notification Settings (global key - needs migration)
        const savedNotificationSettings = localStorage.getItem('notificationSettings');
        if (savedNotificationSettings) {
            try {
                const settings = JSON.parse(savedNotificationSettings);
                const settingsService = new FirestoreService(userId, 'settings');
                await settingsService.setDocument('notificationSettings', settings);
                console.log('✅ Migrated notification settings');
            } catch (error) {
                console.error('Error migrating notification settings:', error);
            }
        }

        // Migrate Pomodoro Data
        const pomodoroDurations = localStorage.getItem('pomodoroDurations');
        const pomodoroSessions = localStorage.getItem('pomodoroSessions');
        const pomodoroTotalMinutes = localStorage.getItem('pomodoroTotalMinutes');

        if (pomodoroDurations || pomodoroSessions || pomodoroTotalMinutes) {
            try {
                const pomodoroService = new FirestoreService(userId, 'pomodoro');
                const pomodoroData: any = {};

                if (pomodoroDurations) {
                    pomodoroData.durations = JSON.parse(pomodoroDurations);
                }
                if (pomodoroSessions) {
                    pomodoroData.sessions = parseInt(pomodoroSessions, 10);
                }
                if (pomodoroTotalMinutes) {
                    pomodoroData.totalMinutes = parseInt(pomodoroTotalMinutes, 10);
                }

                await pomodoroService.setDocument('settings', pomodoroData);
                console.log('✅ Migrated Pomodoro data');
            } catch (error) {
                console.error('Error migrating Pomodoro data:', error);
            }
        }

        console.log('✅ Migration completed successfully!');
        toast.success('Your data has been migrated to cloud storage!');
        return true;
    } catch (error) {
        console.error('❌ Migration failed:', error);
        toast.error('Failed to migrate data. Please try again.');
        return false;
    }
}

/**
 * Check if migration has already been completed for a user
 */
export function isMigrationComplete(userId: string): boolean {
    const migrationKey = `firestore_migrated_${userId}`;
    return localStorage.getItem(migrationKey) === 'true';
}

/**
 * Mark migration as complete for a user
 */
export function markMigrationComplete(userId: string): void {
    const migrationKey = `firestore_migrated_${userId}`;
    localStorage.setItem(migrationKey, 'true');
}
