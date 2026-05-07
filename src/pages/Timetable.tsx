import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, BookOpen, X, Calendar, Grid3x3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTimetable } from '../context/TimetableContext';
import { useTask } from '../context/TaskContext';
import { useSubject } from '../context/SubjectContext';
import { format, startOfWeek, addDays, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { AddTaskModal } from '../components/AddTaskModal';

export function Timetable() {
  const { themeConfig } = useTheme();
  const { classes, addClass, deleteClass } = useTimetable();
  const { tasks } = useTask();
  const { subjects } = useSubject();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimetable, setShowTimetable] = useState(() => localStorage.getItem('showTimetable') === 'true');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [newClass, setNewClass] = useState({
    subject: '',
    type: 'Lecture',
    day: 0,
    time: '09:00',
    duration: 60,
    color: 'bg-blue-500'
  });

  const toggleTimetable = () => {
    const newVal = !showTimetable;
    setShowTimetable(newVal);
    localStorage.setItem('showTimetable', String(newVal));
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // 0 = Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Dynamically generate time slots based on existing classes, with some defaults if empty
  const dynamicTimeSlots = Array.from(new Set(classes.map(c => c.time))).sort();
  const timeSlots = dynamicTimeSlots.length > 0 ? dynamicTimeSlots : ['09:00', '10:00', '11:00', '12:00'];

  const getClassForSlot = (dayIndex: number, time: string) => {
    return classes.find(cls => cls.day === dayIndex && cls.time === time);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.subject || !newClass.type) return;

    addClass(newClass);
    setNewClass({
      subject: '',
      type: 'Lecture',
      day: 0,
      time: '09:00',
      duration: 60,
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
          <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text}`}>Schedule</h1>
          <p className={themeConfig.textSecondary}>
            Manage your calendar and classes
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {!showTimetable && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimetable}
              className={`${themeConfig.card} ${themeConfig.text} border dark:border-gray-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm text-sm`}
            >
              <Grid3x3 className="w-4 h-4" />
              Create Timetable
            </motion.button>
          )}
          {showTimetable && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className={`${themeConfig.primary} ${themeConfig.primaryHover} text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg text-sm md:text-base`}
            >
              <Plus className="w-5 h-5" />
              Add Class
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Monthly Calendar View (Primary View) */}
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
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className={`text-center font-semibold ${themeConfig.textSecondary} text-sm p-2`}>
                  {day}
                </div>
              ))}
              {(() => {
                const monthStart = startOfMonth(currentMonth);
                const monthEnd = endOfMonth(currentMonth);
                const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
                const startDay = monthStart.getDay(); // 0 is Sunday
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
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSelectedDate(day);
                        setShowActionModal(true);
                      }}
                      className={`p-2 min-h-[80px] rounded-lg border-2 cursor-pointer transition-colors duration-200 ${isToday(day)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                        : isSameMonth(day, currentMonth)
                          ? `${themeConfig.background} border-gray-200 dark:border-gray-600 hover:border-blue-400`
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-50 hover:opacity-80'
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(task);
                            }}
                            className="text-xs px-1 py-0.5 rounded bg-blue-500 text-white truncate hover:bg-blue-600 transition-colors"
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

      {showTimetable && (
        // Weekly Timetable View (Optional)
        <>
          <div className="flex items-center justify-between mt-8 mb-4">
            <h2 className={`text-xl font-bold ${themeConfig.text}`}>Weekly Timetable</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimetable}
              className={`text-sm px-3 py-1.5 rounded border ${themeConfig.text === 'text-white' ? 'border-gray-600 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-600'}`}
            >
              Hide Timetable
            </motion.button>
          </div>
          
          {/* Week Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${themeConfig.card} p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6`}
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
                          onClick={() => classItem && setSelectedClass(classItem)}
                          title={classItem ? `${classItem.subject} - ${classItem.type}` : undefined}
                          className={`p-2 md:p-3 min-h-[50px] md:min-h-[70px] border-2 rounded-lg flex items-center justify-center ${classItem
                            ? `${classItem.color} text-white shadow-md border-transparent`
                            : `${themeConfig.card} hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600`
                            } transition-all duration-200 cursor-pointer overflow-hidden`}
                        >
                          {classItem && (
                            <div className="text-center w-full px-1">
                              <div className="font-medium text-xs md:text-sm truncate max-w-full" title={classItem.subject}>
                                {classItem.subject}
                              </div>
                              <div className="text-xs opacity-90 hidden md:block truncate max-w-full" title={classItem.type}>
                                {classItem.type}
                              </div>
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
                    <select
                      value={newClass.subject}
                      onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
                      required
                    >
                      <option value="" disabled>Select a subject</option>
                      {subjects.length > 0 ? subjects.map(sub => (
                        <option key={sub.id} value={sub.name} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                          {sub.name}
                        </option>
                      )) : (
                        <option value="General" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">General (Please add subjects in Subjects tab)</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                      Type *
                    </label>
                    <select
                      value={newClass.type}
                      onChange={(e) => setNewClass({ ...newClass, type: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
                      required
                    >
                      <option value="Lecture" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Lecture</option>
                      <option value="Lab" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Lab</option>
                      <option value="Tutorial" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Tutorial</option>
                      <option value="Seminar" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Seminar</option>
                      <option value="Workshop" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Workshop</option>
                      <option value="Other" className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">Other</option>
                    </select>
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
                          <option key={index} value={index} className="text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                            {format(day, 'EEEE')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                        Time
                      </label>
                      <input
                        type="time"
                        value={newClass.time}
                        onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      min="15"
                      step="15"
                      value={newClass.duration}
                      onChange={(e) => setNewClass({ ...newClass, duration: parseInt(e.target.value) || 60 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
                      required
                    />
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

      {/* Class Detail Modal */}
      {selectedClass && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
          onClick={() => setSelectedClass(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`${themeConfig.card} p-6 rounded-xl shadow-2xl w-full max-w-md`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${themeConfig.text}`}>Class Details</h2>
              <button
                onClick={() => setSelectedClass(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className={`w-5 h-5 ${themeConfig.textSecondary}`} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Color Indicator */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${selectedClass.color} rounded-lg`} />
                <div className="flex-1">
                  <p className={`text-sm ${themeConfig.textSecondary}`}>Color</p>
                  <p className={`font-medium ${themeConfig.text}`}>
                    {selectedClass.color.replace('bg-', '').replace('-500', '')}
                  </p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <p className={`text-sm ${themeConfig.textSecondary} mb-1`}>Subject</p>
                <p className={`text-lg font-semibold ${themeConfig.text}`}>{selectedClass.subject}</p>
              </div>

              {/* Type */}
              <div>
                <p className={`text-sm ${themeConfig.textSecondary} mb-1`}>Type</p>
                <p className={`font-medium ${themeConfig.text}`}>{selectedClass.type}</p>
              </div>

              {/* Day */}
              <div>
                <p className={`text-sm ${themeConfig.textSecondary} mb-1`}>Day</p>
                <p className={`font-medium ${themeConfig.text}`}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][selectedClass.day]}
                </p>
              </div>

              {/* Time */}
              <div>
                <p className={`text-sm ${themeConfig.textSecondary} mb-1`}>Time</p>
                <p className={`font-medium ${themeConfig.text}`}>{selectedClass.time}</p>
              </div>

              {/* Duration */}
              <div>
                <p className={`text-sm ${themeConfig.textSecondary} mb-1`}>Duration</p>
                <p className={`font-medium ${themeConfig.text}`}>{selectedClass.duration} minute(s)</p>
              </div>
            </div>

            {/* Delete Button */}
            <div className="mt-6 pt-4 border-t dark:border-gray-700">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (selectedClass.id) {
                    deleteClass(selectedClass.id);
                    setSelectedClass(null);
                  }
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Delete Class
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Task Detail Modal (for Calendar View) */}
      {selectedTask && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
          onClick={() => setSelectedTask(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`${themeConfig.card} p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${themeConfig.text}`}>Task Details</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className={`w-5 h-5 ${themeConfig.textSecondary}`} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <p className={`text-sm ${themeConfig.textSecondary} mb-1`}>Title</p>
                <p className={`text-lg font-semibold ${themeConfig.text}`}>{selectedTask.title}</p>
              </div>

              {/* Description */}
              {selectedTask.description && (
                <div>
                  <p className={`text-sm ${themeConfig.textSecondary} mb-1`}>Description</p>
                  <p className={`${themeConfig.text}`}>{selectedTask.description}</p>
                </div>
              )}

              {/* Priority */}
              <div>
                <p className={`text-sm ${themeConfig.textSecondary} mb-1`}>Priority</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedTask.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                  {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                </span>
              </div>

              {/* Due Date */}
              {selectedTask.dueDate && (
                <div>
                  <p className={`text-sm ${themeConfig.textSecondary} mb-1`}>Due Date</p>
                  <p className={`font-medium ${themeConfig.text}`}>
                    {format(new Date(selectedTask.dueDate), 'MMMM dd, yyyy')}
                  </p>
                </div>
              )}

              {/* Category */}
              {selectedTask.category && (
                <div>
                  <p className={`text-sm ${themeConfig.textSecondary} mb-1`}>Category</p>
                  <p className={`font-medium ${themeConfig.text}`}>{selectedTask.category}</p>
                </div>
              )}

              {/* Completion Status */}
              <div>
                <p className={`text-sm ${themeConfig.textSecondary} mb-1`}>Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedTask.completed
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                  {selectedTask.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t dark:border-gray-700 space-y-3">
              {/* Toggle Completion */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Toggle task completion - you'll need to import toggleTask from useTask
                  setSelectedTask(null);
                }}
                className={`w-full ${selectedTask.completed ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'} text-white py-3 rounded-lg font-medium transition-colors duration-200`}
              >
                {selectedTask.completed ? 'Mark as Pending' : 'Mark as Completed'}
              </motion.button>

              {/* Delete Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Delete task - you'll need to import deleteTask from useTask
                  setSelectedTask(null);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Delete Task
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Date Action Modal */}
      {showActionModal && selectedDate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
          onClick={() => setShowActionModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`${themeConfig.card} p-6 rounded-xl shadow-xl w-full max-w-sm`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${themeConfig.text}`}>
                {format(selectedDate, 'MMM dd, yyyy')}
              </h2>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className={`w-5 h-5 ${themeConfig.textSecondary}`} />
              </button>
            </div>
            
            <div className="space-y-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowActionModal(false);
                  setNewClass(prev => ({ ...prev, day: selectedDate.getDay() }));
                  if (!showTimetable) {
                    toggleTimetable();
                  }
                  setTimeout(() => setShowAddModal(true), 50); // slight delay to allow timetable to open
                }}
                className={`w-full text-left px-4 py-3 rounded-lg border ${themeConfig.text === 'text-white' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} flex items-center gap-4 transition-colors`}
              >
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className={`font-medium ${themeConfig.text}`}>Add Class</div>
                  <div className={`text-xs ${themeConfig.textSecondary}`}>Schedule a class for this day</div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowActionModal(false);
                  setShowAddTaskModal(true);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg border ${themeConfig.text === 'text-white' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} flex items-center gap-4 transition-colors`}
              >
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Plus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className={`font-medium ${themeConfig.text}`}>Add Task / Reminder</div>
                  <div className={`text-xs ${themeConfig.textSecondary}`}>Set a deadline or reminder</div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Task Modal (for Calendar View) - Using AddTaskModal component */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        initialDate={selectedDate}
      />
    </div>
  );
}