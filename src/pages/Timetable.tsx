import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, BookOpen, X, Calendar, Grid3x3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTimetable } from '../context/TimetableContext';
import { useTask } from '../context/TaskContext';
import { format, startOfWeek, addDays, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { AddTaskModal } from '../components/AddTaskModal';

export function Timetable() {
  const { themeConfig } = useTheme();
  const { classes, addClass, deleteClass } = useTimetable();
  const { tasks } = useTask();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newClass, setNewClass] = useState({
    subject: '',
    type: '',
    day: 0,
    time: '09:00',
    duration: 1,
    color: 'bg-blue-500'
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const getClassForSlot = (dayIndex: number, time: string) => {
    return classes.find(cls => cls.day === dayIndex && cls.time === time);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.subject || !newClass.type) return;

    addClass(newClass);
    setNewClass({
      subject: '',
      type: '',
      day: 0,
      time: '09:00',
      duration: 1,
      color: 'bg-blue-500'
    });
    setShowAddModal(false);
  };

  const colorOptions = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
    'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
  ];
  return (
    <div className="space-y-6 pb-20 md:pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text}`}>Timetable</h1>
          <p className={themeConfig.textSecondary}>
            Your weekly class schedule
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (viewMode === 'month') {
              setShowAddTaskModal(true);
            } else {
              setShowAddModal(true);
            }
          }}
          className={`${themeConfig.primary} ${themeConfig.primaryHover} text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg text-sm md:text-base`}
        >
          <Plus className="w-5 h-5" />
          {viewMode === 'month' ? 'Add Task' : 'Add Class'}
        </motion.button>
      </motion.div>

      {/* Week Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${themeConfig.card} p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700`}
      >
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className={`w-5 h-5 ${themeConfig.textSecondary}`} />
          </motion.button>

          <h2 className={`text-sm md:text-lg font-semibold ${themeConfig.text}`}>
            Week of {format(weekStart, 'MMM dd, yyyy')}
          </h2>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <ChevronRight className={`w-5 h-5 ${themeConfig.textSecondary}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex justify-center gap-2"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setViewMode('week')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${viewMode === 'week'
            ? `${themeConfig.primary} text-white`
            : `${themeConfig.card} ${themeConfig.text} border dark:border-gray-600`
            }`}
        >
          <Grid3x3 className="w-4 h-4" />
          Week View
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setViewMode('month')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${viewMode === 'month'
            ? `${themeConfig.primary} text-white`
            : `${themeConfig.card} ${themeConfig.text} border dark:border-gray-600`
            }`}
        >
          <Calendar className="w-4 h-4" />
          Calendar View
        </motion.button>
      </motion.div>

      {viewMode === 'month' ? (
        // Monthly Calendar View
        <>
          {/* Month Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${themeConfig.card} p-4 rounded-xl shadow-sm border dark:border-gray-700`}
          >
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft className={`w-5 h-5 ${themeConfig.textSecondary}`} />
              </motion.button>
              <h2 className={`text-lg font-semibold ${themeConfig.text}`}>
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronRight className={`w-5 h-5 ${themeConfig.textSecondary}`} />
              </motion.button>
            </div>
          </motion.div>

          {/* Calendar Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${themeConfig.card} p-4 rounded-xl shadow-sm border dark:border-gray-700`}
          >
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className={`text-center font-semibold ${themeConfig.textSecondary} text-sm p-2`}>
                  {day}
                </div>
              ))}
              {(() => {
                const monthStart = startOfMonth(currentMonth);
                const monthEnd = endOfMonth(currentMonth);
                const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
                const startDay = (monthStart.getDay() + 6) % 7;
                const emptyDays = Array(startDay).fill(null);

                return [...emptyDays, ...days].map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="p-2" />;
                  }

                  const dayTasks = tasks.filter(task =>
                    task.dueDate && isSameDay(new Date(task.dueDate), day)
                  );

                  return (
                    <motion.div
                      key={day.toISOString()}
                      whileHover={{ scale: 1.05 }}
                      className={`p-2 min-h-[80px] rounded-lg border-2 ${isToday(day)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : isSameMonth(day, currentMonth)
                          ? `${themeConfig.background} border-gray-200 dark:border-gray-600`
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-50'
                        }`}
                    >
                      <div className={`text-sm font-medium ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : themeConfig.text
                        }`}>
                        {format(day, 'd')}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayTasks.slice(0, 2).map((task, idx) => (
                          <div
                            key={idx}
                            className="text-xs px-1 py-0.5 rounded bg-blue-500 text-white truncate"
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </div>
          </motion.div>
        </>
      ) : (
        // Weekly View (existing code)
        <>
          {/* Today's Classes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700`}
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className={`w-5 h-5 ${themeConfig.primary.replace('bg-', 'text-')}`} />
              <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text}`}>Today's Classes</h3>
            </div>

            <div className="space-y-3">
              {classes.slice(0, 3).map((classItem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 md:gap-4 p-3 rounded-lg ${themeConfig.background} relative`}
                >
                  <div className={`w-3 h-3 ${classItem.color} rounded-full`} />
                  <div className="flex-1">
                    <h4 className={`font-medium ${themeConfig.text} text-sm md:text-base`}>{classItem.subject}</h4>
                    <p className={`text-xs md:text-sm ${themeConfig.textSecondary}`}>{classItem.type}</p>
                  </div>
                  <span className={`text-xs md:text-sm font-medium ${themeConfig.textSecondary}`}>
                    {classItem.time}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (classItem.id) {
                        deleteClass(classItem.id);
                      }
                    }}
                    className="relative z-10 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors duration-200 flex-shrink-0"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Timetable Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${themeConfig.card} p-2 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-auto`}
          >
            <div className="min-w-full pb-4">
              <div className={`grid grid-cols-8 gap-1 md:gap-2 mb-4 sticky top-0 ${themeConfig.card} z-10`}>
                <div className={`p-1 md:p-3 text-center font-medium ${themeConfig.textSecondary} text-xs md:text-sm`}>Time</div>
                {weekDays.map((day, index) => (
                  <motion.div
                    key={day.toISOString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-1 md:p-3 text-center"
                  >
                    <div className={`font-medium ${themeConfig.text} text-xs md:text-sm`}>
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-xs md:text-sm ${themeConfig.textSecondary}`}>
                      {format(day, 'MMM dd')}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-2 md:space-y-2">
                {timeSlots.map((time, timeIndex) => (
                  <motion.div
                    key={time}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: timeIndex * 0.05 }}
                    className="grid grid-cols-8 gap-1 md:gap-2"
                  >
                    <div className={`p-2 md:p-3 text-xs md:text-sm font-medium ${themeConfig.textSecondary} text-center flex items-center justify-center ${themeConfig.card} rounded-lg border border-gray-200 dark:border-gray-700`}>
                      {time}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const classItem = getClassForSlot(dayIndex, time);
                      return (
                        <motion.div
                          key={`${day.toISOString()}-${time}`}
                          whileHover={{ scale: 1.02 }}
                          className={`p-2 md:p-3 min-h-[50px] md:min-h-[70px] border-2 rounded-lg flex items-center justify-center ${classItem
                            ? `${classItem.color} text-white shadow-md border-transparent`
                            : `${themeConfig.card} hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600`
                            } transition-all duration-200 cursor-pointer`}
                        >
                          {classItem && (
                            <div className="text-center">
                              <div className="font-medium text-xs md:text-sm">{classItem.subject}</div>
                              <div className="text-xs opacity-90 hidden md:block">{classItem.type}</div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Add Class Modal */}
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-lg md:text-xl font-semibold ${themeConfig.text}`}>Add New Class</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <X className={`w-5 h-5 ${themeConfig.textSecondary}`} />
                  </button>
                </div>

                <form onSubmit={handleAddClass} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={newClass.subject}
                      onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
                      placeholder="e.g., Mathematics"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                      Type *
                    </label>
                    <input
                      type="text"
                      value={newClass.type}
                      onChange={(e) => setNewClass({ ...newClass, type: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
                      placeholder="e.g., Lecture, Lab, Tutorial"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                        Day
                      </label>
                      <select
                        value={newClass.day}
                        onChange={(e) => setNewClass({ ...newClass, day: parseInt(e.target.value) })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
                      >
                        {weekDays.map((day, index) => (
                          <option key={index} value={index} className="text-gray-900 bg-white">
                            {format(day, 'EEEE')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                        Time
                      </label>
                      <select
                        value={newClass.time}
                        onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time} className="text-gray-900 bg-white">{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                      Color
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewClass({ ...newClass, color })}
                          className={`w-8 h-8 ${color} rounded-lg border-2 ${newClass.color === color ? 'border-gray-800 dark:border-gray-200' : 'border-gray-200 dark:border-gray-600'
                            } transition-all duration-200`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={`flex-1 ${themeConfig.primary} ${themeConfig.primaryHover} text-white py-2 md:py-3 rounded-lg font-medium transition-colors duration-200 text-sm md:text-base`}
                    >
                      Add Class
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className={`${themeConfig.card} px-4 md:px-6 py-2 md:py-3 border dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm md:text-base`}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </>
      )}

      {/* Add Task Modal (for Calendar View) - Using AddTaskModal component */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
      />
    </div>
  );
}