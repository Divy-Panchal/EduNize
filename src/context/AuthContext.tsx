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
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
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
  localStorage.removeItem('currentUserId');

  if (userId) {
    localStorage.removeItem(`userData_${userId}`);
    localStorage.removeItem(`hasCompletedProfileSetup_${userId}`);
    localStorage.removeItem(`grades_${userId}`);
    localStorage.removeItem(`dailyStats_${userId}`);
    localStorage.removeItem(`achievements_${userId}`);
    localStorage.removeItem(`completedTasksCount_${userId}`);
    localStorage.removeItem(`studyStreak_${userId}`);
  }

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
    // 🔥 IMPORTANT FIX FOR CAPACITOR WEBVIEW
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const storedUserId = localStorage.getItem('currentUserId');
        if (storedUserId && storedUserId !== currentUser.uid) {
          clearUserData();
        }
        localStorage.setItem('currentUserId', currentUser.uid);
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

      if (code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists.');
      } else if (code === 'auth/weak-password') {
        throw new Error('Password must be at least 6 characters.');
      }

      throw new Error(error?.message || 'Failed to create account.');
    }
  };

  const signIn = async (email: string, password: string) => {
    const rateLimitKey = `login_${email}`;
    const limitCheck = RateLimiter.checkLimit(rateLimitKey);

    if (!limitCheck.allowed) {
      throw new Error(
        `Too many login attempts. Try again in ${limitCheck.remainingTime} seconds.`
      );
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      RateLimiter.reset(rateLimitKey);
      toast.success('Welcome back!');
    } catch (error: any) {
      RateLimiter.recordAttempt(rateLimitKey);
      throw new Error('Invalid email or password.');
    }
  };

  // ✅ FINAL WORKING GOOGLE LOGIN (NO REDIRECT)
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account"
      });

      await signInWithPopup(auth, provider);

      toast.success("Signed in with Google!");
    } catch (error) {
      console.error("Google Sign-In error:", error);
      toast.error("Google Sign-In failed");
      throw error;
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
      toast.success('Password reset email sent!');
    } catch (error: any) {
      const code = error?.code;

      if (code === 'auth/user-not-found') {
        throw new Error('No user found with this email.');
      }

      throw new Error(error?.message || 'Failed to send reset email.');
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      if (!user || !user.email) {
        throw new Error('No user is currently logged in.');
      }

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);

      clearUserData(user.uid);
      toast.success('Account deleted successfully');
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to delete account.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        deleteAccount
      }}
    >
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
