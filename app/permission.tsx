import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import { DecoColors } from '@/constants/Colors';
import { typography, spacing, chamfer, stroke, shadows } from '@/constants/theme';

export const options = {
  headerShown: false,
};

// Decorative building/skyscraper silhouette (Art Deco style)
function SkyscraperDecoration() {
  return (
    <View style={decorStyles.container}>
      {/* Central tower */}
      <View style={decorStyles.tower}>
        <View style={decorStyles.towerTop} />
        <View style={decorStyles.towerSpire} />
      </View>
      {/* Side buildings */}
      <View style={decorStyles.sideBuilding} />
      <View style={[decorStyles.sideBuilding, decorStyles.sideBuildingRight]} />
      {/* Rays behind */}
      <View style={decorStyles.raysContainer}>
        {[...Array(7)].map((_, i) => (
          <View
            key={i}
            style={[
              decorStyles.ray,
              { transform: [{ rotate: `${(i - 3) * 15}deg` }] },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const decorStyles = StyleSheet.create({
  container: {
    width: 200,
    height: 160,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: spacing.xxl,
  },
  tower: {
    width: 60,
    height: 120,
    backgroundColor: DecoColors.teal,
    alignItems: 'center',
    zIndex: 2,
  },
  towerTop: {
    position: 'absolute',
    top: -20,
    width: 40,
    height: 30,
    backgroundColor: DecoColors.teal,
  },
  towerSpire: {
    position: 'absolute',
    top: -50,
    width: 8,
    height: 40,
    backgroundColor: DecoColors.teal,
  },
  sideBuilding: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    width: 40,
    height: 80,
    backgroundColor: DecoColors.teal,
    zIndex: 1,
  },
  sideBuildingRight: {
    left: undefined,
    right: 20,
  },
  raysContainer: {
    position: 'absolute',
    bottom: 60,
    width: 200,
    height: 100,
    alignItems: 'center',
    zIndex: 0,
  },
  ray: {
    position: 'absolute',
    width: 1,
    height: 80,
    backgroundColor: DecoColors.mint,
    opacity: 0.3,
  },
});

export default function PermissionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function requestPermission() {
    setLoading(true);
    try {
      // Request photo library permission
      const { status: mediaStatus, accessPrivileges } = await MediaLibrary.requestPermissionsAsync();
      
      // Check for full or limited access (iOS 14+ limited library access)
      const hasPhotoAccess = mediaStatus === 'granted' || accessPrivileges === 'limited';
      
      if (!hasPhotoAccess) {
        Alert.alert(
          'Permission Required',
          'Photo access is needed to create your wrapped. You can enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      
      // Request location permission (needed to read GPS metadata from photos on iOS)
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (locationStatus !== 'granted') {
        // Location is optional but recommended - show a note and continue anyway
        Alert.alert(
          'Location Access',
          'Location permission helps us show your top places. Without it, place analysis will be limited.',
          [
            { 
              text: 'Continue Anyway', 
              onPress: () => router.replace('/home'),
            },
            { 
              text: 'Open Settings', 
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return;
      }
      
      router.replace('/home');
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request permission');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Corner ornaments */}
      <View style={styles.cornerTL}>
        <View style={styles.cornerInner} />
      </View>
      <View style={styles.cornerTR}>
        <View style={styles.cornerInner} />
      </View>
      <View style={styles.cornerBL}>
        <View style={styles.cornerInner} />
      </View>
      <View style={styles.cornerBR}>
        <View style={styles.cornerInner} />
      </View>

      <View style={styles.content}>
        {/* Decorative element above title */}
        <View style={styles.decorativeHeader}>
          <View style={styles.headerLine} />
          <View style={styles.headerDiamond} />
          <View style={styles.headerLine} />
        </View>

        <Text style={styles.title}>PHOTO WRAPPED</Text>
        
        {/* Decorative double line */}
        <View style={styles.doubleLine}>
          <View style={styles.lineTop} />
          <View style={styles.lineBottom} />
        </View>

        <Text style={styles.subtitle}>YOUR YEAR IN MOMENTS</Text>
        
        <Text style={styles.description}>
          We analyze photo metadata to create your personal recap.{'\n'}
          Location access is needed to show your top places.{'\n'}
          All processing happens on your device.
        </Text>

        {/* Skyscraper decoration */}
        <SkyscraperDecoration />
        
        <Pressable
          style={({ pressed: isPressed }) => [
            styles.button,
            isPressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
          onPress={requestPermission}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'REQUESTING...' : 'CONTINUE'}
          </Text>
        </Pressable>

        <Text style={styles.privacyNote}>
          Your photos never leave your device
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DecoColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  
  // Decorative header
  decorativeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerLine: {
    width: 40,
    height: 1,
    backgroundColor: DecoColors.mint,
  },
  headerDiamond: {
    width: 8,
    height: 8,
    backgroundColor: DecoColors.mint,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.md,
  },

  title: {
    ...typography.display,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  
  // Double line decoration
  doubleLine: {
    width: 120,
    marginBottom: spacing.lg,
  },
  lineTop: {
    height: 1,
    backgroundColor: DecoColors.mint,
    marginBottom: 4,
  },
  lineBottom: {
    height: 1,
    backgroundColor: DecoColors.mint,
  },

  subtitle: {
    ...typography.h3,
    color: DecoColors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  
  description: {
    ...typography.body,
    color: DecoColors.text.muted,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.xl,
  },
  
  button: {
    backgroundColor: DecoColors.mint,
    borderWidth: stroke.standard,
    borderColor: DecoColors.mint,
    borderRadius: chamfer.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.sage,
  },
  buttonPressed: {
    backgroundColor: DecoColors.mintDark,
    borderColor: DecoColors.mintDark,
  },
  buttonDisabled: {
    opacity: 0.5,
    ...shadows.subtle,
  },
  buttonText: {
    ...typography.button,
    color: DecoColors.teal,
  },

  privacyNote: {
    ...typography.caption,
    color: DecoColors.text.muted,
    opacity: 0.7,
  },
  
  // Corner ornaments - stepped Art Deco style
  cornerTL: {
    position: 'absolute',
    top: 50,
    left: 24,
    width: 32,
    height: 32,
    borderLeftWidth: stroke.standard,
    borderTopWidth: stroke.standard,
    borderColor: DecoColors.mint,
  },
  cornerTR: {
    position: 'absolute',
    top: 50,
    right: 24,
    width: 32,
    height: 32,
    borderRightWidth: stroke.standard,
    borderTopWidth: stroke.standard,
    borderColor: DecoColors.mint,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    width: 32,
    height: 32,
    borderLeftWidth: stroke.standard,
    borderBottomWidth: stroke.standard,
    borderColor: DecoColors.mint,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 50,
    right: 24,
    width: 32,
    height: 32,
    borderRightWidth: stroke.standard,
    borderBottomWidth: stroke.standard,
    borderColor: DecoColors.mint,
  },
  cornerInner: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderWidth: stroke.hairline,
    borderColor: DecoColors.stroke.subtle,
  },
});
