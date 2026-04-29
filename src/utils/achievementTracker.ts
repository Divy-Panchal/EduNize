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
    const dailyStatsKey = `dailyStats_${userId}`;
    const data = localStorage.getItem(dailyStatsKey);

    if (data) {
        const stats = JSON.parse(data);
        const today = new Date().toISOString().split('T')[0];
        const lastStudyDate = stats.lastStudyDate;

        if (lastStudyDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastStudyDate === yesterdayStr) {
                // Continuing streak
                stats.studyStreak = (stats.studyStreak || 0) + 1;
            } else if (lastStudyDate !== today) {
                // Streak broken
                stats.studyStreak = 1;
            }
        } else {
            stats.studyStreak = 1;
        }

        stats.lastStudyDate = today;
        localStorage.setItem(dailyStatsKey, JSON.stringify(stats));
    }
};
