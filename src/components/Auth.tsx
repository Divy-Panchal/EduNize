import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, School, ArrowRight, TrendingUp, CalendarDays, CheckCircle2, Sparkles, Timer, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useGrade } from '../context/GradeContext';
import toast from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';

export function Auth() {
  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth();
  const { theme, setTheme } = useTheme();
  const { setGradingSystem } = useGrade();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [activePreview, setActivePreview] = useState<'plan' | 'track' | 'ask'>('plan');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentType: 'college' as 'college' | 'school'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        await signUp(formData.email, formData.password);
        setGradingSystem(formData.studentType);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(resetEmail);
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while sending the reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const previewCards = useMemo(() => [
    {
      id: 'plan' as const,
      icon: CalendarDays,
      label: 'Plan',
      title: 'Today, organized',
      description: 'Map classes, tasks, and focus sessions into one calm study flow.',
      stat: '3 smart blocks'
    },
    {
      id: 'track' as const,
      icon: CheckCircle2,
      label: 'Track',
      title: 'Progress you can feel',
      description: 'Watch completion, study time, and grades move as you work.',
      stat: '82% momentum'
    },
    {
      id: 'ask' as const,
      icon: Sparkles,
      label: 'Ask',
      title: 'EduAI beside you',
      description: 'Turn notes into summaries, quizzes, and next actions.',
      stat: '1 tap assist'
    }
  ], []);

  const currentPreview = previewCards.find((card) => card.id === activePreview) || previewCards[0];
  const CurrentPreviewIcon = currentPreview.icon;

  const currentIllustration = !isLogin && formData.studentType === 'school' 
    ? '/school_boy_3d.png' 
    : '/boy_laptop_3d.png';

  const isDarkMode = theme === 'dark';
  const toggleTheme = () => setTheme(isDarkMode ? 'default' : 'dark');

  return (
    <div className={`min-h-screen relative overflow-hidden flex items-center justify-center p-4 lg:p-8 transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900' 
        : 'bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-200'
    }`}>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 lg:top-8 lg:right-8 z-50 p-3 rounded-full backdrop-blur-md shadow-lg hover:scale-105 transition-all bg-white/20 hover:bg-white/30 border border-white/30"
      >
        {isDarkMode ? <Sun className="w-6 h-6 text-yellow-300" /> : <Moon className="w-6 h-6 text-indigo-800" />}
      </button>
      {/* Dynamic Background Elements */}
      <motion.div
        className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-400/30 blur-[80px] z-0"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[20%] -right-[10%] w-[35vw] h-[35vw] rounded-full bg-indigo-400/30 blur-[80px] z-0"
        animate={{ scale: [1, 1.3, 1], x: [0, -60, 0], y: [0, 50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-[10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-cyan-300/30 blur-[100px] z-0"
        animate={{ scale: [1, 1.1, 1], x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Decorative floating dots - Blue theme */}
      <div className="floating-dot w-4 h-4 rounded-full bg-blue-500 top-[10%] left-[5%] animate-float-slow opacity-40 z-0" />
      <div className="floating-dot w-6 h-6 rounded-full border-2 border-blue-500 top-[8%] right-[8%] animate-pulse-slow opacity-40 z-0" />
      <div className="floating-dot w-3 h-3 rounded-full bg-indigo-500 bottom-[15%] left-[8%] animate-float-medium opacity-40 z-0" style={{ animationDelay: '0.5s' }} />
      <div className="floating-dot w-5 h-5 rounded-full border-2 border-cyan-400 bottom-[25%] right-[12%] animate-float-slow opacity-50 z-0" style={{ animationDelay: '1.5s' }} />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row w-full max-w-6xl relative z-10 shadow-2xl transition-colors duration-500 ${
          isDarkMode ? 'bg-slate-800 shadow-indigo-900/50' : 'bg-[#FFFDFB] shadow-blue-900/20'
        }`}
      >
        {/* Mobile Header with Illustration (Visible only on mobile) */}
        <div className={`lg:hidden flex flex-col items-center justify-center pt-10 pb-0 relative overflow-hidden transition-colors duration-500 ${
          isDarkMode ? 'bg-slate-900/50' : 'bg-[#DDE9F5]'
        }`}>
          <div className="absolute top-[20%] right-[15%] w-6 h-6 rounded-full bg-blue-300 opacity-60 animate-float-medium" />
          <div className="absolute top-[40%] left-[10%] w-4 h-4 rounded-full bg-indigo-300 opacity-70 animate-float-slow" style={{ animationDelay: '1s' }} />
          
          <div className="flex flex-col items-center mb-6 z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200/50 mb-2">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h2 className={`text-xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>EduNize</h2>
          </div>

          <div className="relative w-full flex justify-center h-48">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentIllustration}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={currentIllustration}
                alt="3D Student Illustration" 
                className="w-56 object-contain absolute bottom-0 z-10"
                style={{ marginBottom: '-8%' }}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Left Side - Form */}
        <div className={`lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center rounded-t-[2.5rem] lg:rounded-t-none z-20 relative transition-colors duration-500 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            <h1 className={`text-3xl lg:text-4xl font-extrabold mb-8 text-center transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {isLogin ? 'Welcome Back!!' : 'Create Account'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field (Sign Up only) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full bg-transparent border-2 rounded-full py-4 pl-12 pr-4 focus:outline-none transition-colors ${
                        isDarkMode 
                          ? 'border-slate-600 text-white focus:border-indigo-400 placeholder-slate-500' 
                          : 'border-gray-200 text-gray-700 focus:border-blue-400 placeholder-gray-400'
                      }`}
                      placeholder="Name or nickname"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full bg-transparent border-2 rounded-full py-4 pl-12 pr-4 focus:outline-none transition-colors ${
                    isDarkMode 
                      ? 'border-slate-600 text-white focus:border-indigo-400 placeholder-slate-500' 
                      : 'border-gray-200 text-gray-700 focus:border-blue-400 placeholder-gray-400'
                  }`}
                  placeholder="Email"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full bg-transparent border-2 rounded-full py-4 pl-12 pr-12 focus:outline-none transition-colors ${
                    isDarkMode 
                      ? 'border-slate-600 text-white focus:border-indigo-400 placeholder-slate-500' 
                      : 'border-gray-200 text-gray-700 focus:border-blue-400 placeholder-gray-400'
                  }`}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password (Sign Up only) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full bg-transparent border-2 rounded-full py-4 pl-12 pr-4 focus:outline-none transition-colors ${
                        isDarkMode 
                          ? 'border-slate-600 text-white focus:border-indigo-400 placeholder-slate-500' 
                          : 'border-gray-200 text-gray-700 focus:border-blue-400 placeholder-gray-400'
                      }`}
                      placeholder="Confirm password"
                      required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Student Type Selection (Sign Up only) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, studentType: 'college' })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border-2 transition-all ${
                          formData.studentType === 'college'
                            ? (isDarkMode ? 'border-indigo-500 bg-indigo-900/50 text-indigo-300' : 'border-blue-500 bg-blue-50 text-blue-700')
                            : (isDarkMode ? 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200')
                        }`}
                      >
                        <GraduationCap className="w-5 h-5" />
                        <span className="font-medium">College</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, studentType: 'school' })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border-2 transition-all ${
                          formData.studentType === 'school'
                            ? (isDarkMode ? 'border-indigo-500 bg-indigo-900/50 text-indigo-300' : 'border-blue-500 bg-blue-50 text-blue-700')
                            : (isDarkMode ? 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200')
                        }`}
                      >
                        <School className="w-5 h-5" />
                        <span className="font-medium">School</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot Password Link */}
              {isLogin && (
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-full font-bold text-lg transition-all disabled:opacity-50 mt-4 ${
                  isDarkMode 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/50' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-lg hover:shadow-blue-200/50'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${isDarkMode ? 'border-white' : 'border-blue-700'}`} />
                    <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                  </div>
                ) : (
                  <span>{isLogin ? 'Login' : 'Sign up'}</span>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            {!Capacitor.isNativePlatform() && (
              <div className="flex items-center gap-4 my-8">
                <div className={`flex-1 h-px ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>or</span>
                <div className={`flex-1 h-px ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
              </div>
            )}

            {/* Social Logins */}
            {!Capacitor.isNativePlatform() && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await signInWithGoogle();
                  } catch (error: any) {
                    toast.error(error.message || 'Failed to sign in with Google');
                  } finally {
                    setLoading(false);
                  }
                }}
                type="button"
                className={`w-full py-4 border-2 rounded-full flex items-center justify-center gap-3 transition-all font-bold mt-2 ${
                  isDarkMode 
                    ? 'border-slate-600 bg-transparent hover:bg-slate-700 hover:border-slate-500 text-white' 
                    : 'border-gray-200 bg-transparent hover:bg-gray-50 hover:border-gray-300 text-gray-700'
                }`}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </motion.button>
            )}

            {/* Toggle Login/Signup */}
            <p className={`text-center mt-8 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ name: '', email: '', password: '', confirmPassword: '', studentType: 'college' });
                }}
                className="ml-1 text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
          </motion.div>
        </div>

        {/* Right Side - Illustration (Visible only on Desktop) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-between overflow-hidden pt-12">
          
          {/* Logo & Branding - Centered at the top */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center z-20 w-full mt-4"
          >
            <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-200/60 mb-3">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h2 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>EduNize</h2>
          </motion.div>

          {/* Illustration Container */}
          <div className="relative flex-1 w-full flex items-end justify-center">
            {/* Decorative Shape */}
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
              className={`absolute bottom-0 w-[90%] h-[110%] rounded-t-[300px] z-0 transition-colors duration-500 ${
                isDarkMode ? 'bg-slate-900/50' : 'bg-[#DDE9F5]'
              }`}
            />
            {/* Floating elements inside illustration area */}
            <div className="absolute top-[30%] right-[20%] w-10 h-10 rounded-full bg-blue-300 opacity-60 animate-float-medium z-10" />
            <div className="absolute top-[50%] left-[15%] w-6 h-6 rounded-full bg-indigo-300 opacity-70 animate-float-slow z-10" style={{ animationDelay: '1s' }} />
            
            {/* Floating Feature Pills */}
            <motion.div 
              className="absolute top-[15%] left-[5%] z-30 bg-white/90 backdrop-blur-sm shadow-xl rounded-full px-4 py-2 flex items-center gap-2 border border-blue-50"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="bg-blue-100 p-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-gray-700">Task Management</span>
            </motion.div>

            <motion.div 
              className="absolute top-[35%] right-[2%] z-30 bg-white/90 backdrop-blur-sm shadow-xl rounded-full px-4 py-2 flex items-center gap-2 border border-blue-50"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div className="bg-orange-100 p-1.5 rounded-full">
                <Timer className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-sm font-bold text-gray-700">Pomodoro Timer</span>
            </motion.div>

            <motion.div 
              className="absolute bottom-[20%] left-[2%] z-30 bg-white/90 backdrop-blur-sm shadow-xl rounded-full px-4 py-2 flex items-center gap-2 border border-blue-50"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            >
              <div className="bg-indigo-100 p-1.5 rounded-full">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-sm font-bold text-gray-700">EduAI Assist</span>
            </motion.div>
            
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentIllustration}
                initial={{ y: 30, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -30, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                src={currentIllustration}
                alt="3D Student Illustration" 
                className="relative z-20 w-full max-w-[500px] object-contain"
                style={{ marginBottom: '-8%' }}
              />
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h3>
              <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleResetPassword}>
                <div className="relative mb-6">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-transparent border-2 border-gray-200 rounded-full py-3 pl-12 pr-4 text-gray-700 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-full font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </form>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center font-medium transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
