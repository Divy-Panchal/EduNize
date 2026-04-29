import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const { addTask } = useTask();
  const { themeConfig } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    category: '',
    image: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) {
      toast.error('Please fill in required fields');
      return;
    }

    addTask({
      title: formData.title,
      description: formData.description,
      completed: false,
      priority: formData.priority,
      dueDate: formData.dueDate,
      category: formData.category || 'General',
      image: formData.image
    });

    toast.success('Task created successfully!');
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: '',
      image: ''
    });
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`${themeConfig.card} p-6 rounded-xl shadow-xl w-full max-w-md`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${themeConfig.text}`}>Add New Task</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Close add task modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeConfig.background} ${themeConfig.text}`}
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 border ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none ${themeConfig.background} ${themeConfig.text}`}
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className={`w-full px-3 py-2 border ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeConfig.background} ${themeConfig.text}`}
                  >
                    <option value="low" className="text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800">Low</option>
                    <option value="medium" className="text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800">Medium</option>
                    <option value="high" className="text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800">High</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={`w-full px-3 py-2 border ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeConfig.background} ${themeConfig.text}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3 py-2 border ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeConfig.background} ${themeConfig.text}`}
                  placeholder="e.g., Mathematics, Physics"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                  Attach Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200" aria-label="Upload task image">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Choose file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      aria-label="Task image file input"
                    />
                  </label>
                  {formData.image && (
                    <div className="relative">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                        aria-label="Remove uploaded image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`flex-1 ${themeConfig.primary} ${themeConfig.primaryHover} text-white py-3 rounded-lg font-medium transition-colors duration-200`}
                >
                  Create Task
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className={`px-6 py-3 border ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-200'} rounded-lg font-medium ${themeConfig.text} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )
      }
    </AnimatePresence >
  );
}