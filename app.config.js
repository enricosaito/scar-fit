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
    buildNumber: "1.0.6",
    infoPlist: {
      NSMicrophoneUsageDescription: "Este aplicativo usa o microfone para a função de registro de alimentos por voz.",
      NSCameraUsageDescription: "Este aplicativo usa a câmera para escanear códigos de barras de alimentos.",
      UIBackgroundModes: ["audio"],
      ITSAppUsesNonExemptEncryption: false,
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ["scarfit"],
        },
      ],
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
    "expo-web-browser",
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
    eas: {
      projectId: "ae14be7e-93fd-4a33-aff7-a4ba0d1186ba",
    },
  },
};
