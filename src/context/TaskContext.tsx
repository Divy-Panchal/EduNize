import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getTimeOfDay, updateTimeBasedAchievements, updateDailyTaskCount } from '../utils/achievementHelpers';
import { FirestoreService } from '../services/firestoreService';
import { FCMService } from '../services/fcmService';
import { LocalNotificationService } from '../services/localNotificationService';
import toast from 'react-hot-toast';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  category: string;
  image?: string;
  createdAt: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from Firestore with real-time sync
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const taskService = new FirestoreService<Task>(user.uid, 'tasks');

    // Subscribe to real-time task updates
    const unsubscribe = taskService.subscribeToCollection(
      (firestoreTasks) => {
        setTasks(firestoreTasks);
      },
      (error) => {
        console.error('Error loading tasks:', error);
        toast.error('Failed to load tasks. Please check your connection.');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);


  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) {
      toast.error('You must be logged in to add tasks');
      return;
    }

    try {
      const taskService = new FirestoreService<Task>(user.uid, 'tasks');
      const newTask: Task = {
        ...taskData,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      await taskService.setDocument(newTask.id, newTask);

      // Schedule push notification if task has a due date
      if (newTask.dueDate) {
        FCMService.scheduleTaskReminder(
          newTask.id,
          newTask.title,
          new Date(newTask.dueDate)
        );
        LocalNotificationService.scheduleTaskReminder(
          newTask.id,
          newTask.title,
          new Date(newTask.dueDate)
        );
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task. Please try again.');
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) {
      toast.error('You must be logged in to update tasks');
      return;
    }

    try {
      const taskService = new FirestoreService<Task>(user.uid, 'tasks');
      await taskService.updateDocument(id, updates);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task. Please try again.');
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete tasks');
      return;
    }

    try {
      const taskService = new FirestoreService<Task>(user.uid, 'tasks');
      await taskService.deleteDocument(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task. Please try again.');
    }
  };



  const toggleTask = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to toggle tasks');
      return;
    }

    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const wasCompleted = task.completed;
      const willBeCompleted = !wasCompleted;

      // Update completed tasks counter
      const currentCount = parseInt(localStorage.getItem(`completedTasksCount_${user.uid}`) || '0');

      if (willBeCompleted && !wasCompleted) {
        // Incrementing when completing a task
        localStorage.setItem(`completedTasksCount_${user.uid}`, (currentCount + 1).toString());

        // Track time-based achievements (Early Bird / Night Owl)
        const timeOfDay = getTimeOfDay();
        updateTimeBasedAchievements(user.uid, timeOfDay);

        // Track daily task completion (Speed Demon)
        updateDailyTaskCount(user.uid, true);
      } else if (!willBeCompleted && wasCompleted) {
        // Decrementing when uncompleting a task
        const newCount = Math.max(0, currentCount - 1); // Prevent negative counts
        localStorage.setItem(`completedTasksCount_${user.uid}`, newCount.toString());

        // Decrement daily task count
        updateDailyTaskCount(user.uid, false);
      }

      // Trigger achievement check after a short delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('checkAchievements'));
      }, 100);

      // Update task in Firestore
      const taskService = new FirestoreService<Task>(user.uid, 'tasks');
      await taskService.updateDocument(id, { completed: !task.completed });
    } catch (error) {
      console.error('Failed to toggle task:', error);
      toast.error('Failed to update task. Please try again.');
    }
  };


  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTask
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within TaskProvider');
  }
  return context;
}