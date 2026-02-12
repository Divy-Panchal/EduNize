import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, School, ArrowRight, BookOpen, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGrade } from '../context/GradeContext';
import toast from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';

export function Auth() {
  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth();
  const { setGradingSystem } = useGrade();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
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

  return (
    <div className="fixed inset-0 blue-background overflow-hidden">
      {/* Decorative floating dots - kept fixed */}
      <div className="floating-dot dot-white w-3 h-3 top-[10%] left-[5%] animate-float-slow" />
      <div className="floating-dot dot-outline w-4 h-4 top-[8%] left-[8%] animate-pulse-slow" />
      <div className="floating-dot dot-white w-2 h-2 top-[15%] right-[10%] animate-float-medium" />
      <div className="floating-dot dot-outline w-5 h-5 top-[20%] right-[5%] animate-float-slow" style={{ animationDelay: '1s' }} />
      <div className="floating-dot dot-filled-light w-3 h-3 bottom-[15%] left-[8%] animate-float-medium" style={{ animationDelay: '0.5s' }} />
      <div className="floating-dot dot-white w-2 h-2 bottom-[10%] right-[12%] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      <div className="floating-dot dot-outline w-3 h-3 top-[50%] left-[3%] animate-float-slow" style={{ animationDelay: '2s' }} />
      <div className="floating-dot dot-white w-2 h-2 bottom-[30%] right-[5%] animate-float-medium" style={{ animationDelay: '0.8s' }} />

      {/* Scrollable Content Wrapper */}
      <div className="h-full w-full overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="white-card rounded-2xl overflow-hidden flex flex-col lg:flex-row w-full max-w-4xl shadow-2xl relative z-10"
          >
            {/* Left Side - Illustration */}
            <div className="lg:w-1/2 bg-gradient-to-br from-blue-50 to-slate-50 p-8 lg:p-12 flex flex-col items-center justify-center relative">
              {/* App Logo & Branding */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center flex-1 flex flex-col justify-center"
              >
                {/* Logo Icon */}
                <div className="relative mb-8">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
                    <GraduationCap className="w-14 h-14 text-white" />
                  </div>
                  {/* Floating decorative elements */}
                  <div className="absolute -top-3 -right-3 w-5 h-5 bg-yellow-400 rounded-full float-object" />
                  <div className="absolute -bottom-2 -left-4 w-4 h-4 bg-green-400 rounded-full float-object float-object-delay-1" />
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-3">EduOrganize</h2>
                <p className="text-gray-500 text-base mb-10">Your intelligent study companion</p>

                {/* Feature Icons */}
                <div className="flex justify-center gap-8">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-3 float-object">
                      <BookOpen className="w-7 h-7 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Study</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-3 float-object float-object-delay-1">
                      <TrendingUp className="w-7 h-7 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Track</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-3 float-object float-object-delay-2">
                      <Target className="w-7 h-7 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Achieve</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                  {isLogin ? 'Welcome back!' : 'Create your account'}
                </h1>
                <p className="text-gray-500 mb-8">
                  {isLogin
                    ? 'Sign in to continue your learning journey.'
                    : 'Get started with unlimited study tools. Free forever.'}
                </p>

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
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="clean-input"
                          placeholder="Name or nickname"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email Field */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="clean-input"
                      placeholder="Email"
                      required
                      aria-label="Email address"
                      aria-describedby="email-description"
                    />
                    <span id="email-description" className="sr-only">Enter your email address to sign in or create an account</span>
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="clean-input pr-12"
                      placeholder="Password"
                      required
                      aria-label="Password"
                      aria-describedby="password-description"
                    />
                    <span id="password-description" className="sr-only">Enter your password (minimum 6 characters)</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="clean-input"
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
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                          I am a...
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, studentType: 'college' })}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.studentType === 'college'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                              }`}
                          >
                            <GraduationCap className="w-5 h-5" />
                            <span className="font-medium">College Student</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, studentType: 'school' })}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.studentType === 'school'
                              ? 'border-teal-500 bg-teal-50 text-teal-700'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                              }`}
                          >
                            <School className="w-5 h-5" />
                            <span className="font-medium">School Student</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Forgot Password Link */}
                  {isLogin && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-blue-500 hover:text-blue-600"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="blue-button teal-button w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      <>
                        {isLogin ? 'Sign in' : 'Sign up'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Divider - Only show on web */}
                {!Capacitor.isNativePlatform() && (
                  <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-sm">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                )}

                {/* Google Sign-In - Web Only */}
                {!Capacitor.isNativePlatform() && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
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
                    disabled={loading}
                    className="w-full py-3 px-4 border border-gray-200 rounded-full flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-gray-600 font-medium">Continue with Google</span>
                  </motion.button>
                )}

                {/* Toggle Login/Signup */}
                <p className="text-center mt-6 text-gray-500">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setFormData({ name: '', email: '', password: '', confirmPassword: '', studentType: 'college' });
                    }}
                    className="ml-1 text-blue-500 font-medium hover:text-blue-600"
                  >
                    {isLogin ? 'Sign up' : 'Login'}
                  </button>
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Forgot Password Modal */}
          <AnimatePresence>
            {showForgotPassword && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-20 bg-black/50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ y: -30, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -30, opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Reset Password</h3>
                  <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
                  <form onSubmit={handleResetPassword}>
                    <div className="relative mb-4">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="clean-input border border-gray-200 rounded-lg"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="blue-button teal-button w-full flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </form>
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center"
                  >
                    Cancel
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
