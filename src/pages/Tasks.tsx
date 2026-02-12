import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Image as ImageIcon, X, Calendar } from 'lucide-react';
import { useTask, Task } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { TaskCard } from '../components/TaskCard';
import { AddTaskModal } from '../components/AddTaskModal';
import toast from 'react-hot-toast';

export function Tasks() {
  const { tasks, toggleTask, deleteTask } = useTask();
  const { themeConfig, theme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const handleToggleTask = (id: string) => {
    toggleTask(id);
    toast.success('Task updated!');
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    toast.success('Task deleted!');
  };

  return (
    <div className="space-y-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-50 py-4 -mx-4 px-4 backdrop-blur-md transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-gray-50/80'
          }`}
      >
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text}`}>Tasks</h1>
          <p className={themeConfig.textSecondary}>
            Manage your study tasks and assignments
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className={`${themeConfig.primary} ${themeConfig.primaryHover} text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg text-sm md:text-base`}
        >
          <Plus className="w-4 md:w-5 h-4 md:h-5" />
          Add Task
        </motion.button>
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

      {/* Tasks Grid */}
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {filteredTasks.map((task, index) => (
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

      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className={`text-lg ${themeConfig.textSecondary}`}>
            {searchTerm || filterPriority !== 'all'
              ? 'No tasks match your filters'
              : 'No tasks yet! Start adding tasks to boost your productivity.'}
          </p>
          {!(searchTerm || filterPriority !== 'all') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className={`${themeConfig.primary} ${themeConfig.primaryHover} text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg text-base mx-auto mt-6`}
            >
              <Plus className="w-5 h-5" />
              Quick Add Task
            </motion.button>
          )}
          <p className={`text-sm ${themeConfig.textSecondary} mt-2`}>
            {searchTerm || filterPriority !== 'all' ? 'Try adjusting your search or filters' : ''}
          </p>
        </motion.div>
      )}

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
