export const trackEarlyBirdStudy = (userId: string) => {
    const now = new Date();
    const hour = now.getHours();

    // Check if studying before 8 AM
    if (hour < 8) {
        const key = `earlyBirdCount_${userId}`;
        const lastStudyDate = localStorage.getItem(`${key}_lastDate`);
        const today = now.toDateString();

        // Only count once per day
        if (lastStudyDate !== today) {
            const currentCount = parseInt(localStorage.getItem(key) || '0', 10);
            localStorage.setItem(key, (currentCount + 1).toString());
            localStorage.setItem(`${key}_lastDate`, today);
        }
    }
};

export const updateStudyStreak = (userId: string) => {
    const streakKey = `studyStreak_${userId}`;
    const lastDateKey = `lastStudyDate_${userId}`;

    const currentStreakStr = localStorage.getItem(streakKey);
    const lastStudyDate = localStorage.getItem(lastDateKey);
    const today = new Date().toISOString().split('T')[0];

    let newStreak = parseInt(currentStreakStr || '0', 10);

    if (lastStudyDate) {
        if (lastStudyDate === today) {
            // Already tracked today, do nothing
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastStudyDate === yesterdayStr) {
            // Continuing streak
            newStreak += 1;
        } else {
            // Streak broken
            newStreak = 1;
        }
    } else {
        // First time studying
        newStreak = 1;
    }

    localStorage.setItem(streakKey, newStreak.toString());
    localStorage.setItem(lastDateKey, today);
};
