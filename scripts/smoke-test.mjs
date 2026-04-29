import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'src/App.tsx',
  'src/context/NotificationContext.tsx',
  'src/services/firestoreService.ts',
  'firestore.rules',
];

const missingFiles = requiredFiles.filter((file) => !existsSync(file));

if (missingFiles.length > 0) {
  console.error(`Missing required files: ${missingFiles.join(', ')}`);
  process.exit(1);
}

const appSource = readFileSync('src/App.tsx', 'utf8');

const requiredRoutes = [
  'path="/"',
  'path="/subjects"',
  'path="/tasks"',
  'path="/timetable"',
  'path="/grades"',
  'path="/pomodoro"',
  'path="/results"',
  'path="/settings"',
  'path="/profile"',
  'path="/eduai"',
];

const missingRoutes = requiredRoutes.filter((route) => !appSource.includes(route));

if (missingRoutes.length > 0) {
  console.error(`Missing expected routes: ${missingRoutes.join(', ')}`);
  process.exit(1);
}

if (!appSource.includes('<NotificationProvider>')) {
  console.error('NotificationProvider is not wired into App.tsx');
  process.exit(1);
}

console.log('Smoke test passed');
