import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTask } from '../context/TaskContext';
import { useTimetable } from '../context/TimetableContext';
import { TaskCard } from '../components/TaskCard';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, getDay } from 'date-fns';

export function Calendar() {
    const { themeConfig } = useTheme();
    const { tasks, toggleTask, deleteTask } = useTask();
    const { classes } = useTimetable();
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

    const getClassesForDate = (date: Date) => {
        // Convert date to day index (0=Mon, 1=Tue, ..., 6=Sun)
        const jsDay = getDay(date); // 0=Sun, 1=Mon, ..., 6=Sat
        const dayIndex = jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Mon, 6=Sun

        return classes
            .filter(cls => cls.day === dayIndex)
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    const selectedDateTasks = getTasksForDate(selectedDate);
    const selectedDateClasses = getClassesForDate(selectedDate);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="h-full flex flex-col">
            <div className="flex-none p-4 md:p-6 pb-2 pt-8 md:pt-12 z-10 bg-inherit">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200"
                >
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text}`}>Calendar</h1>
                        <p className={themeConfig.textSecondary}>
                            View your tasks organized by date
                        </p>
                    </div>
                </motion.div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-2 pb-24 md:pb-6 scroll-smooth">
                <div className="space-y-6">
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

                    {/* Selected Date Tasks and Classes */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Classes Section */}
                        {selectedDateClasses.length > 0 && (
                            <div className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className={`w-5 h-5 ${themeConfig.primary.replace('bg-', 'text-')}`} />
                                    <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text}`}>
                                        Classes for {format(selectedDate, 'EEEE, MMMM dd')}
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {selectedDateClasses.map((classItem, index) => (
                                        <motion.div
                                            key={classItem.id || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`p-4 rounded-lg border-l-4 ${themeConfig.background} hover:shadow-md transition-all`}
                                            style={{ borderLeftColor: classItem.color }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className={`font-semibold ${themeConfig.text} mb-1`}>
                                                        {classItem.subject}
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className={themeConfig.textSecondary}>
                                                            🕐 {classItem.time}
                                                        </span>
                                                        <span className={themeConfig.textSecondary}>
                                                            ⏱️ {classItem.duration} min
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium`}
                                                            style={{
                                                                backgroundColor: `${classItem.color}20`,
                                                                color: classItem.color
                                                            }}
                                                        >
                                                            {classItem.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tasks Section */}
                        <div className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}>
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
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            index={index}
                                            onToggle={toggleTask}
                                            onDelete={deleteTask}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
