import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Image as ImageIcon, Trash2, Check } from 'lucide-react';
import { Task } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { format } from 'date-fns';
import { ImagePreviewModal } from './ImagePreviewModal';

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, index, onToggle, onDelete }: TaskCardProps) {
  const { themeConfig } = useTheme();
  const [showImage, setShowImage] = useState(false);

  const priorityColors: { [key: string]: string } = {
    high: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
    low: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
  };

  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={`${themeConfig.card} p-6 rounded-xl shadow-sm border ${task.completed ? 'opacity-75' : ''
        } ${isOverdue
          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          : 'border-gray-100 dark:border-gray-700'
        }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`font-semibold ${themeConfig.text} ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          <p className={`text-sm ${themeConfig.textSecondary} mt-1 ${task.completed ? 'line-through' : ''}`}>
            {task.description}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggle(task.id)}
            className={`p-2 rounded-lg ${task.completed
              ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
              : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-green-900/50 dark:hover:text-green-400'
              } transition-colors duration-200`}
          >
            <Check className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {task.image && (
        <div className="mb-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative cursor-pointer"
            onClick={() => setShowImage(true)}
          >
            <img
              src={task.image}
              alt="Task attachment"
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1 text-xs ${themeConfig.textSecondary}`}>
            <Calendar className="w-3 h-3" />
            <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
              {format(new Date(task.dueDate), 'MMM dd')}
            </span>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        <span className={`text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full`}>
          {task.category}
        </span>
      </div>

      <ImagePreviewModal
        isOpen={showImage}
        onClose={() => setShowImage(false)}
        imageUrl={task.image || ''}
      />
    </motion.div>
  );
}