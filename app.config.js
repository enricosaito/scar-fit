// app.config.js (updated)
module.exports = {
  name: "scar-fit",
  slug: "scar-fit",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "scarfit",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  owner: "enricolass",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.enricosaito.scarfit",
    infoPlist: {
      NSMicrophoneUsageDescription: "Este aplicativo usa o microfone para a função de registro de alimentos por voz.",
      NSCameraUsageDescription: "Este aplicativo usa a câmera para escanear códigos de barras de alimentos.",
      UIBackgroundModes: ["audio"],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.enricosaito.scarfit",
    permissions: ["RECORD_AUDIO", "CAMERA"],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-secure-store",
    "expo-font",
    "expo-av",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    eas: {
      projectId: "scarfit",
    },
  },
};
