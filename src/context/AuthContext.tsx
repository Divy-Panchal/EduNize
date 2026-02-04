import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';
import { RateLimiter } from '../utils/rateLimiter';
import { migrateLocalStorageToFirestore, isMigrationComplete, markMigrationComplete } from '../utils/migrateToFirestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearUserData = (userId?: string) => {
  // Clear session identifier
  localStorage.removeItem('currentUserId');

  // If userId provided, clear all user-specific data
  if (userId) {
    localStorage.removeItem(`userData_${userId}`);
    localStorage.removeItem(`hasCompletedProfileSetup_${userId}`);
    localStorage.removeItem(`grades_${userId}`);
    localStorage.removeItem(`dailyStats_${userId}`);
    localStorage.removeItem(`achievements_${userId}`);
    localStorage.removeItem(`completedTasksCount_${userId}`);
    localStorage.removeItem(`studyStreak_${userId}`);
  }

  // Clear shared data that should not persist across users
  localStorage.removeItem('eduorganize-tasks');
  localStorage.removeItem('edunize-subjects');
  localStorage.removeItem('edunize-timetable');
  localStorage.removeItem('pomodoroDurations');
  localStorage.removeItem('pomodoroSessions');
  localStorage.removeItem('pomodoroTotalMinutes');
  localStorage.removeItem('pomodoroTimerState');
  localStorage.removeItem('pomodoroLastUpdate');
  localStorage.removeItem('sampleNotificationsAdded');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const storedUserId = localStorage.getItem('currentUserId');
        if (storedUserId && storedUserId !== currentUser.uid) {
          clearUserData();
        }
        localStorage.setItem('currentUserId', currentUser.uid);

        // Auto-migrate localStorage data to Firestore on first login
        // TEMPORARILY DISABLED - Uncomment after configuring Firebase Security Rules
        /*
        if (!isMigrationComplete(currentUser.uid)) {
          console.log('🔄 First login detected, starting data migration...');
          const success = await migrateLocalStorageToFirestore(currentUser.uid);
          if (success) {
            markMigrationComplete(currentUser.uid);
            console.log('✅ Data migration completed successfully');
          } else {
            console.warn('⚠️ Data migration failed, will retry on next login');
          }
        }
        */
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      clearUserData();
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
    } catch (error: any) {
      const code = error?.code;
      const message = error?.message;
      if (code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      } else if (code === 'auth/weak-password') {
        throw new Error('The password is too weak. Please choose a stronger password (at least 6 characters).');
      }
      throw new Error(message || 'Failed to create account. Please try again.');
    }
  };

  const signIn = async (email: string, password: string) => {
    const rateLimitKey = `login_${email}`;
    const limitCheck = RateLimiter.checkLimit(rateLimitKey);

    if (!limitCheck.allowed) {
      throw new Error(
        `Too many login attempts. Please try again in ${limitCheck.remainingTime} seconds.`
      );
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      RateLimiter.reset(rateLimitKey);
      toast.success('Welcome back!');
    } catch (error: any) {
      RateLimiter.recordAttempt(rateLimitKey);
      const code = error?.code;
      const message = error?.message;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please check your credentials or create an account.');
      }
      throw new Error(message || 'Failed to sign in. Please try again.');
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Don't clear user data here - onAuthStateChanged will handle user switches properly
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Welcome! Signed in with Google successfully.');
    } catch (error: any) {
      const code = error?.code;
      const message = error?.message;

      if (code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled. Please try again.');
      } else if (code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups and try again.');
      } else if (code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with the same email address but different sign-in credentials.');
      }

      throw new Error(message || 'Failed to sign in with Google. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      clearUserData();
      await firebaseSignOut(auth);
      toast.success('Signed out successfully');
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to sign out.');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      const code = error?.code;
      if (code === 'auth/user-not-found') {
        throw new Error('No user found with this email address.');
      }
      throw new Error(error?.message || 'Failed to send reset email.');
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      logger.log('🔴 Starting account deletion process...');

      if (!user || !user.email) {
        logger.error('❌ No user is currently logged in');
        throw new Error('No user is currently logged in.');
      }

      logger.log('📧 User email:', user.email);
      logger.log('🔑 Attempting to reauthenticate user...');

      // Reauthenticate user before deletion
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      logger.log('✅ Reauthentication successful');
      logger.log('🗑️ Attempting to delete user from Firebase Authentication...');

      // Delete the user account from Firebase
      await deleteUser(user);

      logger.log('✅ User successfully deleted from Firebase Authentication');
      logger.log('🧹 Clearing local user data...');

      // Clear all user data from localStorage
      clearUserData(user.uid);

      logger.log('✅ Local data cleared successfully');
      logger.log('🎉 Account deletion completed successfully!');

      toast.success('Account deleted successfully');
    } catch (error: any) {
      const code = error?.code;
      const message = error?.message;

      logger.error('❌ Account deletion failed');
      logger.error('Error code:', code);
      logger.error('Error message:', message);
      logger.error('Full error:', error);

      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        throw new Error('Incorrect password. Please try again.');
      } else if (code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      } else if (code === 'auth/requires-recent-login') {
        throw new Error('For security reasons, please sign out and sign in again before deleting your account.');
      }

      throw new Error(message || 'Failed to delete account. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
