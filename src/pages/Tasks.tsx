import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Image as ImageIcon, X, Calendar, CheckCircle2 } from 'lucide-react';
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
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="sticky top-0 z-50 p-4 md:p-6 pb-2 pt-8 md:pt-12 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
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

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mt-6"
        >
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeConfig.textSecondary}`} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${themeConfig.card} ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${themeConfig.text}`}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'high', 'medium', 'low'].map((priority) => (
              <button
                key={priority}
                onClick={() => setFilterPriority(priority)}
                className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-colors ${filterPriority === priority
                  ? `${themeConfig.primary} text-white`
                  : `${themeConfig.card} border ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} ${themeConfig.text}`
                  }`}
              >
                {priority} Priority
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex-1 p-4 md:p-6 pt-2 pb-32 md:pb-6">
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-center py-12 ${themeConfig.textSecondary} flex flex-col items-center`}
              >
                <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
                  <CheckCircle2 className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">No tasks found</p>
                <p className="text-sm">
                  {searchTerm || filterPriority !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Add a task to get started!'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddTaskModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
