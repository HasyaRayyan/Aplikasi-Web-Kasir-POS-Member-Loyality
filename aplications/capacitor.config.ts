import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myapp.otatea',
  appName: 'Otatea',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      androidSplashResourceName: 'splash',
      launchShowDuration: 2000,
      backgroundColor: "#FABA4D",
      showSpinner: false,
      androidSpinnerStyle: "small",
      iosSpinnerStyle: "small",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
