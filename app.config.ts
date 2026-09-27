import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * iOS permission prompt text.
 *
 * Kept as a constant because the `expo-location` config plugin writes
 * `NSLocationWhenInUseUsageDescription` itself and runs *after*
 * `ios.infoPlist`. Using the exact same string in both places makes that
 * override harmless, so the two entries can never drift apart.
 *
 * User-facing copy, so it is French to match the rest of the app UI.
 */
const LOCATION_USAGE_DESCRIPTION =
  'Erakdago utilise votre position pour vous afficher sur la carte.';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'erakdago-ui',
  slug: 'erakdago-ui',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'erakdagoui',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    // Reverse-DNS identifier, matching the `org.erakdago` namespace already
    // used by the erakdago-api Spring backend.
    bundleIdentifier: 'org.erakdago.erakdago-ui',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: LOCATION_USAGE_DESCRIPTION,
    },
  },
  android: {
    // Android package names must be valid Java identifiers, so no dashes here.
    package: 'org.erakdago.erakdagoui',
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
    [
      'expo-location',
      {
        // Only "when in use" is requested: the app never tracks the user in the
        // background, which keeps us out of the heavier iOS/Android background
        // permission scopes.
        locationWhenInUsePermission: LOCATION_USAGE_DESCRIPTION,
      },
    ],
    /**
     * Required by @maplibre/maplibre-react-native, not optional.
     *
     * It injects `$MLRN.post_install(installer)` into the Podfile, which the
     * iOS (Swift Package Manager) build needs, plus the `org.maplibre.*` Gradle
     * properties on Android. Omitting it breaks the native build.
     */
    '@maplibre/maplibre-react-native',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
