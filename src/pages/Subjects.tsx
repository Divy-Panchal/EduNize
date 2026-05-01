import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, X, Calculator, FlaskConical, Globe, BookText, Palette, Dumbbell, Music, Code, Languages, TrendingUp, Microscope, Atom, Users, Bot, Shield, Landmark, Smartphone, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSubject } from '../context/SubjectContext';

export function Subjects() {
  const { themeConfig, theme } = useTheme();
  const { subjects, addSubject, deleteSubject } = useSubject();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  // Function to get icon based on subject name
  const getSubjectIcon = (subjectName: string) => {
    const name = subjectName.toLowerCase();

    if (/\b(ai|artificial intelligence|machine learning)\b/.test(name)) {
      return Bot;
    } else if (/\b(security|cyber|data security)\b/.test(name)) {
      return Shield;
    } else if (/\b(constitution|law|civics|legal)\b/.test(name)) {
      return Landmark;
    } else if (/\b(android|app|mobile|ios)\b/.test(name)) {
      return Smartphone;
    } else if (/\b(marketing|digital marketing|seo)\b/.test(name)) {
      return Megaphone;
    } else if (/\b(math|maths|algebra|calculus|geometry)\b/.test(name)) {
      return Calculator;
    } else if (/\b(chem|chemistry)\b/.test(name)) {
      return FlaskConical;
    } else if (/\b(phys|physics)\b/.test(name)) {
      return Atom;
    } else if (/\b(bio|biology)\b/.test(name)) {
      return Microscope;
    } else if (/\b(geo|geography)\b/.test(name)) {
      return Globe;
    } else if (/\b(hist|history)\b/.test(name)) {
      return BookText;
    } else if (/\b(art|drawing|paint|painting)\b/.test(name)) {
      return Palette;
    } else if (/\b(pe|physical|sport|gym)\b/.test(name)) {
      return Dumbbell;
    } else if (/\b(music|band|choir)\b/.test(name)) {
      return Music;
    } else if (/\b(comput|computer|coding|programming|it|cs|software|web)\b/.test(name)) {
      return Code;
    } else if (/\b(english|language|literature)\b/.test(name)) {
      return Languages;
    } else if (/\b(hindi|हिंदी|हिन्दी)\b/.test(name)) {
      return ({ className }: { className?: string }) => (
        <div className={`flex items-center justify-center ${className}`}>
          <span className="font-bold text-current" style={{ fontSize: '1em', lineHeight: '1' }}>अ</span>
        </div>
      );
    } else if (/\b(econ|economics|business|commerce|finance)\b/.test(name)) {
      return TrendingUp;
    } else if (/\bsocial science\b/.test(name)) {
      return Users;
    } else if (/\bscience\b/.test(name)) {
      return Atom;
    } else {
      return BookOpen;
    }
  };

  // Function to get color based on subject name
  const getSubjectColor = (subjectName: string) => {
    const name = subjectName.toLowerCase();

    if (/\b(ai|artificial intelligence|machine learning)\b/.test(name)) {
      return 'from-fuchsia-500 to-pink-600';
    } else if (/\b(security|cyber|data security)\b/.test(name)) {
      return 'from-slate-600 to-slate-800';
    } else if (/\b(constitution|law|civics|legal)\b/.test(name)) {
      return 'from-amber-600 to-orange-700';
    } else if (/\b(android|app|mobile|ios)\b/.test(name)) {
      return 'from-emerald-400 to-emerald-600';
    } else if (/\b(marketing|digital marketing|seo)\b/.test(name)) {
      return 'from-blue-500 to-indigo-600';
    } else if (/\b(math|maths|algebra|calculus|geometry)\b/.test(name)) {
      return 'from-purple-500 to-purple-600';
    } else if (/\b(chem|chemistry)\b/.test(name)) {
      return 'from-green-500 to-green-600';
    } else if (/\b(phys|physics)\b/.test(name)) {
      return 'from-orange-500 to-orange-600';
    } else if (/\b(bio|biology)\b/.test(name)) {
      return 'from-teal-500 to-teal-600';
    } else if (/\b(geo|geography)\b/.test(name)) {
      return 'from-cyan-500 to-cyan-600';
    } else if (/\b(hist|history)\b/.test(name)) {
      return 'from-yellow-600 to-amber-700';
    } else if (/\b(art|drawing|paint|painting)\b/.test(name)) {
      return 'from-rose-400 to-rose-600';
    } else if (/\b(pe|physical|sport|gym)\b/.test(name)) {
      return 'from-red-500 to-red-600';
    } else if (/\b(music|band|choir)\b/.test(name)) {
      return 'from-violet-500 to-violet-600';
    } else if (/\b(comput|computer|coding|programming|it|cs|software|web)\b/.test(name)) {
      return 'from-blue-600 to-blue-800';
    } else if (/\b(english|language|literature)\b/.test(name)) {
      return 'from-rose-500 to-rose-600';
    } else if (/\b(hindi|हिंदी|हिन्दी)\b/.test(name)) {
      return 'from-lime-500 to-lime-600';
    } else if (/\b(econ|economics|business|commerce|finance)\b/.test(name)) {
      return 'from-emerald-600 to-teal-700';
    } else if (/\bsocial science\b/.test(name)) {
      return 'from-indigo-500 to-indigo-600';
    } else if (/\bscience\b/.test(name)) {
      return 'from-blue-400 to-blue-600';
    } else {
      const colors = [
        'from-indigo-500 to-indigo-600',
        'from-fuchsia-500 to-fuchsia-600',
        'from-lime-500 to-lime-600',
        'from-sky-500 to-sky-600',
        'from-orange-500 to-orange-600'
      ];
      return colors[name.length % colors.length];
    }
  };

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      const subjectColor = getSubjectColor(newSubjectName.trim());
      addSubject({
        name: newSubjectName.trim(),
        color: subjectColor,
      });
      setNewSubjectName('');
      setShowAddModal(false);
    }
  };

  const handleDeleteSubject = (id: string) => {
    deleteSubject(id);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4"
      >
        <h1 className={`text-3xl font-bold ${themeConfig.text} mb-2`}>
          My Subjects
        </h1>
        <p className={`${themeConfig.textSecondary} text-sm`}>
          Add and manage your subjects
        </p>
      </motion.div>

      {/* Add Subject Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="px-4"
      >
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full rounded-2xl p-6 shadow-md border-2 border-dashed transition-all duration-300
            ${theme === 'dark'
              ? 'bg-green-900/50 border-green-700/50 hover:bg-green-900/70 hover:border-green-600 hover:shadow-green-900/30'
              : 'bg-green-50 border-green-300/50 hover:bg-green-100 hover:border-green-400 hover:shadow-green-200/50'
            } hover:shadow-lg`}
        >
          <div className="flex items-center justify-center gap-3">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-green-800/50' : 'bg-green-200/50'}`}>
              <Plus className={`w-8 h-8 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`} />
            </div>
            <div className="text-left">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-green-200' : 'text-green-800'}`}>Add New Subject</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-green-300/70' : 'text-green-600/80'}`}>Click to add your first subject</p>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Subjects List */}
      <div className="px-4 space-y-4">
        <AnimatePresence>
          {subjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${themeConfig.card} rounded-2xl p-8 text-center border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-4"
              >
                <BookOpen className={`w-16 h-16 mx-auto ${themeConfig.textSecondary}`} />
              </motion.div>
              <h3 className={`text-lg font-semibold ${themeConfig.text} mb-2`}>
                No subjects yet
              </h3>
              <p className={`${themeConfig.textSecondary} text-sm`}>
                Add your first subject to get started with your studies
              </p>
            </motion.div>
          ) : (
            subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <div
                  className={`bg-gradient-to-r ${getSubjectColor(subject.name)} rounded-2xl p-1 shadow-lg cursor-pointer`}
                  onClick={() => navigate(`/subjects/${subject.id}`)}
                >
                  <div className={`${themeConfig.card} rounded-xl p-4 h-20 flex items-center justify-between relative overflow-hidden`}>
                    {/* Background Icon */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5">
                      {React.createElement(getSubjectIcon(subject.name), { className: 'w-24 h-24' })}
                    </div>

                    <div className="relative z-10 flex items-center gap-3 flex-1">
                      {/* Subject Icon */}
                      <div className={`p-2.5 rounded-xl bg-gradient-to-r ${getSubjectColor(subject.name)} shadow-md`}>
                        {React.createElement(getSubjectIcon(subject.name), { className: 'w-6 h-6 text-white' })}
                      </div>

                      {/* Subject Name */}
                      <h3 className={`text-lg font-bold ${themeConfig.text} capitalize`}>
                        {subject.name}
                      </h3>
                    </div>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(subject.id);
                      }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="relative z-10 bg-red-500 hover:bg-red-600 p-2 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`${themeConfig.card} rounded-2xl p-6 max-w-md w-full shadow-2xl border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <h2 className={`text-2xl font-bold ${themeConfig.text} mb-4`}>
                Add New Subject
              </h2>
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                placeholder="Enter subject name"
                className={`w-full px-4 py-3 rounded-xl border-2 ${themeConfig.background} ${themeConfig.text} ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors mb-4`}
                autoFocus
              />
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowAddModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold ${themeConfig.background} ${themeConfig.text} border-2 ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleAddSubject}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all
                    ${theme === 'dark'
                      ? 'bg-green-700 hover:bg-green-600 text-green-50'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                  Add Subject
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}