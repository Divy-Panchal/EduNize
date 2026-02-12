import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Plus,
    Award,
    BarChart3,
    Calendar,
    X,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useGrade } from '../context/GradeContext';
import { useSubject } from '../context/SubjectContext';
import { Grade, GRADE_CATEGORIES, getGradeBgColor, getGradeColor } from '../types/grade';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Grades() {
    const { themeConfig, theme } = useTheme();
    const { grades, addGrade, deleteGrade, getGradeStats, gradingSystem } = useGrade();
    const { subjects } = useSubject();
    const [showAddModal, setShowAddModal] = useState(false);

    const stats = useMemo(() => getGradeStats(), [grades, getGradeStats]);

    // Form state
    const [formData, setFormData] = useState({
        subjectId: '',
        category: 'test' as Grade['category'],
        score: '',
        maxScore: '100',
        weight: '1',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const subject = subjects.find(s => s.id === formData.subjectId);
        if (!subject) return;

        // Input validation
        const score = parseFloat(formData.score);
        const maxScore = parseFloat(formData.maxScore);
        const weight = parseFloat(formData.weight);

        // Validate max score
        if (maxScore <= 0) {
            toast.error('Max score must be greater than 0');
            return;
        }

        // Validate score
        if (score < 0) {
            toast.error('Score cannot be negative');
            return;
        }

        if (score > maxScore) {
            toast.error(`Score cannot be greater than max score (${maxScore})`);
            return;
        }

        // Validate weight
        if (weight < 0) {
            toast.error('Weight cannot be negative');
            return;
        }

        // Validate date (not in future)
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today

        if (selectedDate > today) {
            toast.error('Date cannot be in the future');
            return;
        }

        const gradeData = {
            subjectId: formData.subjectId,
            subjectName: subject.name,
            category: formData.category,
            score,
            maxScore,
            weight,
            date: formData.date,
            notes: formData.notes,
        };

        addGrade(gradeData);
        setShowAddModal(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            subjectId: '',
            category: 'test',
            score: '',
            maxScore: '100',
            weight: '1',
            date: new Date().toISOString().split('T')[0],
            notes: '',
        });
    };

    const handleDelete = (id: string) => {
        deleteGrade(id);
    };

    // Prepare chart data
    const trendData = useMemo(() => {
        const sortedGrades = [...grades]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-10);

        return sortedGrades.map(grade => ({
            date: new Date(grade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            percentage: Math.round((grade.score / grade.maxScore) * 100),
            subject: grade.subjectName,
        }));
    }, [grades]);

    const subjectComparisonData = useMemo(() => {
        return stats.subjectGrades.map(sg => ({
            subject: sg.subjectName.length > 10 ? sg.subjectName.substring(0, 10) + '...' : sg.subjectName,
            average: Math.round(sg.average),
        }));
    }, [stats]);

    const recentGrades = useMemo(() => {
        return [...grades]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);
    }, [grades]);

    const currentPercentage = stats.overallPercentage;

    // Keyboard navigation - close modal with Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showAddModal) {
                setShowAddModal(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [showAddModal]);

    return (
        <div className="h-full flex flex-col overflow-y-auto">
            <div className="sticky top-0 z-50 p-4 md:p-6 pb-2 pt-8 md:pt-12 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md transition-colors duration-200">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex justify-between items-start`}
                >
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text} mb-2`}>
                            Grade Tracker 📊
                        </h1>
                        <p className={themeConfig.textSecondary}>
                            Monitor your academic performance and track your progress
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddModal(true)}
                        className={`${themeConfig.primary} text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg`}
                        aria-label="Add new grade"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden md:inline">Add Grade</span>
                    </motion.button>
                </motion.div>
            </div>

            <div className="flex-1 p-4 md:p-6 pt-2 pb-32 md:pb-6">
                <div className="space-y-6">

                    {/* GPA Overview Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`${themeConfig.card} p-6 md:p-8 rounded-2xl shadow-lg border dark:border-gray-700`}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* GPA Circle */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative w-32 h-32 md:w-40 md:h-40">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="50%"
                                            cy="50%"
                                            r="45%"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            className="text-gray-200 dark:text-gray-600"
                                        />
                                        {grades.length > 0 && (
                                            <motion.circle
                                                cx="50%"
                                                cy="50%"
                                                r="45%"
                                                fill="none"
                                                stroke="url(#gradient)"
                                                strokeWidth="8"
                                                strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 45}`}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                                                animate={{
                                                    strokeDashoffset: 2 * Math.PI * 45 * (1 - Math.min(100, Math.max(0, currentPercentage)) / 100),
                                                }}
                                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                            />
                                        )}
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#8b5cf6" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-3xl md:text-4xl font-bold ${themeConfig.text}`}>
                                            {grades.length > 0
                                                ? (gradingSystem === 'college' ? stats.overallGPA.toFixed(1) : `${Math.round(currentPercentage)}%`)
                                                : '--'}
                                        </span>
                                        <span className={`text-sm ${themeConfig.textSecondary}`}>
                                            {gradingSystem === 'college' ? 'CGPA' : 'Overall'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <div className={`${themeConfig.background} p-4 rounded-xl`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className={`w-5 h-5 ${grades.length > 0 ? getGradeColor(currentPercentage) : themeConfig.textSecondary}`} />
                                        <span className={`text-sm ${themeConfig.textSecondary}`}>Letter Grade</span>
                                    </div>
                                    <span className={`text-3xl font-bold ${grades.length > 0 ? getGradeColor(currentPercentage) : themeConfig.textSecondary}`}>
                                        {grades.length > 0 ? stats.letterGrade : 'N/A'}
                                    </span>
                                </div>

                                <div className={`${themeConfig.background} p-4 rounded-xl`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart3 className={`w-5 h-5 ${themeConfig.primary.replace('bg-', 'text-')}`} />
                                        <span className={`text-sm ${themeConfig.textSecondary}`}>Percentage</span>
                                    </div>
                                    <span className={`text-3xl font-bold ${themeConfig.text}`}>
                                        {grades.length > 0 ? `${Math.round(currentPercentage)}%` : 'N/A'}
                                    </span>
                                </div>

                                <div className={`${themeConfig.background} p-4 rounded-xl`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {stats.trend === 'improving' ? (
                                            <TrendingUp className="w-5 h-5 text-green-500" />
                                        ) : stats.trend === 'declining' ? (
                                            <TrendingDown className="w-5 h-5 text-red-500" />
                                        ) : (
                                            <Minus className="w-5 h-5 text-gray-500" />
                                        )}
                                        <span className={`text-sm ${themeConfig.textSecondary}`}>Trend</span>
                                    </div>
                                    <span className={`text-lg font-semibold ${stats.trend === 'improving' ? 'text-green-500' :
                                        stats.trend === 'declining' ? 'text-red-500' : 'text-gray-500'
                                        }`}>
                                        {stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1)}
                                    </span>
                                </div>

                                <div className={`${themeConfig.background} p-4 rounded-xl`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className={`w-5 h-5 ${themeConfig.secondary.replace('bg-', 'text-')}`} />
                                        <span className={`text-sm ${themeConfig.textSecondary}`}>Total Grades</span>
                                    </div>
                                    <span className={`text-3xl font-bold ${themeConfig.text}`}>
                                        {grades.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Charts */}
                    {grades.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Trend Chart */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className={`${themeConfig.card} p-6 rounded-xl shadow-sm border dark:border-gray-700`}
                            >
                                <h3 className={`text-lg font-semibold ${themeConfig.text} mb-4`}>
                                    Grade Trend
                                </h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: themeConfig.card.includes('white') ? '#fff' : '#1f2937',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="percentage"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ fill: '#3b82f6', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </motion.div>

                            {/* Subject Comparison */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className={`${themeConfig.card} p-6 rounded-xl shadow-sm border dark:border-gray-700`}
                            >
                                <h3 className={`text-lg font-semibold ${themeConfig.text} mb-4`}>
                                    Subject Performance
                                </h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={subjectComparisonData}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: themeConfig.card.includes('white') ? '#fff' : '#1f2937',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                            }}
                                        />
                                        <Bar dataKey="average" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>
                    )}

                    {/* Subject Grade Cards */}
                    {stats.subjectGrades.length > 0 && (
                        <div>
                            <h2 className={`text-xl font-semibold ${themeConfig.text} mb-4`}>
                                Subject Grades
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {stats.subjectGrades.map((sg, index) => (
                                    <motion.div
                                        key={sg.subjectId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        className={`${themeConfig.card} p-5 rounded-xl shadow-sm border dark:border-gray-700 backdrop-blur-sm`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className={`font-semibold ${themeConfig.text}`}>{sg.subjectName}</h3>
                                            <span className={`text-2xl font-bold ${getGradeColor(sg.average)}`}>
                                                {sg.letterGrade}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className={themeConfig.textSecondary}>Average</span>
                                                <span className={`font-semibold ${themeConfig.text}`}>
                                                    {Math.round(sg.average)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <motion.div
                                                    className={`h-2 rounded-full ${getGradeBgColor(sg.average)}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${sg.average}%` }}
                                                    transition={{ duration: 1, delay: index * 0.1 }}
                                                />
                                            </div>
                                        </div>
                                        <div className={`text-xs ${themeConfig.textSecondary}`}>
                                            {sg.grades.length} grade{sg.grades.length !== 1 ? 's' : ''}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Grade Calculator Section */}
                    <div>
                        <h2 className={`text-xl font-semibold ${themeConfig.text} mb-4`}>
                            Grade Calculator 🧮
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Final Grade Calculator */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`${themeConfig.card} p-6 rounded-xl shadow-sm border dark:border-gray-700`}
                            >
                                <h3 className={`text-lg font-semibold ${themeConfig.text} mb-4 flex items-center gap-2`}>
                                    <Award className="w-5 h-5 text-blue-500" />
                                    What Grade Do I Need?
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                                            Current Grade (%)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="85"
                                            className={`w-full px-4 py-2 rounded-lg border ${themeConfig.background} ${themeConfig.text} border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none`}
                                            id="current-grade"
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                                            Final Exam Weight (%)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="30"
                                            className={`w-full px-4 py-2 rounded-lg border ${themeConfig.background} ${themeConfig.text} border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none`}
                                            id="final-weight"
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                                            Desired Grade (%)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="90"
                                            className={`w-full px-4 py-2 rounded-lg border ${themeConfig.background} ${themeConfig.text} border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none`}
                                            id="desired-grade"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            const current = parseFloat((document.getElementById('current-grade') as HTMLInputElement)?.value || '0');
                                            const weight = parseFloat((document.getElementById('final-weight') as HTMLInputElement)?.value || '0');
                                            const desired = parseFloat((document.getElementById('desired-grade') as HTMLInputElement)?.value || '0');

                                            if (weight <= 0 || weight > 100) {
                                                toast.error('Final weight must be between 0 and 100');
                                                return;
                                            }

                                            const needed = (desired * 100 - current * (100 - weight)) / weight;
                                            const resultDiv = document.getElementById('final-result');
                                            if (resultDiv) {
                                                if (needed > 100) {
                                                    resultDiv.innerHTML = `<div class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-center"><p class="text-2xl font-bold text-red-600 dark:text-red-400">Not Possible</p><p class="text-sm text-gray-600 dark:text-gray-400 mt-1">You need more than 100%</p></div>`;
                                                } else if (needed < 0) {
                                                    resultDiv.innerHTML = `<div class="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center"><p class="text-2xl font-bold text-green-600 dark:text-green-400">Already Achieved!</p><p class="text-sm text-gray-600 dark:text-gray-400 mt-1">You can score 0% and still reach your goal!</p></div>`;
                                                } else {
                                                    resultDiv.innerHTML = `<div class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center"><p class="text-3xl font-bold text-blue-600 dark:text-blue-400">${needed.toFixed(1)}%</p><p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Needed on final exam</p></div>`;
                                                }
                                            }
                                        }}
                                        className={`w-full py-3 rounded-lg ${themeConfig.primary} text-white font-medium`}
                                    >
                                        Calculate
                                    </motion.button>
                                    <div id="final-result"></div>
                                </div>
                            </motion.div>

                            {/* GPA Calculator */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className={`${themeConfig.card} p-6 rounded-xl shadow-sm border dark:border-gray-700`}
                            >
                                <h3 className={`text-lg font-semibold ${themeConfig.text} mb-4 flex items-center gap-2`}>
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                    {gradingSystem === 'college' ? 'CGPA' : 'Grade'} Calculator
                                </h3>
                                <div className="space-y-3">
                                    <p className={`text-sm ${themeConfig.textSecondary}`}>
                                        Based on your current grades:
                                    </p>
                                    <div className={`p-4 rounded-lg ${themeConfig.background}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-sm ${themeConfig.textSecondary}`}>
                                                {gradingSystem === 'college' ? 'Overall CGPA' : 'Overall Percentage'}
                                            </span>
                                            <span className={`text-3xl font-bold ${themeConfig.text}`}>
                                                {grades.length > 0
                                                    ? (gradingSystem === 'college' ? stats.overallGPA.toFixed(1) : `${Math.round(currentPercentage)}%`)
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm ${themeConfig.textSecondary}`}>Letter Grade</span>
                                            <span className={`text-2xl font-bold ${grades.length > 0 ? getGradeColor(currentPercentage) : themeConfig.textSecondary}`}>
                                                {grades.length > 0 ? stats.letterGrade : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {stats.subjectGrades.length > 0 && (
                                        <div className="space-y-2">
                                            <p className={`text-sm font-medium ${themeConfig.text} mt-4`}>By Subject:</p>
                                            {stats.subjectGrades.map((sg) => (
                                                <div key={sg.subjectId} className={`p-3 rounded-lg ${themeConfig.background} flex items-center justify-between`}>
                                                    <span className={`text-sm ${themeConfig.text}`}>{sg.subjectName}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-sm font-semibold ${getGradeColor(sg.average)}`}>
                                                            {Math.round(sg.average)}%
                                                        </span>
                                                        <span className={`text-lg font-bold ${getGradeColor(sg.average)}`}>
                                                            {sg.letterGrade}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Recent Grades */}
                    <div>
                        <h2 className={`text-xl font-semibold ${themeConfig.text} mb-4`}>
                            Recent Grades
                        </h2>
                        {recentGrades.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`${themeConfig.card} p-12 rounded-xl shadow-sm border dark:border-gray-700 text-center`}
                            >
                                <Award className={`w-16 h-16 ${themeConfig.textSecondary} mx-auto mb-4 opacity-50`} />
                                <p className={`${themeConfig.textSecondary} mb-4`}>
                                    No grades yet. Start tracking your academic performance!
                                </p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className={`${themeConfig.primary} text-white px-6 py-2 rounded-lg`}
                                >
                                    Add Your First Grade
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                {recentGrades.map((grade, index) => {
                                    const percentage = (grade.score / grade.maxScore) * 100;
                                    const category = GRADE_CATEGORIES.find(c => c.value === grade.category);

                                    return (
                                        <motion.div
                                            key={grade.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`${themeConfig.card} p-4 rounded-xl shadow-sm border dark:border-gray-700 flex items-center gap-4`}
                                        >
                                            <div className={`${category?.color} w-1 h-12 rounded-full`} />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`font-semibold ${themeConfig.text}`}>
                                                        {grade.subjectName}
                                                    </h4>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${category?.color} bg-opacity-20`}>
                                                        {category?.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className={themeConfig.textSecondary}>
                                                        {new Date(grade.date).toLocaleDateString()}
                                                    </span>
                                                    <span className={themeConfig.textSecondary}>•</span>
                                                    <span className={`font-semibold ${getGradeColor(percentage)}`}>
                                                        {grade.score}/{grade.maxScore} ({Math.round(percentage)}%)
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(grade.id)}
                                                className={`p-2 rounded-lg ${themeConfig.background} hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Add Grade Modal */}
                    <AnimatePresence>
                        {showAddModal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
                                onClick={() => setShowAddModal(false)}
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="modal-title"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`${themeConfig.card} rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto`}
                                >
                                    <div className="p-4 md:p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 id="modal-title" className={`text-2xl font-bold ${themeConfig.text}`}>
                                                Add New Grade
                                            </h2>
                                            <button
                                                onClick={() => setShowAddModal(false)}
                                                className={`p-2 rounded-lg ${themeConfig.background} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {/* Subject */}
                                            <div>
                                                <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                                                    Subject *
                                                </label>
                                                <select
                                                    required
                                                    value={formData.subjectId}
                                                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg ${themeConfig.background} ${themeConfig.text} border dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none relative z-10`}
                                                >
                                                    <option value="">Select a subject</option>
                                                    {subjects.length === 0 ? (
                                                        <option value="" disabled>No subjects available - Please create a subject first</option>
                                                    ) : (
                                                        subjects.map(subject => (
                                                            <option key={subject.id} value={subject.id}>
                                                                {subject.name}
                                                            </option>
                                                        ))
                                                    )}
                                                </select>
                                            </div>

                                            {/* Category */}
                                            <div>
                                                <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                                                    Category *
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {GRADE_CATEGORIES.map(cat => (
                                                        <button
                                                            key={cat.value}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, category: cat.value as Grade['category'] })}
                                                            className={`px-4 py-2 rounded-lg border-2 transition-all ${formData.category === cat.value
                                                                ? `${cat.color} text-white border-transparent`
                                                                : `${themeConfig.background} ${themeConfig.text} border-gray-300 dark:border-gray-600`
                                                                }`}
                                                        >
                                                            {cat.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Score */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                                                        Score *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        step="0.01"
                                                        value={formData.score}
                                                        onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                                                        className={`w-full px-4 py-2 rounded-lg ${themeConfig.background} ${themeConfig.text} border dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none`}
                                                        placeholder="85"
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                                                        Max Score *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        step="0.01"
                                                        value={formData.maxScore}
                                                        onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                                                        className={`w-full px-4 py-2 rounded-lg ${themeConfig.background} ${themeConfig.text} border dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none`}
                                                        placeholder="100"
                                                    />
                                                </div>
                                            </div>

                                            {/* Weight & Date */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                                                        Weight
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        value={formData.weight}
                                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                        className={`w-full px-4 py-2 rounded-lg ${themeConfig.background} ${themeConfig.text} border dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none`}
                                                        placeholder="1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                                                        Date *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        required
                                                        max={new Date().toISOString().split('T')[0]}
                                                        value={formData.date}
                                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                        className={`w-full px-4 py-2 rounded-lg ${themeConfig.background} ${themeConfig.text} border dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            <div>
                                                <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                                                    Notes (Optional)
                                                </label>
                                                <textarea
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                    rows={2}
                                                    className={`w-full px-4 py-2 rounded-lg ${themeConfig.background} ${themeConfig.text} border dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none`}
                                                    placeholder="Add any notes about this grade..."
                                                />
                                            </div>

                                            {/* Preview */}
                                            {formData.score && formData.maxScore && (
                                                <div className={`p-4 rounded-lg ${themeConfig.background} border-2 border-blue-500/20`}>
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-sm ${themeConfig.textSecondary}`}>
                                                            Grade Preview:
                                                        </span>
                                                        <span className={`text-2xl font-bold ${getGradeColor(
                                                            (parseFloat(formData.score) / parseFloat(formData.maxScore)) * 100
                                                        )
                                                            }`}>
                                                            {Math.round((parseFloat(formData.score) / parseFloat(formData.maxScore)) * 100)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Buttons */}
                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddModal(false)}
                                                    className={`flex-1 py-3 rounded-lg border dark:border-gray-700 ${themeConfig.text} font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className={`flex-1 py-3 rounded-lg ${themeConfig.primary} text-white font-medium hover:opacity-90 transition-opacity`}
                                                >
                                                    Save Grade
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
