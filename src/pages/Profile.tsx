import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Edit, Save, BookOpen, Award, Upload, X,
    Mail, Phone, User as UserIcon,
    Eye, EyeOff, Settings
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getTimeBasedAchievementCount, getDailyTaskCount } from '../utils/achievementHelpers';
import { User } from 'firebase/auth';

// User data structure (without skills and interests)
const initialUserData = {
    fullName: 'Student',
    class: '',
    institution: '', // Top-level institution field
    phone: '',       // Top-level phone field
    email: '',       // Top-level email field
    address: '',
    dateOfBirth: '',
    gender: '',
    profilePhoto: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e0e0e0"/%3E%3Ccircle cx="50" cy="40" r="18" fill="%23999"/%3E%3Cpath d="M 20 85 Q 20 60 50 60 Q 80 60 80 85 Z" fill="%23999"/%3E%3C/svg%3E',
    education: {
        institution: 'University of Innovation',
        grade: '3rd Year',
    },
    contact: {
        email: 'alex.doe@example.com',
        phone: '+1 234 567 8900',
    },
    bio: '',
    achievements: [],
    sectionVisibility: {
        contact: true,
        bio: true,
        achievements: true,
    },
    profileCompleteness: 0,
};

// Function to get data from localStorage
const getStoredUserData = (user: User | null) => {
    if (!user) return initialUserData;

    const userDataKey = `userData_${user.uid}`;
    const storedData = localStorage.getItem(userDataKey);
    if (storedData) {
        const parsed = JSON.parse(storedData);
        // Merge with initial data to ensure all new fields exist
        // But always use the Firebase user's email
        return {
            ...initialUserData,
            ...parsed,
            contact: {
                ...initialUserData.contact,
                ...parsed.contact,
                email: user.email || parsed.contact?.email || initialUserData.contact.email
            },
            sectionVisibility: { ...initialUserData.sectionVisibility, ...parsed.sectionVisibility },
        };
    }

    // For new users, create initial data with their Firebase email
    const newUserData = {
        ...initialUserData,
        contact: {
            ...initialUserData.contact,
            email: user.email || initialUserData.contact.email,
        }
    };
    localStorage.setItem(userDataKey, JSON.stringify(newUserData));
    return newUserData;
};

// Function to calculate profile completeness percentage
const calculateProfileCompleteness = (userData: typeof initialUserData): number => {
    const fields = [
        // Check if full name is filled and not default
        !!(userData.fullName && userData.fullName.trim() !== '' && userData.fullName !== 'Student'),

        // Check if email is filled (usually auto-filled from Firebase)
        !!(userData.contact?.email && userData.contact.email.trim() !== '' && userData.contact.email !== 'alex.doe@example.com'),

        // Check if phone is filled
        !!(userData.contact?.phone && userData.contact.phone.trim() !== '' && userData.contact.phone !== '+1 234 567 8900'),

        // Check if institution is filled
        !!(userData.education?.institution && userData.education.institution.trim() !== '' && userData.education.institution !== 'University of Innovation'),

        // Check if grade is filled
        !!(userData.education?.grade && userData.education.grade.trim() !== '' && userData.education.grade !== '3rd Year'),

        // Check if bio is filled
        !!(userData.bio && userData.bio.trim() !== ''),

        // Check if custom profile photo is uploaded
        !!(userData.profilePhoto && userData.profilePhoto !== initialUserData.profilePhoto),
    ];

    const filledFields = fields.filter(field => field === true).length;
    const totalFields = fields.length;

    return Math.round((filledFields / totalFields) * 100);
};


const ProgressCircle = ({ progress }: { progress: number }) => {
    const { themeConfig } = useTheme();
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    strokeWidth="10"
                    className="stroke-gray-200 dark:stroke-gray-700"
                    fill="transparent"
                />
                {/* Progress circle */}
                <motion.circle
                    cx="60"
                    cy="60"
                    r={radius}
                    strokeWidth="10"
                    className="stroke-blue-500"
                    fill="transparent"
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <motion.div
                className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${themeConfig.text}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
            >
                {progress}%
            </motion.div>
        </div>
    );
};

