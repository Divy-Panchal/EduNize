import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.edunize.app',
  appName: 'EduNize',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Keyboard: {
      resize: 'none',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
