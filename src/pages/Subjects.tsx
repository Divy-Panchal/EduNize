import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, X, Calculator, FlaskConical, Globe, BookText, Palette, Dumbbell, Music, Code, Languages, TrendingUp, Microscope, Atom, Users } from 'lucide-react';
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

    if (name.includes('math') || name.includes('algebra') || name.includes('calculus') || name.includes('geometry')) {
      return Calculator;
    } else if (name.includes('chem') || name.includes('chemistry')) {
      return FlaskConical;
    } else if (name.includes('phys') || name.includes('physics')) {
      return Atom;
    } else if (name.includes('bio') || name.includes('biology')) {
      return Microscope;
    } else if (name.includes('geo') || name.includes('geography')) {
      return Globe;
    } else if (name.includes('hist') || name.includes('history')) {
      return BookText;
    } else if (name.includes('art') || name.includes('drawing') || name.includes('paint')) {
      return Palette;
    } else if (name.includes('pe') || name.includes('physical') || name.includes('sport') || name.includes('gym')) {
      return Dumbbell;
    } else if (name.includes('music') || name.includes('band') || name.includes('choir')) {
      return Music;
    } else if (name.includes('comput') || name.includes('coding') || name.includes('programming') || name.includes('it')) {
      return Code;
    } else if (name.includes('english') || name.includes('language') || name.includes('literature')) {
      return Languages;
    } else if (name.includes('hindi') || name.includes('हिंदी') || name.includes('हिन्दी')) {
      // Return a custom component for Hindi that displays the letter 'अ'
      return ({ className }: { className?: string }) => (
        <div className={`flex items-center justify-center ${className}`}>
          <span className="font-bold text-current" style={{ fontSize: '1em', lineHeight: '1' }}>अ</span>
        </div>
      );
    } else if (name.includes('econ') || name.includes('business') || name.includes('commerce')) {
      return TrendingUp;
    } else if (name.includes('social') && name.includes('science')) {
      return Users; // Users icon for Social Science
    } else if (name.includes('science')) {
      return Atom; // Atom icon for general Science
    } else {
      return BookOpen;
    }
  };

  // Function to get color based on subject name
  const getSubjectColor = (subjectName: string) => {
    const name = subjectName.toLowerCase();

    if (name.includes('math') || name.includes('algebra') || name.includes('calculus') || name.includes('geometry')) {
      return 'from-purple-500 to-purple-600'; // Purple for Math
    } else if (name.includes('chem') || name.includes('chemistry')) {
      return 'from-green-500 to-green-600'; // Green for Chemistry
    } else if (name.includes('phys') || name.includes('physics')) {
      return 'from-orange-500 to-orange-600'; // Orange for Physics
    } else if (name.includes('bio') || name.includes('biology')) {
      return 'from-emerald-500 to-emerald-600'; // Emerald for Biology
    } else if (name.includes('geo') || name.includes('geography')) {
      return 'from-cyan-500 to-cyan-600'; // Cyan for Geography
    } else if (name.includes('hist') || name.includes('history')) {
      return 'from-amber-500 to-amber-600'; // Amber for History
    } else if (name.includes('art') || name.includes('drawing') || name.includes('paint')) {
      return 'from-pink-500 to-pink-600'; // Pink for Art
    } else if (name.includes('pe') || name.includes('physical') || name.includes('sport') || name.includes('gym')) {
      return 'from-red-500 to-red-600'; // Red for PE
    } else if (name.includes('music') || name.includes('band') || name.includes('choir')) {
      return 'from-violet-500 to-violet-600'; // Violet for Music
    } else if (name.includes('comput') || name.includes('coding') || name.includes('programming') || name.includes('it')) {
      return 'from-slate-500 to-slate-600'; // Slate for Computer Science
    } else if (name.includes('english') || name.includes('language') || name.includes('literature')) {
      return 'from-rose-500 to-rose-600'; // Rose for English
    } else if (name.includes('hindi') || name.includes('हिंदी') || name.includes('हिन्दी')) {
      return 'from-lime-500 to-lime-600'; // Lime for Hindi
    } else if (name.includes('econ') || name.includes('business') || name.includes('commerce')) {
      return 'from-teal-500 to-teal-600'; // Teal for Economics
    } else if (name.includes('social') && name.includes('science')) {
      return 'from-indigo-500 to-indigo-600'; // Indigo for Social Science
    } else if (name.includes('science')) {
      return 'from-blue-500 to-blue-600'; // Blue for Science
    } else {
      // Random color for unknown subjects
      const colors = [
        'from-indigo-500 to-indigo-600',
        'from-fuchsia-500 to-fuchsia-600',
        'from-lime-500 to-lime-600',
      ];
      return colors[Math.floor(Math.random() * colors.length)];
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
    <div className="space-y-6 pb-40">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center px-4 sticky top-0 z-50 py-4 -mx-4 backdrop-blur-md transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-gray-50/80'
          }`}
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
                  className={`bg-gradient-to-r ${subject.color} rounded-2xl p-1 shadow-lg cursor-pointer`}
                  onClick={() => navigate(`/subjects/${subject.id}`)}
                >
                  <div className={`${themeConfig.card} rounded-xl p-4 h-20 flex items-center justify-between relative overflow-hidden`}>
                    {/* Background Icon */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5">
                      {React.createElement(getSubjectIcon(subject.name), { className: 'w-24 h-24' })}
                    </div>

                    <div className="relative z-10 flex items-center gap-3 flex-1">
                      {/* Subject Icon */}
                      <div className={`p-2.5 rounded-xl bg-gradient-to-r ${subject.color} shadow-md`}>
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