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
    fullName: '',
    class: '',
    institution: '', // Top-level institution field
    phone: '',       // Top-level phone field
    email: '',       // Top-level email field
    address: '',
    dateOfBirth: '',
    gender: '',
    profilePhoto: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e0e0e0"/%3E%3Ccircle cx="50" cy="40" r="18" fill="%23999"/%3E%3Cpath d="M 20 85 Q 20 60 50 60 Q 80 60 80 85 Z" fill="%23999"/%3E%3C/svg%3E',
    education: {
        institution: '',
        grade: '',
    },
    contact: {
        email: '',
        phone: '',
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
        // Check if full name is filled
        !!(userData.fullName && userData.fullName.trim() !== ''),

        // Check if email is filled (usually auto-filled from Firebase)
        !!(userData.contact?.email && userData.contact.email.trim() !== ''),

        // Check if phone is filled
        !!(userData.contact?.phone && userData.contact.phone.trim() !== ''),

        // Check if institution is filled
        !!(userData.education?.institution && userData.education.institution.trim() !== ''),

        // Check if grade is filled
        !!(userData.education?.grade && userData.education.grade.trim() !== ''),

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

        // Define all available achievements with 3-star levels
        const allAchievements = [
            { id: 'early_bird', name: 'Early Bird', icon: '🌅', description: 'Study before 8 AM', progress: 0, levels: [1, 5, 15], claimed: [false, false, false] },
            { id: 'night_owl', name: 'Night Owl', icon: '🦉', description: 'Study after 10 PM', progress: 0, levels: [1, 5, 15], claimed: [false, false, false] },
            { id: 'streak_master', name: 'Streak Master', icon: '🔥', description: 'Study consistently to build a streak', progress: 0, levels: [7, 30, 100], claimed: [false, false, false] },
            { id: 'task_crusher', name: 'Task Crusher', icon: '✅', description: 'Complete tasks to earn stars', progress: 0, levels: [10, 50, 100], claimed: [false, false, false] },
            { id: 'focus_master', name: 'Focus Master', icon: '🧠', description: 'Complete Pomodoro sessions', progress: 0, levels: [10, 25, 50], claimed: [false, false, false] },
            { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', description: 'Complete tasks in one day', progress: 0, levels: [5, 10, 20], claimed: [false, false, false] },
        ];

        // Get saved achievements from localStorage
        const saved = localStorage.getItem(`achievements_${user.uid}`);
        const savedAchievements = saved ? JSON.parse(saved) : [];

        // Merge: keep existing progress if it has the new structure, else overwrite
        const merged = allAchievements.map(newAch => {
            const existing = savedAchievements.find((a: any) => a.id === newAch.id);
            if (existing && existing.levels && existing.claimed) {
                return existing;
            }
            return newAch;
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
        const earlyBirdCount = getTimeBasedAchievementCount(user.uid, 'earlyBird');
        const nightOwlCount = getTimeBasedAchievementCount(user.uid, 'nightOwl');
        const dailyTaskCount = getDailyTaskCount(user.uid);

        setAchievements((prev: any) => {
            const updated = [...prev];
            let hasChanges = false;

            const updates = [
                { id: 'task_crusher', value: completedTasks },
                { id: 'focus_master', value: pomodoroSessions },
                { id: 'streak_master', value: studyStreak },
                { id: 'early_bird', value: earlyBirdCount },
                { id: 'night_owl', value: nightOwlCount },
                { id: 'speed_demon', value: dailyTaskCount }
            ];

            updates.forEach(({ id, value }) => {
                const achievement = updated.find((a: any) => a.id === id);
                if (achievement) {
                    const max = achievement.levels[2];
                    const newProgress = Math.min(value, max);
                    if (achievement.progress !== newProgress) {
                        achievement.progress = newProgress;
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



    // Claim achievement star
    const claimAchievement = useCallback((achievementId: string) => {
        if (!user) {
            return;
        }

        setAchievements((prev: any) => {
            const updated = [...prev];
            const achievement = updated.find((a: any) => a.id === achievementId);

            if (achievement) {
                const nextClaimableIndex = achievement.levels.findIndex((l: number, i: number) => achievement.progress >= l && !achievement.claimed[i]);
                if (nextClaimableIndex !== -1) {
                    achievement.claimed[nextClaimableIndex] = true;
                    toast.success(`🎉 Claimed ${achievement.name} Star ${nextClaimableIndex + 1}!`);
                    localStorage.setItem(`achievements_${user.uid}`, JSON.stringify(updated));
                }
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
                                        placeholder="Enter School/College name"
                                        className={`font-semibold w-full bg-transparent ${themeConfig.text} ${isEditing ? 'border-b-2 border-blue-500' : ''}`}
                                    />
                                    <p className={`text-sm mt-2 ${themeConfig.textSecondary}`}>Class/College Semester:</p>
                                    <input
                                        type="text"
                                        name="education.grade"
                                        value={userData.education.grade}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Enter your class/Semester"
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
                                        {achievements.reduce((acc: number, a: any) => acc + a.claimed.filter(Boolean).length, 0)}
                                    </p>
                                    <p className={`text-sm ${themeConfig.textSecondary}`}>Claimed Stars</p>
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
                        const maxProgress = achievement.levels[2];
                        const progressPercentage = (achievement.progress / maxProgress) * 100;
                        const starsUnlocked = achievement.levels.filter((l: number) => achievement.progress >= l).length;
                        const hasUnclaimed = achievement.levels.findIndex((l: number, i: number) => achievement.progress >= l && !achievement.claimed[i]) !== -1;

                        let cardStyle = `${themeConfig.background} border dark:border-gray-700 opacity-60`;
                        let progressStyle = 'bg-gray-400';
                        let buttonStyle = 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';

                        if (starsUnlocked === 3) {
                            cardStyle = 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-400 dark:border-yellow-600';
                            progressStyle = 'bg-gradient-to-r from-yellow-400 to-amber-500';
                            buttonStyle = 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white';
                        } else if (starsUnlocked === 2) {
                            cardStyle = 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-red-400 dark:border-red-600';
                            progressStyle = 'bg-gradient-to-r from-red-400 to-rose-500';
                            buttonStyle = 'bg-gradient-to-r from-red-500 to-rose-600 text-white';
                        } else if (starsUnlocked === 1) {
                            cardStyle = 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-400 dark:border-blue-600';
                            progressStyle = 'bg-gradient-to-r from-blue-500 to-purple-500';
                            buttonStyle = 'bg-gradient-to-r from-blue-500 to-purple-600 text-white';
                        }

                        return (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-4 rounded-xl border-2 transition-colors duration-300 ${cardStyle}`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{achievement.icon}</span>
                                        <div>
                                            <h4 className={`font-bold ${themeConfig.text} flex items-center gap-2`}>
                                                {achievement.name}
                                                <div className="flex gap-1 ml-2">
                                                    {[0, 1, 2].map(starIdx => (
                                                        <span key={starIdx} className={`text-lg ${starIdx < starsUnlocked ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                            </h4>
                                            <p className={`text-sm ${themeConfig.textSecondary}`}>
                                                {achievement.description} ({achievement.levels.join(' / ')} required)
                                            </p>
                                        </div>
                                    </div>
                                    {hasUnclaimed && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => claimAchievement(achievement.id)}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm shadow-md ${buttonStyle}`}
                                        >
                                            Claim Star
                                        </motion.button>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className={themeConfig.textSecondary}>Progress</span>
                                        <span className={`font-semibold ${starsUnlocked > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                            {achievement.progress}/{maxProgress}
                                        </span>
                                    </div>
                                    <div className={`w-full ${themeConfig.background} rounded-full h-2 relative`}>
                                        <motion.div
                                            className={`h-2 rounded-full ${progressStyle}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercentage}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                        />
                                        {/* Markers for levels */}
                                        {[0, 1].map(lvlIdx => (
                                            <div key={lvlIdx} className="absolute top-0 bottom-0 w-1 bg-white/60 dark:bg-black/60 rounded-full z-10" style={{ left: `${(achievement.levels[lvlIdx] / maxProgress) * 100}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                <div className={`mt-4 p-3 rounded-lg ${themeConfig.background} border dark:border-gray-700 text-center`}>
                    <p className={`text-sm ${themeConfig.textSecondary}`}>
                        {achievements.reduce((acc: number, a: any) => acc + a.claimed.filter(Boolean).length, 0)} / {achievements.length * 3} Stars Claimed
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
