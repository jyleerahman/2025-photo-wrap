import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import { DecoColors } from '@/constants/Colors';
import { typography, spacing } from '@/constants/theme';

export const options = {
  headerShown: false,
};

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkPermission();
  }, []);

  async function checkPermission() {
    const { status } = await MediaLibrary.getPermissionsAsync();
    
    if (status === 'granted') {
      router.replace('/home');
    } else {
      router.replace('/permission');
    }
  }

  return (
    <View style={styles.container}>
      {/* Decorative corner elements */}
      <View style={styles.cornerTL} />
      <View style={styles.cornerTR} />
      <View style={styles.cornerBL} />
      <View style={styles.cornerBR} />
      
      <ActivityIndicator size="large" color={DecoColors.mint} />
      <Text style={styles.text}>LOADING</Text>
      
      {/* Decorative line under text */}
      <View style={styles.decorativeLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DecoColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: spacing.lg,
    ...typography.caption,
    letterSpacing: 4,
    color: DecoColors.text.muted,
  },
  decorativeLine: {
    width: 60,
    height: 1,
    backgroundColor: DecoColors.mint,
    marginTop: spacing.md,
    opacity: 0.6,
  },
  // Corner ornaments - Art Deco stepped corners
  cornerTL: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: DecoColors.stroke.subtle,
  },
  cornerTR: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: DecoColors.stroke.subtle,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    width: 40,
    height: 40,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: DecoColors.stroke.subtle,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: DecoColors.stroke.subtle,
  },
});
