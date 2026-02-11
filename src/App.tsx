import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';

import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { ExitConfirmationModal } from './components/ExitConfirmationModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { SubjectProvider } from './context/SubjectContext';
import { TimetableProvider } from './context/TimetableContext';
import { GradeProvider } from './context/GradeContext';
import { DailyStatsProvider } from './context/DailyStatsContext';
import { PomodoroProvider } from './context/PomodoroContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AchievementProvider } from './context/AchievementContext';
import { ChatHistoryProvider } from './context/ChatHistoryContext';
import { Auth } from './components/Auth';
import { DarkModeTransition } from './components/DarkModeTransition';
import { Onboarding } from './components/Onboarding';
import { ProfileSetup } from './components/ProfileSetup';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FCMService } from './services/fcmService';
import { LocalNotificationService } from './services/localNotificationService';

// Lazy load pages for better initial performance
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Subjects = lazy(() => import('./pages/Subjects').then(module => ({ default: module.Subjects })));
const SubjectDetail = lazy(() => import('./pages/SubjectDetail').then(module => ({ default: module.SubjectDetail })));
const Tasks = lazy(() => import('./pages/Tasks').then(module => ({ default: module.Tasks })));
const Timetable = lazy(() => import('./pages/Timetable').then(module => ({ default: module.Timetable })));
const PomodoroTimer = lazy(() => import('./pages/PomodoroTimer').then(module => ({ default: module.PomodoroTimer })));
const Results = lazy(() => import('./pages/Results').then(module => ({ default: module.Results })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Grades = lazy(() => import('./pages/Grades').then(module => ({ default: module.Grades })));
const EduAI = lazy(() => import('./pages/EduAI').then(module => ({ default: module.EduAI })));

// Loading component for Suspense
const PageLoader = () => {
  return (
    <div className={`flex items-center justify-center p-12 w-full h-full`}>
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.4,
};

function AppContent() {
  const { user, loading } = useAuth();
  const { themeConfig, isTransitioning, transitionTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Use refs to track state inside the event listener without re-binding
  const locationRef = useRef(location);
  const modalRef = useRef(showExitModal);

  useEffect(() => {
    locationRef.current = location;
    modalRef.current = showExitModal;
  }, [location, showExitModal]);

  useEffect(() => {
    const handleBackButton = async () => {
      const currentPath = locationRef.current.pathname;
      const isModalOpen = modalRef.current;

      if (currentPath === '/' || currentPath.startsWith('/dashboard')) {
        if (isModalOpen) {
          // Close modal if open
          setShowExitModal(false);
        } else {
          // Open modal if closed
          setShowExitModal(true);
        }
      } else {
        // Navigate to dashboard (root) if on any other page
        navigate('/');
      }
    };

    const setupListener = async () => {
      const backListener = await CapacitorApp.addListener('backButton', handleBackButton);
      return backListener;
    };

    const listenerPromise = setupListener();

    return () => {
      listenerPromise.then(handler => handler.remove());
    };
  }, [navigate]);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    // Check if user has completed profile setup
    if (user && !showOnboarding) {
      const hasCompletedProfileSetup = localStorage.getItem(`hasCompletedProfileSetup_${user.uid}`);
      if (!hasCompletedProfileSetup) {
        // New user hasn't completed profile setup
        setShowProfileSetup(true);
      }
    }
  }, [user, showOnboarding]);

  // Initialize FCM when user logs in
  useEffect(() => {
    if (user && !showOnboarding && !showProfileSetup) {
      // Request local notification permissions
      LocalNotificationService.requestPermissions();

      FCMService.initialize().then(success => {
        if (success) {
          console.log('✅ FCM initialized successfully');
        } else {
          console.log('❌ FCM initialization failed');
        }
      });
    }

    return () => {
      // Cleanup FCM listeners on unmount
      FCMService.removeAllListeners();
    };
  }, [user, showOnboarding, showProfileSetup]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleProfileSetupComplete = (data: { fullName: string; class: string; institution: string; phone: string }) => {
    if (!user) return;

    // Update userData in localStorage with user-specific key
    const userDataKey = `userData_${user.uid}`;
    const existingData = localStorage.getItem(userDataKey);
    let userData = {};
    try {
      userData = existingData ? JSON.parse(existingData) : {};
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to parse userData:', error);
      }
      userData = {};
    }

    const updatedData = {
      ...userData,
      fullName: data.fullName,
      role: 'Student',
      education: {
        institution: data.institution,
        grade: data.class,
      },
      contact: {
        email: user.email || '',
        phone: data.phone || '',
      },
    };

    localStorage.setItem(userDataKey, JSON.stringify(updatedData));
    localStorage.setItem(`hasCompletedProfileSetup_${user.uid}`, 'true');
    setShowProfileSetup(false);
  };


  if (loading) {
    return (
      <div className={`min-h-screen ${themeConfig.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={themeConfig.text}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className={`min-h-screen ${themeConfig.background} ${themeConfig.text} transition-colors duration-300`}>
      <DarkModeTransition
        isTransitioning={isTransitioning}
        transitionTheme={transitionTheme}
      />
      <AnimatePresence mode="wait">
        {showOnboarding && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Onboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!showOnboarding && showProfileSetup && (
          <motion.div
            key="profilesetup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfileSetup onComplete={handleProfileSetupComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {!showOnboarding && !showProfileSetup && (
        <div className="md:flex-row">
          <Navigation />
          <main className="flex-1 p-4 md:p-6 pb-52 safe-area-top safe-area-bottom">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="min-h-screen"
              >
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
                  <Route path="/subjects" element={<Suspense fallback={<PageLoader />}><Subjects /></Suspense>} />
                  <Route path="/subjects/:id" element={<Suspense fallback={<PageLoader />}><SubjectDetail /></Suspense>} />
                  <Route path="/tasks" element={<Suspense fallback={<PageLoader />}><Tasks /></Suspense>} />
                  <Route path="/timetable" element={<Suspense fallback={<PageLoader />}><Timetable /></Suspense>} />
                  <Route path="/grades" element={<Suspense fallback={<PageLoader />}><Grades /></Suspense>} />
                  <Route path="/pomodoro" element={<Suspense fallback={<PageLoader />}><PomodoroTimer /></Suspense>} />
                  <Route path="/results" element={<Suspense fallback={<PageLoader />}><Results /></Suspense>} />
                  <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
                  <Route path="/profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
                  <Route path="/eduai" element={<Suspense fallback={<PageLoader />}><EduAI /></Suspense>} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      )}
      <ExitConfirmationModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={() => CapacitorApp.exitApp()}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ChatHistoryProvider>
            <AchievementProvider>
              <TaskProvider>
                <SubjectProvider>
                  <TimetableProvider>
                    <GradeProvider>
                      <DailyStatsProvider>
                        <PomodoroProvider>
                          <Router>
                            <Toaster
                              position="top-right"
                              toastOptions={{
                                style: {
                                  zIndex: 10001,
                                },
                              }}
                            />
                            <AppContent />
                          </Router>
                        </PomodoroProvider>
                      </DailyStatsProvider>
                    </GradeProvider>
                  </TimetableProvider>
                </SubjectProvider>
              </TaskProvider>
            </AchievementProvider>
          </ChatHistoryProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;