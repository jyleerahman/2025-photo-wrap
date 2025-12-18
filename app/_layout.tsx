import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Limelight_400Regular } from '@expo-google-fonts/limelight';
import { PoiretOne_400Regular } from '@expo-google-fonts/poiret-one';
import { DecoColors } from '@/constants/Colors';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Limelight for titles (bold marquee Art Deco display)
    'Limelight-Regular': Limelight_400Regular,
    // Poiret One for content (elegant geometric)
    'PoiretOne-Regular': PoiretOne_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DecoColors.mint} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: DecoColors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="permission" />
      <Stack.Screen name="home" />
      <Stack.Screen name="processing" />
      <Stack.Screen name="wrapped" />
      <Stack.Screen name="place-detail" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: DecoColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
