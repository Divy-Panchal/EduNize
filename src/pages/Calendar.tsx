import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTask } from '../context/TaskContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export function Calendar() {
    const { themeConfig, theme } = useTheme();
    const { tasks } = useTask();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const getTasksForDate = (date: Date) => {
        return tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return isSameDay(taskDate, date);
        });
    };

    const selectedDateTasks = getTasksForDate(selectedDate);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-50 py-4 -mx-4 px-4 backdrop-blur-md transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-gray-50/80'
                    }`}
            >
                <div>
                    <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text}`}>Calendar</h1>
                    <p className={themeConfig.textSecondary}>
                        View your tasks organized by date
                    </p>
                </div>
            </motion.div>

            {/* Calendar Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
            >
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                        <ChevronLeft className={`w-5 h-5 ${themeConfig.textSecondary}`} />
                    </motion.button>

                    <h2 className={`text-lg md:text-xl font-semibold ${themeConfig.text}`}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                        <ChevronRight className={`w-5 h-5 ${themeConfig.textSecondary}`} />
                    </motion.button>
                </div>

                {/* Week Days Header */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekDays.map(day => (
                        <div
                            key={day}
                            className={`text-center text-xs md:text-sm font-semibold ${themeConfig.textSecondary} py-2`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                        const dayTasks = getTasksForDate(day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        const hasTasks = dayTasks.length > 0;

                        return (
                            <motion.button
                                key={day.toISOString()}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.01 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDate(day)}
                                className={`
                  relative aspect-square p-2 rounded-lg text-sm md:text-base font-medium
                  transition-all duration-200
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isSelected
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                        : isToday
                                            ? `${themeConfig.primary} text-white`
                                            : `${themeConfig.background} ${themeConfig.text} hover:bg-gray-100 dark:hover:bg-gray-700`
                                    }
                `}
                            >
                                <span>{format(day, 'd')}</span>
                                {hasTasks && (
                                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                                        {dayTasks.slice(0, 3).map((task, i) => (
                                            <div
                                                key={i}
                                                className={`w-1 h-1 rounded-full ${isSelected || isToday
                                                    ? 'bg-white'
                                                    : task.priority === 'high'
                                                        ? 'bg-red-500'
                                                        : task.priority === 'medium'
                                                            ? 'bg-yellow-500'
                                                            : 'bg-green-500'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Selected Date Tasks */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
            >
                <div className="flex items-center gap-3 mb-4">
                    <CalendarIcon className={`w-5 h-5 ${themeConfig.primary.replace('bg-', 'text-')}`} />
                    <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text}`}>
                        Tasks for {format(selectedDate, 'MMMM dd, yyyy')}
                    </h3>
                </div>

                {selectedDateTasks.length === 0 ? (
                    <p className={`text-sm ${themeConfig.textSecondary}`}>
                        No tasks scheduled for this date
                    </p>
                ) : (
                    <div className="space-y-3">
                        {selectedDateTasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-4 rounded-lg ${themeConfig.background} border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className={`font-semibold ${themeConfig.text}`}>{task.title}</h4>
                                    <span className={`text-xs px-2 py-1 rounded-full ${task.priority === 'high'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                        : task.priority === 'medium'
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                            : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                        }`}>
                                        {task.priority}
                                    </span>
                                </div>
                                {task.description && (
                                    <p className={`text-sm ${themeConfig.textSecondary} mb-2`}>
                                        {task.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs ${themeConfig.textSecondary}`}>
                                        {task.category}
                                    </span>
                                    {task.completed && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                            Completed
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
