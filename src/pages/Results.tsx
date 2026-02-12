import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Target, BookOpen } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const gradeData = [
  { subject: 'Mathematics', grade: 92 },
  { subject: 'Physics', grade: 88 },
  { subject: 'Chemistry', grade: 85 },
  { subject: 'English', grade: 91 },
  { subject: 'History', grade: 87 },
  { subject: 'Computer Science', grade: 95 }
];

const progressData = [
  { month: 'Sep', grade: 78 },
  { month: 'Oct', grade: 82 },
  { month: 'Nov', grade: 85 },
  { month: 'Dec', grade: 88 },
  { month: 'Jan', grade: 91 }
];

const studyTimeData = [
  { name: 'Mathematics', hours: 45, color: 'hsl(var(--chart-1))' },
  { name: 'Physics', hours: 38, color: 'hsl(var(--chart-2))' },
  { name: 'Chemistry', hours: 42, color: 'hsl(var(--chart-3))' },
  { name: 'English', hours: 28, color: 'hsl(var(--chart-4))' },
  { name: 'Others', hours: 35, color: 'hsl(var(--chart-5))' }
];

export function Results() {
  const { theme, themeConfig } = useTheme();

  const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  const overallGrade = gradeData.reduce((sum, item) => sum + item.grade, 0) / gradeData.length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center sticky top-0 z-50 py-4 -mx-4 backdrop-blur-md transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-gray-50/80'
          }`}
      >
        <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text} mb-2`}>Academic Results</h1>
        <p className={themeConfig.textSecondary}>
          Track your progress and achievements
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {[
          { title: 'Overall GPA', value: '3.7', icon: Award, color: 'bg-yellow-500' },
          { title: 'Avg. Grade', value: `${Math.round(overallGrade)}%`, icon: Target, color: 'bg-blue-500' },
          { title: 'Study Hours', value: '188h', icon: BookOpen, color: 'bg-green-500' },
          { title: 'Improvement', value: '+13%', icon: TrendingUp, color: 'bg-purple-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className={`${themeConfig.card} p-3 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.color} p-2 md:p-3 rounded-lg`}>
                <stat.icon className="w-4 md:w-6 h-4 md:h-6 text-white" />
              </div>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2, type: "spring", stiffness: 200 }}
                className={`text-lg md:text-2xl font-bold ${themeConfig.text}`}
              >
                {stat.value}
              </motion.span>
            </div>
            <h3 className={`text-xs md:text-sm font-medium ${themeConfig.textSecondary}`}>
              {stat.title}
            </h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
        >
          <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text} mb-4`}>Grade Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#F9FAFB' : '#111827'
                }}
              />
              <Line type="monotone" dataKey="grade" stroke="hsl(var(--chart-1))" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
        >
          <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text} mb-4`}>Subject Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gradeData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="subject" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} tick={{ fontSize: 12 }} />
              <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#F9FAFB' : '#111827'
                }}
              />
              <Bar dataKey="grade" radius={[4, 4, 0, 0]}>
                {gradeData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
      >
        <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text} mb-4`}>Study Time Distribution</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={studyTimeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="hours">
                {studyTimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#F9FAFB' : '#111827'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            {studyTimeData.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 ${themeConfig.background} rounded-lg`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className={`font-medium ${themeConfig.text} text-sm md:text-base`}>{item.name}</span>
                </div>
                <span className={`font-semibold ${themeConfig.text} text-sm md:text-base`}>{item.hours}h</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}