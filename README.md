# 📚 EduNize - Your Complete Academic Companion

<div align="center">

![EduNize Logo](https://img.shields.io/badge/EduNize-Academic%20Organization-blue?style=for-the-badge)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.2.1-FFCA28?style=flat&logo=firebase)](https://firebase.google.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.4.3-119EFF?style=flat&logo=capacitor)](https://capacitorjs.com/)

**A comprehensive academic organization platform built by students, for students**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Mobile App](#-mobile-app-android) • [Documentation](#-documentation)

</div>

---

## 📖 Table of Contents

- [About](#-about-edunize)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Mobile App (Android)](#-mobile-app-android)
- [Firebase Configuration](#-firebase-configuration)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Authentication](#-authentication)
- [Key Components](#-key-components)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About EduNize

EduNize is an all-in-one academic organization platform designed to help students manage their academic life efficiently. From tracking assignments and managing timetables to organizing study materials and monitoring progress, EduNize provides everything a student needs to stay organized and succeed academically.

### Why EduNize?

- **🎓 Student-Centric Design**: Built with real student needs in mind
- **📱 Cross-Platform**: Available as web app and native Android app
- **🔄 Real-time Sync**: All your data synced across devices via Firebase
- **🎨 Beautiful UI**: Modern, intuitive interface with smooth animations
- **🔒 Secure**: Firebase Authentication with email/password and Google Sign-In
- **📊 Analytics**: Track your progress with detailed statistics and achievements
- **🤖 AI-Powered**: Integrated AI assistant (EduAI) for academic help

---

## ✨ Features

### 📅 Academic Management
- **Timetable Management**
  - Weekly and monthly calendar views
  - Color-coded classes by subject
  - Easy add/edit/delete functionality
  - Export to Google Calendar

- **Task & Assignment Tracking**
  - Create tasks with priorities (Low, Medium, High)
  - Set due dates and categories
  - Mark tasks as complete
  - Filter by status, priority, and category
  - Attach images to tasks

- **Grade Calculator**
  - Support for multiple grading systems (CGPA, GPA, Percentage)
  - Automatic grade calculations
  - Subject-wise grade tracking
  - Overall performance overview

### 📊 Progress Tracking
- **Dashboard**
  - Today's classes at a glance
  - Upcoming tasks and deadlines
  - Quick stats (completed tasks, study time, streak)
  - Recent achievements

- **Statistics**
  - Study time tracking
  - Task completion rates
  - Subject-wise performance
  - Weekly/monthly trends
  - Visual charts and graphs

- **Achievements System**
  - Unlock achievements for milestones
  - Track progress towards goals
  - Gamified learning experience
  - Multiple achievement levels

### 🎯 Study Tools
- **Pomodoro Timer**
  - Customizable work/break durations
  - Session tracking
  - Total study time counter
  - Visual circular timer
  - Manual time adjustment

- **EduAI Assistant**
  - AI-powered academic help
  - Chat history with conversations
  - Context-aware responses
  - Markdown support for formatted answers
  - Code syntax highlighting

### 👤 User Management
- **Profile System**
  - Personal information management
  - Profile picture upload
  - Academic details (institution, year, major)
  - Profile completeness tracking
  - Account deletion option

- **Settings**
  - Grading system preference
  - Theme customization
  - Notification preferences
  - Data export options

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript 5.5.3** - Type-safe JavaScript
- **Vite 6.3.5** - Build tool and dev server
- **TailwindCSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 12.23.12** - Animation library
- **React Router DOM 7.8.2** - Client-side routing
- **Lucide React 0.344.0** - Icon library

### Backend & Services
- **Firebase 12.2.1**
  - Authentication (Email/Password, Google)
  - Firestore Database
  - Cloud Storage
  - Cloud Messaging
- **Google Generative AI 0.21.0** - AI assistant integration

### Mobile
- **Capacitor 7.4.3** - Native mobile runtime
- **Capacitor Android 7.4.3** - Android platform support

### Data & State Management
- **Dexie 4.3.0** - IndexedDB wrapper for chat history
- **React Context API** - Global state management
- **Local Storage** - Client-side data persistence

### Additional Libraries
- **Recharts 3.7.0** - Charts and data visualization
- **React Hot Toast 2.6.0** - Toast notifications
- **React Markdown 10.1.0** - Markdown rendering
- **DOMPurify 3.3.1** - XSS sanitization
- **date-fns 4.1.0** - Date manipulation
- **crypto-js 4.2.0** - Encryption utilities
- **uuid 13.0.0** - Unique ID generation

---

## 📁 Project Structure

```
EduNize2-main/
├── android/                    # Android native project (Capacitor)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/edunize/app/
│   │   │   │   └── MainActivity.java
│   │   │   ├── res/
│   │   │   │   └── values/strings.xml
│   │   │   └── AndroidManifest.xml
│   │   ├── build.gradle
│   │   └── google-services.json    # Firebase Android config
│   └── build.gradle
├── src/
│   ├── components/             # React components
│   │   ├── Auth.tsx           # Authentication UI
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── Navigation.tsx     # Bottom navigation
│   │   ├── TaskCard.tsx       # Task display component
│   │   └── ... (16 components total)
│   ├── context/               # React Context providers
│   │   ├── AuthContext.tsx    # Authentication state
│   │   ├── TaskContext.tsx    # Task management
│   │   ├── GradeContext.tsx   # Grade calculations
│   │   ├── PomodoroContext.tsx # Timer state
│   │   └── ... (11 contexts total)
│   ├── pages/                 # Page components
│   │   ├── Focus.tsx          # Pomodoro timer page
│   │   ├── Grades.tsx         # Grade calculator
│   │   ├── Profile.tsx        # User profile
│   │   ├── Timetable.tsx      # Schedule management
│   │   └── ... (12 pages total)
│   ├── services/              # External services
│   │   ├── FirestoreService.ts # Firestore operations
│   │   ├── geminiService.ts    # AI integration
│   │   └── chatHistoryDB.ts    # IndexedDB for chat
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── task.ts
│   │   └── timetable.ts
│   ├── utils/                 # Utility functions
│   │   ├── logger.ts          # Logging utility
│   │   ├── rateLimiter.ts     # Rate limiting
│   │   ├── migrateToFirestore.ts # Data migration
│   │   └── ... (14 utilities total)
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # App entry point
│   ├── index.css              # Global styles
│   └── firebaseConfig.ts      # Firebase initialization
├── public/                    # Static assets
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment template
├── capacitor.config.ts        # Capacitor configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.js         # TailwindCSS config
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**
- **Firebase Account** (for backend services)
- **Android Studio** (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Divy-Panchal/EduNize2.git
   cd EduNize2-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your Firebase credentials
   # See "Environment Variables" section below
   ```

4. **Validate Firebase configuration**
   ```bash
   npm run validate-config
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 📱 Mobile App (Android)

### Setup Android Development

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK and tools

2. **Build the web app**
   ```bash
   npm run build
   ```

3. **Sync with Capacitor**
   ```bash
   npx cap sync
   ```

4. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

5. **Configure Firebase for Android**
   - Add SHA-1 fingerprint to Firebase Console
   - Download `google-services.json`
   - Place in `android/app/` directory
   - See "Firebase Configuration" section below

6. **Build and Run**
   - In Android Studio: Build → Rebuild Project
   - Connect Android device or start emulator
   - Click Run (▶️) button

### Android App Details

- **Package Name**: `com.edunize.app`
- **App Name**: EduNize
- **Minimum SDK**: 22 (Android 5.1)
- **Target SDK**: Latest
- **Permissions**: Internet, Camera (for profile pictures)

### Get SHA-1 Fingerprint

```bash
cd android
./gradlew signingReport
```

Look for the SHA-1 under "Variant: debug" → "Config: debug"

---

## 🔥 Firebase Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "EduNize")
4. Follow setup wizard

### 2. Enable Authentication

1. In Firebase Console → Authentication
2. Click "Get Started"
3. Enable sign-in methods:
   - **Email/Password** ✅
   - **Google** ✅ (optional for web)

### 3. Set up Firestore Database

1. In Firebase Console → Firestore Database
2. Click "Create database"
3. Choose production mode
4. Select region
5. Create database

### 4. Configure Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Get Firebase Config

1. Project Settings → General
2. Scroll to "Your apps"
3. Click web icon (</>) to add web app
4. Copy configuration values
5. Add to `.env` file

### 6. Android Setup

1. Project Settings → Your apps
2. Click Android icon
3. Enter package name: `com.edunize.app`
4. Add SHA-1 fingerprint (from `gradlew signingReport`)
5. Download `google-services.json`
6. Place in `android/app/`

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Generative AI (Optional - for EduAI)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting API Keys

- **Firebase**: Firebase Console → Project Settings → General
- **Gemini AI**: [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Firebase Validation
npm run validate-config  # Validate Firebase environment variables

# Capacitor (Mobile)
npx cap sync            # Sync web assets to native projects
npx cap open android    # Open Android project in Android Studio
npx cap run android     # Build and run on Android device
npx cap copy            # Copy web assets only
npx cap update          # Update Capacitor dependencies

# Icon Generation
npx capacitor-assets generate --android  # Generate app icons
```

---

## 🔑 Authentication

### Supported Methods

1. **Email/Password** (All platforms)
   - Sign up with email and password
   - Email verification
   - Password reset via email
   - Minimum password length: 6 characters

2. **Google Sign-In** (Web only)
   - One-click sign-in
   - Automatic account creation
   - Profile picture from Google account

### Authentication Flow

```
User Opens App
    ↓
Check Auth State
    ↓
Not Authenticated → Show Auth Page (Login/Signup)
    ↓
User Signs In/Up
    ↓
Firebase Authentication
    ↓
Create/Load User Profile
    ↓
Redirect to Dashboard
```

### Rate Limiting

- Login attempts: 5 per 15 minutes per email
- Prevents brute force attacks
- Automatic cooldown period

---

## 🧩 Key Components

### Context Providers

| Context | Purpose |
|---------|---------|
| `AuthContext` | User authentication state |
| `TaskContext` | Task management and CRUD operations |
| `GradeContext` | Grade calculations and storage |
| `TimetableContext` | Class schedule management |
| `PomodoroContext` | Timer state and session tracking |
| `SubjectContext` | Subject list management |
| `NotificationContext` | In-app notifications |
| `AchievementContext` | Achievement tracking |

### Main Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Overview of tasks, classes, stats |
| Tasks | `/tasks` | Task list with filters |
| Timetable | `/timetable` | Weekly/monthly schedule |
| Grades | `/grades` | Grade calculator |
| Focus | `/focus` | Pomodoro timer |
| Statistics | `/statistics` | Charts and analytics |
| Profile | `/profile` | User profile and settings |
| EduAI | `/eduai` | AI assistant chat |

### Services

- **FirestoreService**: Database operations (CRUD)
- **geminiService**: AI chat integration
- **chatHistoryDB**: IndexedDB for chat persistence

---

## 🌐 Deployment

### Web Deployment (Vercel/Netlify)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Or deploy to Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

4. **Set environment variables** in hosting platform dashboard

### Android App Distribution

1. **Generate signed APK**
   - In Android Studio: Build → Generate Signed Bundle/APK
   - Create keystore (first time only)
   - Build release APK

2. **Distribute via**
   - Google Play Store (recommended)
   - Direct APK download
   - Firebase App Distribution

---

## 🐛 Troubleshooting

### Common Issues

#### Build Errors

**Problem**: `Module not found` errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem**: TypeScript errors
```bash
# Solution: Check tsconfig.json and update types
npm install --save-dev @types/react @types/react-dom
```

#### Firebase Issues

**Problem**: "Firebase not initialized"
```bash
# Solution: Validate environment variables
npm run validate-config
```

**Problem**: "Permission denied" in Firestore
- Check Firestore security rules
- Ensure user is authenticated
- Verify userId matches document path

#### Android Build Issues

**Problem**: "google-services.json not found"
- Download from Firebase Console
- Place in `android/app/` directory
- Run `npx cap sync`

**Problem**: "SHA-1 fingerprint mismatch"
```bash
# Get correct SHA-1
cd android
./gradlew signingReport
# Add to Firebase Console
```

**Problem**: Google Sign-In shows blank screen
- This is expected on mobile (web OAuth limitation)
- Use email/password authentication instead
- Native Google Sign-In requires additional plugins

#### Performance Issues

**Problem**: Slow load times
- Enable code splitting
- Optimize images
- Use lazy loading for routes
- Check bundle size with `npm run build`

---

## 📊 Features in Detail

### Task Management

- **Create Tasks**: Title, description, due date, priority, category
- **Image Attachments**: Upload images to tasks
- **Filters**: By status, priority, category, date
- **Sorting**: By due date, priority, creation date
- **Bulk Actions**: Mark multiple as complete
- **Categories**: Assignment, Exam, Project, Reading, Other

### Timetable

- **Views**: Weekly grid, Monthly calendar
- **Color Coding**: Each subject has unique color
- **Quick Add**: Click any time slot to add class
- **Recurring Classes**: Set up weekly schedule once
- **Export**: Download as ICS file for Google Calendar
- **Notifications**: Reminders before class starts

### Grade Calculator

- **Systems Supported**:
  - CGPA (10-point scale)
  - GPA (4-point scale)
  - Percentage (0-100%)
- **Features**:
  - Add subjects with credits
  - Calculate overall grade
  - Subject-wise breakdown
  - Grade distribution chart

### Pomodoro Timer

- **Customizable Durations**:
  - Work session: 1-60 minutes
  - Short break: 1-30 minutes
  - Long break: 1-60 minutes
- **Features**:
  - Visual circular progress
  - Session counter
  - Total study time tracker
  - Manual time adjustment
  - Pause/Resume/Reset

### EduAI Assistant

- **Powered by**: Google Gemini AI
- **Features**:
  - Academic question answering
  - Code help and debugging
  - Study tips and explanations
  - Markdown formatted responses
  - Code syntax highlighting
  - Chat history persistence
  - New conversation creation

### Achievements

- **Categories**:
  - Task completion milestones
  - Study streak tracking
  - Time-based achievements
  - Special events
- **Levels**: Bronze → Silver → Gold
- **Progress Tracking**: Visual progress bars
- **Claim Rewards**: Unlock next level

---

## 🎨 Design System

### Colors

- **Primary**: Blue (#3B82F6)
- **Secondary**: Teal (#14B8A6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Background**: White/Gray gradients

### Typography

- **Font Family**: System fonts (San Francisco, Segoe UI, Roboto)
- **Headings**: Bold, larger sizes
- **Body**: Regular weight, readable sizes
- **Code**: Monospace fonts

### Components

- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Rounded, with hover effects
- **Inputs**: Clean borders, focus states
- **Animations**: Smooth transitions with Framer Motion

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with clear messages**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Contribution Guidelines

- Follow existing code style
- Write clear commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Divy Panchal** - *Initial work* - [GitHub](https://github.com/Divy-Panchal)

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Firebase for backend services
- Capacitor for mobile runtime
- Google for Gemini AI
- All open-source contributors

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Divy-Panchal/EduNize2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Divy-Panchal/EduNize2/discussions)
- **Email**: support@edunize.com (if available)

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] iOS app support
- [ ] Dark mode
- [ ] Offline mode
- [ ] Push notifications
- [ ] Study group collaboration
- [ ] File sharing
- [ ] Calendar integration
- [ ] Export data to PDF
- [ ] Multi-language support
- [ ] Voice notes
- [ ] Flashcards
- [ ] Quiz maker

---

## 📈 Project Stats

- **Total Components**: 16
- **Total Pages**: 12
- **Context Providers**: 11
- **Utility Functions**: 14
- **Dependencies**: 20+
- **Lines of Code**: 10,000+

---

<div align="center">

**Made with ❤️ by students, for students**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/Divy-Panchal/EduNize2/issues) • [Request Feature](https://github.com/Divy-Panchal/EduNize2/issues)

</div>