// SectionCard component moved outside to prevent recreation on every render
const SectionCard = React.memo(({
    title,
    icon: Icon,
    children,
    sectionKey,
    isVisible,
    onToggleVisibility,
    themeConfig
}: {
    title: string;
    icon: any;
    children: React.ReactNode;
    sectionKey?: string;
    isVisible: boolean;
    onToggleVisibility?: () => void;
    themeConfig: any;
}) => {
    const animationVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    };

    return (
        <motion.div
            className={`p-6 rounded-xl shadow-sm border dark:border-gray-700 ${themeConfig.card}`}
            initial="initial"
            animate="animate"
            variants={animationVariants}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${themeConfig.primary.replace('bg-', 'text-')}`} />
                    <h3 className={`text-lg font-semibold ${themeConfig.text}`}>{title}</h3>
                </div>
                {sectionKey && onToggleVisibility && (
                    <motion.button
                        onClick={onToggleVisibility}
                        className={`p-2 rounded-lg ${themeConfig.background} hover:opacity-80 transition-colors`}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isVisible ? <Eye size={18} className={themeConfig.text} /> : <EyeOff size={18} className={themeConfig.textSecondary} />}
                    </motion.button>
                )}
            </div>
            {isVisible && (
                <div>
                    {children}
                </div>
            )}
        </motion.div>
    );
});

SectionCard.displayName = 'SectionCard';

export function Profile() {
    const { themeConfig } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isFlipped, setIsFlipped] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPhotoZoom, setShowPhotoZoom] = useState(false);
    const [userData, setUserData] = useState(() => getStoredUserData(user));
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Achievement state
    const [achievements, setAchievements] = useState(() => {
        if (!user) return [];

        // Define all available achievements with levels
        const allAchievements = [
            // Early Bird - Levels
            { id: 'early_bird_1', name: 'Early Bird I', icon: '🌅', description: 'Study before 8 AM', unlocked: false, claimed: false, progress: 0, maxProgress: 1, level: 1, points: 100 },
            { id: 'early_bird_2', name: 'Early Bird II', icon: '🌅', description: 'Study before 8 AM for 5 days', unlocked: false, claimed: false, progress: 0, maxProgress: 5, level: 2, points: 250 },
            { id: 'early_bird_3', name: 'Early Bird III', icon: '🌅', description: 'Study before 8 AM for 15 days', unlocked: false, claimed: false, progress: 0, maxProgress: 15, level: 3, points: 500 },

            // Night Owl - Levels
            { id: 'night_owl_1', name: 'Night Owl I', icon: '🦉', description: 'Study after 10 PM', unlocked: false, claimed: false, progress: 0, maxProgress: 1, level: 1, points: 100 },
            { id: 'night_owl_2', name: 'Night Owl II', icon: '🦉', description: 'Study after 10 PM for 5 days', unlocked: false, claimed: false, progress: 0, maxProgress: 5, level: 2, points: 250 },
            { id: 'night_owl_3', name: 'Night Owl III', icon: '🦉', description: 'Study after 10 PM for 15 days', unlocked: false, claimed: false, progress: 0, maxProgress: 15, level: 3, points: 500 },

            // Streak Master - Levels
            { id: 'streak_master_1', name: 'Streak Master I', icon: '🔥', description: '7 day study streak', unlocked: false, claimed: false, progress: 0, maxProgress: 7, level: 1, points: 300 },
            { id: 'streak_master_2', name: 'Streak Master II', icon: '🔥', description: '30 day study streak', unlocked: false, claimed: false, progress: 0, maxProgress: 30, level: 2, points: 1000 },
            { id: 'streak_master_3', name: 'Streak Master III', icon: '🔥', description: '100 day study streak', unlocked: false, claimed: false, progress: 0, maxProgress: 100, level: 3, points: 3000 },

            // Task Crusher - Levels
            { id: 'task_crusher_1', name: 'Task Crusher I', icon: '✅', description: 'Complete 25 tasks', unlocked: false, claimed: false, progress: 0, maxProgress: 25, level: 1, points: 400 },
            { id: 'task_crusher_2', name: 'Task Crusher II', icon: '✅', description: 'Complete 50 tasks', unlocked: false, claimed: false, progress: 0, maxProgress: 50, level: 2, points: 800 },
            { id: 'task_crusher_3', name: 'Task Crusher III', icon: '✅', description: 'Complete 100 tasks', unlocked: false, claimed: false, progress: 0, maxProgress: 100, level: 3, points: 1500 },

            // Focus Master - Levels
            { id: 'focus_master_1', name: 'Focus Master I', icon: '🧠', description: 'Complete 10 Pomodoro sessions', unlocked: false, claimed: false, progress: 0, maxProgress: 10, level: 1, points: 300 },
            { id: 'focus_master_2', name: 'Focus Master II', icon: '🧠', description: 'Complete 25 Pomodoro sessions', unlocked: false, claimed: false, progress: 0, maxProgress: 25, level: 2, points: 600 },
            { id: 'focus_master_3', name: 'Focus Master III', icon: '🧠', description: 'Complete 50 Pomodoro sessions', unlocked: false, claimed: false, progress: 0, maxProgress: 50, level: 3, points: 1200 },

            // Speed Demon - Levels
            { id: 'speed_demon_1', name: 'Speed Demon I', icon: '⚡', description: 'Complete 5 tasks in one day', unlocked: false, claimed: false, progress: 0, maxProgress: 5, level: 1, points: 200 },
            { id: 'speed_demon_2', name: 'Speed Demon II', icon: '⚡', description: 'Complete 10 tasks in one day', unlocked: false, claimed: false, progress: 0, maxProgress: 10, level: 2, points: 400 },
            { id: 'speed_demon_3', name: 'Speed Demon III', icon: '⚡', description: 'Complete 20 tasks in one day', unlocked: false, claimed: false, progress: 0, maxProgress: 20, level: 3, points: 800 },
        ];

        // Get saved achievements from localStorage
        const saved = localStorage.getItem(`achievements_${user.uid}`);
        const savedAchievements = saved ? JSON.parse(saved) : [];

        // Merge: keep existing progress, add new achievements
        const merged = allAchievements.map(newAch => {
            const existing = savedAchievements.find((a: any) => a.id === newAch.id);
            return existing || newAch;
        });

        // Save merged achievements back to localStorage
        localStorage.setItem(`achievements_${user.uid}`, JSON.stringify(merged));

        return merged;
    });

    // Check and update achievements - defined early to avoid hoisting issues
    const checkAchievements = useCallback(() => {
        if (!user) return;



        // Get stats from localStorage
        const completedTasks = parseInt(localStorage.getItem(`completedTasksCount_${user.uid}`) || '0');
        const studyStreak = parseInt(localStorage.getItem(`studyStreak_${user.uid}`) || '0');
        const pomodoroSessions = parseInt(localStorage.getItem('pomodoroSessions') || '0');



        setAchievements((prev: any) => {
            const updated = [...prev];
            let hasChanges = false;

            // Task Crusher - Update all levels
            [
                { id: 'task_crusher_1', max: 25 },
                { id: 'task_crusher_2', max: 50 },
                { id: 'task_crusher_3', max: 100 }
            ].forEach(({ id, max }) => {
                const achievement = updated.find((a: any) => a.id === id);
                if (achievement) {
                    const newProgress = Math.min(completedTasks, max);
                    if (achievement.progress !== newProgress) {
                        achievement.progress = newProgress;
                        hasChanges = true;
                    }
                    if (completedTasks >= max && !achievement.unlocked) {
                        achievement.unlocked = true;
                        hasChanges = true;
                    }
                }
            });

            // Focus Master - Update all levels
            [
                { id: 'focus_master_1', max: 10 },
                { id: 'focus_master_2', max: 25 },
                { id: 'focus_master_3', max: 50 }
            ].forEach(({ id, max }) => {
                const achievement = updated.find((a: any) => a.id === id);
                if (achievement) {
                    const newProgress = Math.min(pomodoroSessions, max);
                    if (achievement.progress !== newProgress) {
                        achievement.progress = newProgress;
                        hasChanges = true;
                    }
                    if (pomodoroSessions >= max && !achievement.unlocked) {
                        achievement.unlocked = true;
                        hasChanges = true;
                    }
                }
            });

            // Streak Master - Update all levels
            [
                { id: 'streak_master_1', max: 7 },
                { id: 'streak_master_2', max: 30 },
                { id: 'streak_master_3', max: 100 }
            ].forEach(({ id, max }) => {
                const achievement = updated.find((a: any) => a.id === id);
                if (achievement) {
                    const newProgress = Math.min(studyStreak, max);
                    if (achievement.progress !== newProgress) {
                        achievement.progress = newProgress;
                        hasChanges = true;
                    }
                    if (studyStreak >= max && !achievement.unlocked) {
                        achievement.unlocked = true;
                        hasChanges = true;
                    }
                }
            });

            // Early Bird - Update all levels
            const earlyBirdCount = getTimeBasedAchievementCount(user.uid, 'earlyBird');
            [
                { id: 'early_bird_1', max: 5 },
                { id: 'early_bird_2', max: 15 },
                { id: 'early_bird_3', max: 30 }
            ].forEach(({ id, max }) => {
                const achievement = updated.find((a: any) => a.id === id);
                if (achievement) {
                    const newProgress = Math.min(earlyBirdCount, max);
                    if (achievement.progress !== newProgress) {
                        achievement.progress = newProgress;
                        hasChanges = true;
                    }
                    if (earlyBirdCount >= max && !achievement.unlocked) {
                        achievement.unlocked = true;
                        hasChanges = true;
                    }
                }
            });

            // Night Owl - Update all levels
            const nightOwlCount = getTimeBasedAchievementCount(user.uid, 'nightOwl');
            [
                { id: 'night_owl_1', max: 5 },
                { id: 'night_owl_2', max: 15 },
                { id: 'night_owl_3', max: 30 }
            ].forEach(({ id, max }) => {
                const achievement = updated.find((a: any) => a.id === id);
                if (achievement) {
                    const newProgress = Math.min(nightOwlCount, max);
                    if (achievement.progress !== newProgress) {
                        achievement.progress = newProgress;
                        hasChanges = true;
                    }
                    if (nightOwlCount >= max && !achievement.unlocked) {
                        achievement.unlocked = true;
                        hasChanges = true;
                    }
                }
            });

            // Speed Demon - Update all levels
            const dailyTaskCount = getDailyTaskCount(user.uid);
            [
                { id: 'speed_demon_1', max: 5 },
                { id: 'speed_demon_2', max: 10 },
                { id: 'speed_demon_3', max: 20 }
            ].forEach(({ id, max }) => {
                const achievement = updated.find((a: any) => a.id === id);
                if (achievement) {
                    const newProgress = Math.min(dailyTaskCount, max);
                    if (achievement.progress !== newProgress) {
                        achievement.progress = newProgress;
                        hasChanges = true;
                    }
                    if (dailyTaskCount >= max && !achievement.unlocked) {
                        achievement.unlocked = true;
                        hasChanges = true;
                    }
                }
            });

            if (hasChanges) {
                localStorage.setItem(`achievements_${user.uid}`, JSON.stringify(updated));
            }
            return hasChanges ? updated : prev;
        });
    }, [user, setAchievements]);

    useEffect(() => {
        setUserData(getStoredUserData(user));
        // Check achievements on mount
        if (user) {
            checkAchievements();
        }

        // Listen for achievement check events
        const handleCheckAchievements = () => {
            checkAchievements();
        };

        window.addEventListener('checkAchievements', handleCheckAchievements);
        return () => window.removeEventListener('checkAchievements', handleCheckAchievements);
    }, [user, checkAchievements]);

    // Recalculate profile completeness when userData changes - using useMemo for optimization
    const profileCompleteness = React.useMemo(() => {
        return calculateProfileCompleteness(userData);
    }, [
        userData.fullName,
        userData.contact?.email,
        userData.contact?.phone,
        userData.education?.institution,
        userData.education?.grade,
        userData.bio,
        userData.achievements?.length,
        userData.profilePhoto
    ]);

    // Update userData with new completeness value when it changes
    useEffect(() => {
        if (profileCompleteness !== userData.profileCompleteness) {
            setUserData((prev: typeof initialUserData) => ({ ...prev, profileCompleteness }));
        }
    }, [profileCompleteness]);

    const handleSave = () => {
        if (!user) return;
        const userDataKey = `userData_${user.uid}`;
        // Calculate profile completeness before saving
        const updatedData = {
            ...userData,
            profileCompleteness: calculateProfileCompleteness(userData)
        };
        localStorage.setItem(userDataKey, JSON.stringify(updatedData));
        setUserData(updatedData);
        setIsEditing(false);
    };

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');

        if (section === 'education') {
            setUserData((prev: typeof initialUserData) => ({ ...prev, education: { ...prev.education, [field]: value } }));
        } else if (section === 'contact') {
            setUserData((prev: typeof initialUserData) => ({
                ...prev,
                contact: {
                    ...(prev.contact || { email: '', phone: '' }),
                    [field]: value
                }
            }));
        } else {
            setUserData((prev: typeof initialUserData) => ({ ...prev, [name]: value }));
        }
    }, []);



    // Claim achievement and unlock next level
    const claimAchievement = useCallback((achievementId: string) => {


        if (!user) {

            return;
        }

        setAchievements((prev: any) => {

            const updated = [...prev];
            const achievement = updated.find((a: any) => a.id === achievementId);



            if (achievement && achievement.unlocked && !achievement.claimed) {


                // Mark as claimed
                achievement.claimed = true;

                // Award points (you can add points system later)
                toast.success(`🎉 Claimed ${achievement.name}! +${achievement.points} points`);


                // Find and unlock next level
                const baseName = achievementId.replace(/_\d+$/, ''); // Remove _1, _2, _3
                const currentLevel = achievement.level;
                const nextLevel = currentLevel + 1;
                const nextLevelId = `${baseName}_${nextLevel}`;



                const nextAchievement = updated.find((a: any) => a.id === nextLevelId);
                if (nextAchievement && !nextAchievement.unlocked) {
                    // Don't auto-unlock, just make it visible
                    toast.success(`🔓 ${nextAchievement.name} is now available!`);

                } else {

                }

                // Save to localStorage
                localStorage.setItem(`achievements_${user.uid}`, JSON.stringify(updated));

            } else {

            }

            return updated;
        });
    }, [user, setAchievements]);

    const toggleSectionVisibility = useCallback((section: keyof typeof userData.sectionVisibility) => {
        setUserData((prev: typeof initialUserData) => ({
            ...prev,
            sectionVisibility: {
                ...prev.sectionVisibility,
                [section]: !prev.sectionVisibility[section as keyof typeof prev.sectionVisibility]
            }
        }));
    }, []);

    const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUserData((prev: typeof initialUserData) => ({ ...prev, profilePhoto: event.target?.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    }, []);

    const handleRemovePhoto = useCallback(() => {
        // Reset to default profile photo
        const defaultPhoto = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e0e0e0"/%3E%3Ccircle cx="50" cy="40" r="18" fill="%23999"/%3E%3Cpath d="M 20 85 Q 20 60 50 60 Q 80 60 80 85 Z" fill="%23999"/%3E%3C/svg%3E';
        setUserData((prev: typeof initialUserData) => ({ ...prev, profilePhoto: defaultPhoto }));
    }, []);



    return (
        <div className="space-y-6 pb-4 md:pb-28">
            <motion.div
                className="flex justify-between items-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text}`}>My Profile</h1>
                <div className="flex gap-3">
                    <motion.button
                        onClick={() => navigate('/settings')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${themeConfig.card} border dark:border-gray-700 ${themeConfig.text}`}
                        whileTap={{ scale: 0.95 }}
                        title="Settings"
                    >
                        <Settings size={18} />
                    </motion.button>
                    <motion.button
                        onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${isEditing ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isEditing ? <Save size={18} /> : <Edit size={18} />}
                        {isEditing ? 'Save' : 'Edit'}
                    </motion.button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <motion.div
                    className="lg:col-span-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-full h-80 [perspective:1000px]" onClick={() => !isEditing && setIsFlipped(!isFlipped)}>
                        <motion.div
                            className="relative w-full h-full text-center [transform-style:preserve-3d] transition-transform duration-700"
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                        >
                            {/* Front Side */}
                            <div className={`absolute w-full h-full p-6 rounded-2xl shadow-sm ${themeConfig.card} border dark:border-gray-700 [backface-visibility:hidden] flex flex-col items-center justify-center`}>
                                <div className="relative">
                                    <img
                                        src={userData.profilePhoto}
                                        alt="Profile"
                                        className={`w-32 h-32 rounded-full object-cover border-4 border-blue-200 dark:border-blue-800 ${!isEditing ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                                        onClick={(e) => {
                                            if (!isEditing) {
                                                e.stopPropagation();
                                                setShowPhotoZoom(true);
                                            }
                                        }}
                                    />
                                    {isEditing && (
                                        <>
                                            <motion.button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                                                whileTap={{ scale: 0.9 }}
                                                title="Upload Photo"
                                            >
                                                <Upload size={16} />
                                            </motion.button>
                                            {userData.profilePhoto !== initialUserData.profilePhoto && (
                                                <motion.button
                                                    onClick={handleRemovePhoto}
                                                    className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Remove Photo"
                                                >
                                                    <X size={16} />
                                                </motion.button>
                                            )}
                                        </>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                                </div>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={userData.fullName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter your name"
                                    className={`mt-4 text-2xl font-bold text-center w-full bg-transparent ${themeConfig.text} ${isEditing ? 'border-b-2 border-blue-500' : ''}`}
                                />
                                <p className="mt-4 text-xs text-gray-500">{isEditing ? 'Click save to apply' : 'Click to flip for more details'}</p>
                            </div>
                            {/* Back Side */}
                            <div className={`absolute w-full h-full p-6 rounded-2xl shadow-sm ${themeConfig.card} border dark:border-gray-700 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-center`}>
                                <h3 className={`text-xl font-bold mb-4 ${themeConfig.text} flex items-center gap-2`}><BookOpen size={20} />Education</h3>
                                <div className="text-left">
                                    <p className={`text-sm ${themeConfig.textSecondary}`}>School/College:</p>
                                    <input
                                        type="text"
                                        name="education.institution"
                                        value={userData.education.institution}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Enter school or college name"
                                        className={`font-semibold w-full bg-transparent ${themeConfig.text} ${isEditing ? 'border-b-2 border-blue-500' : ''}`}
                                    />
                                    <p className={`text-sm mt-2 ${themeConfig.textSecondary}`}>Class/College Semester:</p>
                                    <input
                                        type="text"
                                        name="education.grade"
                                        value={userData.education.grade}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Enter class or college semester"
                                        className={`font-semibold w-full bg-transparent ${themeConfig.text} ${isEditing ? 'border-b-2 border-blue-500' : ''}`}
                                    />
                                </div>
                                <p className={`mt-4 text-xs text-center ${themeConfig.textSecondary}`}>{isEditing ? 'Click save to apply' : 'Click to flip back'}</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Profile Completeness */}
                <motion.div
                    className={`lg:col-span-2 ${themeConfig.card} p-6 rounded-xl shadow-sm border dark:border-gray-700`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="text-center">
                            <p className={`font-semibold mb-2 ${themeConfig.textSecondary}`}>Profile Completeness</p>
                            <ProgressCircle progress={userData.profileCompleteness} />
                        </div>
                        <div className="flex-1 w-full">
                            <h4 className={`text-lg font-bold ${themeConfig.text} mb-3`}>Quick Stats</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-3 rounded-lg ${themeConfig.background} border dark:border-gray-700`}>
                                    <p className={`text-2xl font-bold ${themeConfig.text}`}>
                                        {achievements.filter((a: any) => a.claimed).length}
                                    </p>
                                    <p className={`text-sm ${themeConfig.textSecondary}`}>Claimed Badges</p>
                                </div>
                                <div className={`p-3 rounded-lg ${themeConfig.background} border dark:border-gray-700`}>
                                    <p className={`text-2xl font-bold ${themeConfig.text}`}>
                                        {Object.values(userData.sectionVisibility).filter(v => v).length}
                                    </p>
                                    <p className={`text-sm ${themeConfig.textSecondary}`}>Active Sections</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>


            {/* Contact Information */}
            <SectionCard
                title="Contact Information"
                icon={Mail}
                sectionKey="contact"
                isVisible={userData.sectionVisibility.contact}
                onToggleVisibility={() => toggleSectionVisibility('contact')}
                themeConfig={themeConfig}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`text-sm ${themeConfig.textSecondary} flex items-center gap-2 mb-2`}>
                            <Mail size={16} /> Email
                        </label>
                        <input
                            type="email"
                            name="contact.email"
                            value={userData.contact?.email || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`w-full p-3 rounded-lg ${themeConfig.background} ${themeConfig.text} ${isEditing ? 'border-2 border-blue-500' : 'border dark:border-gray-700'}`}
                        />
                    </div>
                    <div>
                        <label className={`text-sm ${themeConfig.textSecondary} flex items-center gap-2 mb-2`}>
                            <Phone size={16} /> Phone
                        </label>
                        <input
                            type="tel"
                            name="contact.phone"
                            value={userData.contact?.phone || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`w-full p-3 rounded-lg ${themeConfig.background} ${themeConfig.text} ${isEditing ? 'border-2 border-blue-500' : 'border dark:border-gray-700'}`}
                        />
                    </div>
                </div>
            </SectionCard>

            {/* About Me */}
            <SectionCard
                title="About Me"
                icon={UserIcon}
                sectionKey="bio"
                isVisible={userData.sectionVisibility.bio}
                onToggleVisibility={() => toggleSectionVisibility('bio')}
                themeConfig={themeConfig}
            >
                <textarea
                    name="bio"
                    value={userData.bio || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full p-3 rounded-lg ${themeConfig.background} ${themeConfig.text} ${isEditing ? 'border-2 border-blue-500' : 'border dark:border-gray-700'} resize-none`}
                    placeholder="Tell us about yourself..."
                />
            </SectionCard>

            {/* Achievements & Badges */}
            <SectionCard
                title="Achievements & Badges 🏆"
                icon={Award}
                sectionKey="achievements"
                isVisible={userData.sectionVisibility.achievements}
                onToggleVisibility={() => toggleSectionVisibility('achievements')}
                themeConfig={themeConfig}
            >
                <div className="space-y-3">
                    {achievements.map((achievement: any, index: number) => {
                        const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

                        return (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-4 rounded-xl border-2 ${achievement.claimed
                                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400'
                                    : achievement.unlocked
                                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-400'
                                        : `${themeConfig.background} border dark:border-gray-700 opacity-60`
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{achievement.icon}</span>
                                        <div>
                                            <h4 className={`font-bold ${themeConfig.text}`}>
                                                {achievement.name}
                                                {achievement.claimed && <span className="ml-2 text-yellow-500">✓</span>}
                                            </h4>
                                            <p className={`text-sm ${themeConfig.textSecondary}`}>
                                                {achievement.description}
                                            </p>
                                        </div>
                                    </div>
                                    {achievement.unlocked && !achievement.claimed && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => claimAchievement(achievement.id)}
                                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-sm"
                                        >
                                            Claim
                                        </motion.button>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className={themeConfig.textSecondary}>Progress</span>
                                        <span className={`font-semibold ${achievement.unlocked ? 'text-green-600' : 'text-gray-600'}`}>
                                            {achievement.progress}/{achievement.maxProgress}
                                        </span>
                                    </div>
                                    <div className={`w-full ${themeConfig.background} rounded-full h-2`}>
                                        <motion.div
                                            className={`h-2 rounded-full ${achievement.claimed
                                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                                : achievement.unlocked
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                                                    : 'bg-gray-400'
                                                }`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercentage}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                <div className={`mt-4 p-3 rounded-lg ${themeConfig.background} border dark:border-gray-700 text-center`}>
                    <p className={`text-sm ${themeConfig.textSecondary}`}>
                        {achievements.filter((a: any) => a.claimed).length} / {achievements.length} Claimed
                    </p>
                </div>
            </SectionCard>

            {/* Photo Zoom Modal */}
            <AnimatePresence>
                {showPhotoZoom && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPhotoZoom(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-4xl max-h-[90vh] w-full"
                        >
                            <img
                                src={userData.profilePhoto}
                                alt="Profile Zoomed"
                                className="w-full h-full object-contain rounded-2xl shadow-2xl"
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowPhotoZoom(false)}
                                className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg"
                            >
                                <X size={24} />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}