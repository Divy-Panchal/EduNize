import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, Award, CheckCircle2, Flame, Timer } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from '../components/TaskCard';
import { isToday, isYesterday, format } from 'date-fns';
import toast from 'react-hot-toast';

export function Tasks() {
  const { tasks, toggleTask, deleteTask } = useTask();
  const { themeConfig } = useTheme();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const completedTasksCount = parseInt(localStorage.getItem(`completedTasksCount_${user?.uid}`) || '0');
  const studyStreak = parseInt(localStorage.getItem(`studyStreak_${user?.uid}`) || '0');
  const pomodoroSessions = parseInt(localStorage.getItem('pomodoroSessions') || '0');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const activeTasks = filteredTasks.filter(t => !t.completed);

  const handleToggleTask = (id: string) => {
    toggleTask(id);
    toast.success('Task updated!');
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    toast.success('Task deleted!');
  };

  return (
    <div className="space-y-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text}`}>Tasks</h1>
          <p className={themeConfig.textSecondary}>
            Manage and review your study assignments
          </p>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${themeConfig.card} p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-2.5 md:top-3 w-4 md:w-5 h-4 md:h-5 ${themeConfig.textSecondary}`} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-8 md:pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className={`w-4 md:w-5 h-4 md:h-5 ${themeConfig.textSecondary}`} />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${themeConfig.background} ${themeConfig.text} dark:border-gray-600`}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Active Tasks Grid */}
      {activeTasks.length > 0 ? (
        <div className="space-y-4">
          <h2 className={`text-lg font-semibold flex items-center gap-2 ${themeConfig.text}`}>
            <Calendar className="w-5 h-5 text-blue-500" />
            Active Tasks
          </h2>
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {activeTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${themeConfig.card} p-6 md:p-10 rounded-2xl border border-gray-100 dark:border-gray-700 max-w-3xl mx-auto shadow-sm`}
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className={`text-2xl font-bold ${themeConfig.text} mb-3`}>All caught up!</h2>
            <p className={`${themeConfig.textSecondary} max-w-md mx-auto`}>
              You have no active tasks. Head over to the Schedule tab to add more, or take a moment to admire your productivity below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className={`p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center transform transition-transform hover:scale-105 duration-200`}>
              <Award className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{completedTasksCount}</div>
              <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">Tasks Crushed</div>
            </div>
            
            <div className={`p-6 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-center transform transition-transform hover:scale-105 duration-200`}>
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{studyStreak}</div>
              <div className="text-sm text-orange-800 dark:text-orange-300 font-medium">Day Streak</div>
            </div>

            <div className={`p-6 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-center transform transition-transform hover:scale-105 duration-200`}>
              <Timer className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{pomodoroSessions}</div>
              <div className="text-sm text-purple-800 dark:text-purple-300 font-medium">Focus Sessions</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
