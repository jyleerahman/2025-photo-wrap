import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { DecoColors } from '@/constants/Colors';
import { spacing, stroke } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PhotoLightboxProps {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
}

export function PhotoLightbox({ visible, uri, onClose }: PhotoLightboxProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!uri) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          {/* Art Deco corner ornaments */}
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />

          {/* Close hint */}
          <Animated.View style={[styles.closeHint, { opacity: fadeAnim }]}>
            <View style={styles.closeHintLine} />
            <View style={styles.closeHintDiamond} />
            <View style={styles.closeHintLine} />
          </Animated.View>

          {/* Photo container */}
          <Animated.View
            style={[
              styles.imageContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Photo frame */}
            <View style={styles.frame}>
              <View style={styles.frameCornerTL} />
              <View style={styles.frameCornerTR} />
              <View style={styles.frameCornerBL} />
              <View style={styles.frameCornerBR} />
              
              <ExpoImage
                source={{ uri }}
                style={styles.image}
                contentFit="contain"
              />
            </View>
          </Animated.View>

          {/* Tap to close hint at bottom */}
          <Animated.View style={[styles.tapHint, { opacity: fadeAnim }]}>
            <View style={styles.tapHintDot} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 18, 18, 0.97)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  imageContainer: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: '100%',
    height: '100%',
    padding: spacing.md,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  
  // Frame corners
  frameCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderLeftWidth: stroke.standard,
    borderTopWidth: stroke.standard,
    borderColor: DecoColors.mint,
  },
  frameCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRightWidth: stroke.standard,
    borderTopWidth: stroke.standard,
    borderColor: DecoColors.mint,
  },
  frameCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 24,
    height: 24,
    borderLeftWidth: stroke.standard,
    borderBottomWidth: stroke.standard,
    borderColor: DecoColors.mint,
  },
  frameCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRightWidth: stroke.standard,
    borderBottomWidth: stroke.standard,
    borderColor: DecoColors.mint,
  },

  // Close hint at top
  closeHint: {
    position: 'absolute',
    top: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeHintLine: {
    width: 30,
    height: 1,
    backgroundColor: DecoColors.mint,
    opacity: 0.5,
  },
  closeHintDiamond: {
    width: 8,
    height: 8,
    backgroundColor: DecoColors.mint,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.sm,
    opacity: 0.5,
  },

  // Tap hint at bottom
  tapHint: {
    position: 'absolute',
    bottom: 60,
  },
  tapHintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DecoColors.mint,
    opacity: 0.4,
  },

  // Corner ornaments for the overlay
  cornerTL: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 16,
    height: 16,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: DecoColors.stroke.subtle,
  },
  cornerTR: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 16,
    height: 16,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: DecoColors.stroke.subtle,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    width: 16,
    height: 16,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: DecoColors.stroke.subtle,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    width: 16,
    height: 16,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: DecoColors.stroke.subtle,
  },
});

