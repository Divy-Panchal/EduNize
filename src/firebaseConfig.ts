// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, Messaging } from "firebase/messaging";

// Validate Firebase configuration
const validateConfig = () => {
  const requiredVars = {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing Firebase environment variables:', missingVars);
    console.error('Please check your .env file and ensure all required variables are set.');
    console.error('Required variables:', Object.keys(requiredVars).join(', '));
    return false;
  }

  console.log('✅ Firebase configuration validated successfully');
  return true;
};

// Validate configuration
validateConfig();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
} catch (error: any) {
  console.error('❌ Firebase initialization failed:', error.message);
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize messaging (optional - may fail if not configured)
let messaging: Messaging | null = null;
try {
  messaging = getMessaging(app);
  console.log('✅ Firebase Messaging initialized successfully');
} catch (error: any) {
  console.warn('⚠️ Firebase Messaging initialization failed:', error.message);
  console.warn('This is optional and won\'t affect authentication. You can ignore this if you don\'t need push notifications.');
}

export { app, auth, db, messaging };
