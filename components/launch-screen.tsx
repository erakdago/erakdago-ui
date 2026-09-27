import { Camera, Map, UserLocation, type LngLat } from '@maplibre/maplibre-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Free, key-less MapLibre style hosted by OpenFreeMap.
 *
 * We deliberately do not use Google Maps: it requires an API key tied to a
 * billing-enabled Google Cloud account, which is out of scope for this project.
 * OpenFreeMap serves OpenStreetMap data with no key and no signup.
 */
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/dark';

/**
 * MapLibre coordinates are `[longitude, latitude]` — the opposite of the
 * `{ latitude, longitude }` object expo-location returns, and the opposite of
 * the `[latitude, longitude]` order used in most GeoJSON examples.
 */
const ANTANANARIVO_COORDINATES: LngLat = [47.5079, -18.8792];

const INITIAL_ZOOM_LEVEL = 11;
const CAMERA_ANIMATION_DURATION_MS = 1500;
const LOCATION_ACCURACY = Location.Accuracy.High;

const SCREEN_PADDING = 24;
const BADGE_VERTICAL_OFFSET = 12;
const PROGRESS_BAR_WIDTH = 56;
const PROGRESS_BAR_HEIGHT = 4;
const PROGRESS_BAR_RADIUS = PROGRESS_BAR_HEIGHT / 2;
const PRESSED_OPACITY = 0.6;

const OVERLAY_TOP_OPACITY = 0.65;
const OVERLAY_MIDDLE_OPACITY = 0.15;
const OVERLAY_BOTTOM_OPACITY = 0.85;
const OVERLAY_STOPS = [0, 0.45, 1] as const;

const WHITE = '#FFFFFF';
const OVERLAY_COLOR = 'rgba(0, 0, 0, 1)';
const PROGRESS_TRACK_COLOR = 'rgba(255, 255, 255, 0.35)';
const CONTINUE_LABEL_COLOR = 'rgba(255, 255, 255, 0.75)';

type LaunchScreenProps = {
  /** Called when the user taps the title block, to leave the launch screen. */
  onContinue: () => void;
};

export const LaunchScreen = ({ onContinue }: LaunchScreenProps) => {
  const insets = useSafeAreaInsets();

  /**
   * `null` means "no real position": still loading, permission denied, or a
   * geolocation error. All three cases keep the Antananarivo fallback so the
   * launch screen is always usable and never blocks the user.
   */
  const [userCoordinates, setUserCoordinates] = useState<LngLat | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);

  useEffect(() => {
    const loadUserCoordinates = async (): Promise<void> => {
      try {
        const { granted } = await Location.requestForegroundPermissionsAsync();

        if (!granted) {
          // Permission denied: fall through to `finally` and stay on the
          // Antananarivo default. We deliberately do not prompt again or
          // surface an error, so the app remains fully explorable.
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: LOCATION_ACCURACY,
        });

        // Re-order expo-location's { latitude, longitude } into MapLibre's
        // [longitude, latitude] tuple.
        const coordinates: LngLat = [
          position.coords.longitude,
          position.coords.latitude,
        ];

        setUserCoordinates(coordinates);
      } catch (error) {
        // A missing GPS fix, location services disabled, or a native error must
        // never prevent the user from entering the app.
        console.warn(
          '[LaunchScreen] Geolocation unavailable, falling back to Antananarivo.',
          error,
        );
      } finally {
        // Always clear the loading state, whether we succeeded, were denied, or
        // threw — otherwise the spinner would stay up forever.
        setIsLoadingLocation(false);
      }
    };

    // `void` marks the intentionally un-awaited promise: `useEffect` cannot be
    // async, and every failure path is already handled inside.
    void loadUserCoordinates();
  }, []);

  // Recentre on the real position as soon as it arrives; `Camera` animates to
  // the new centre because `duration` is set.
  const cameraCenter = userCoordinates ?? ANTANANARIVO_COORDINATES;

  return (
    <View style={styles.container}>
      <Map mapStyle={MAP_STYLE_URL} style={StyleSheet.absoluteFill}>
        <Camera
          center={cameraCenter}
          zoom={INITIAL_ZOOM_LEVEL}
          duration={CAMERA_ANIMATION_DURATION_MS}
        />
        {/* Only rendered once we actually hold a position: MapLibre's
            UserLocation self-hides without a fix, but staying unmounted also
            keeps its internal location engine idle on the fallback path. */}
        {userCoordinates !== null && <UserLocation animated accuracy />}
      </Map>

      {/* Dark scrim: keeps the white badge and title legible over any tile
          colour. pointerEvents="none" so map gestures still pass through. */}
      <LinearGradient
        colors={[
          `rgba(0, 0, 0, ${OVERLAY_TOP_OPACITY})`,
          `rgba(0, 0, 0, ${OVERLAY_MIDDLE_OPACITY})`,
          `rgba(0, 0, 0, ${OVERLAY_BOTTOM_OPACITY})`,
        ]}
        locations={[...OVERLAY_STOPS]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.badge, { top: insets.top + BADGE_VERTICAL_OFFSET }]}>
        <Text style={styles.badgeText}>Erakdago</Text>
      </View>

      {isLoadingLocation && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={WHITE} />
        </View>
      )}

      <Pressable
        onPress={onContinue}
        accessibilityRole="button"
        accessibilityLabel="Appuyer pour continuer"
        style={({ pressed }) => [
          styles.continueBlock,
          { bottom: insets.bottom + SCREEN_PADDING },
          pressed && styles.continueBlockPressed,
        ]}>
        {/* Doubles as a loading hint: the fill completes once the position
            request has settled (granted, denied or failed). */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: isLoadingLocation ? '0%' : '100%' },
            ]}
          />
        </View>
        <Text style={styles.title}>Erak{'\n'}dago</Text>
        <Text style={styles.continueLabel}>Appuie pour continuer</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Matches the dark map style, and hides any gap while tiles stream in.
    backgroundColor: OVERLAY_COLOR,
  },
  badge: {
    position: 'absolute',
    right: SCREEN_PADDING,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: WHITE,
  },
  badgeText: {
    color: '#11181C',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBlock: {
    position: 'absolute',
    left: SCREEN_PADDING,
    alignItems: 'flex-start',
  },
  continueBlockPressed: {
    opacity: PRESSED_OPACITY,
  },
  progressTrack: {
    width: PROGRESS_BAR_WIDTH,
    height: PROGRESS_BAR_HEIGHT,
    borderRadius: PROGRESS_BAR_RADIUS,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: PROGRESS_TRACK_COLOR,
  },
  progressFill: {
    height: '100%',
    borderRadius: PROGRESS_BAR_RADIUS,
    backgroundColor: WHITE,
  },
  title: {
    color: WHITE,
    fontSize: 56,
    lineHeight: 56,
    fontWeight: '800',
    letterSpacing: -1,
  },
  continueLabel: {
    marginTop: 10,
    color: CONTINUE_LABEL_COLOR,
    fontSize: 15,
    fontWeight: '600',
  },
});
