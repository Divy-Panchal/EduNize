import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BackButton } from '../components/BackButton';

const PrivacyPolicy: React.FC = () => {
  const { themeConfig } = useTheme();

  return (
    <div className="h-full flex flex-col overflow-y-auto pb-32">
      <Helmet>
        <title>Privacy Policy - Edunize</title>
        <meta name="description" content="Privacy Policy for Edunize study platform." />
      </Helmet>

      <div className={`sticky top-0 z-50 p-4 md:p-6 pb-2 pt-8 md:pt-12 ${themeConfig.headerBg} backdrop-blur-md transition-colors duration-200`}>
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text} mb-2`}>Privacy Policy</h1>
          <p className={themeConfig.textSecondary}>How we handle your data at Edunize</p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${themeConfig.card} p-6 rounded-2xl shadow-sm border ${themeConfig.headerBorder}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-500" />
            <h2 className={`text-xl font-bold ${themeConfig.text}`}>Our Commitment</h2>
          </div>
          <p className={`${themeConfig.textSecondary} leading-relaxed`}>
            At Edunize, we take your privacy seriously. This policy describes how we collect, use, and handle your data when you use our educational platform.
          </p>
        </motion.section>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 md:grid-cols-2"
        >
          <div className={`${themeConfig.card} p-6 rounded-2xl shadow-sm border ${themeConfig.headerBorder}`}>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-purple-500" />
              <h3 className={`font-bold ${themeConfig.text}`}>Data Collection</h3>
            </div>
            <ul className={`list-disc list-inside ${themeConfig.textSecondary} space-y-2 text-sm`}>
              <li>Basic profile info (Name, Class)</li>
              <li>Academic data (Tasks, Grades)</li>
              <li>App preferences and settings</li>
              <li>Authentication via Firebase</li>
            </ul>
          </div>

          <div className={`${themeConfig.card} p-6 rounded-2xl shadow-sm border ${themeConfig.headerBorder}`}>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-green-500" />
              <h3 className={`font-bold ${themeConfig.text}`}>Data Usage</h3>
            </div>
            <ul className={`list-disc list-inside ${themeConfig.textSecondary} space-y-2 text-sm`}>
              <li>Syncing studies across devices</li>
              <li>Personalized AI study assistance</li>
              <li>Tracking academic progress</li>
              <li>Secure account management</li>
            </ul>
          </div>
        </motion.div>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${themeConfig.card} p-6 rounded-2xl shadow-sm border ${themeConfig.headerBorder}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-amber-500" />
            <h2 className={`text-xl font-bold ${themeConfig.text}`}>Third-Party Services</h2>
          </div>
          <p className={`${themeConfig.textSecondary} mb-4 text-sm`}>
            We use industry-standard services to provide a secure and intelligent experience:
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs font-medium">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300">Firebase (Auth & Data)</div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-700 dark:text-purple-300">Google Gemini (AI)</div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">Vercel (Hosting)</div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-300">Aptoide (Distribution)</div>
          </div>
        </motion.section>

        <footer className="text-center py-8">
          <p className={`text-sm ${themeConfig.textSecondary}`}>
            Last updated: March 13, 2026. Contact support at jeetvaghela163@gmail.com for questions.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
