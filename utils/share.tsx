import React from 'react';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export async function shareCard(cardRef: React.RefObject<View>): Promise<void> {
  if (!cardRef.current) {
    throw new Error('Card ref not available');
  }

  try {
    const uri = await captureRef(cardRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri);
    } else {
      console.warn('Sharing not available');
    }
  } catch (error) {
    console.error('Failed to share card:', error);
    throw error;
  }
}

