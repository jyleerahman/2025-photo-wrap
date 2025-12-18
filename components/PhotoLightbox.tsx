import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  StatusBar,
  FlatList,
  Text,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { DecoColors } from '@/constants/Colors';
import { spacing, stroke, typography } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PhotoLightboxProps {
  visible: boolean;
  photos: string[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoLightbox({ visible, photos, initialIndex, onClose }: PhotoLightboxProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      // Scroll to initial index after a small delay to ensure FlatList is ready
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 50);
      
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
  }, [visible, initialIndex]);

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

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (photos.length === 0) return null;

  const renderPhoto = ({ item: uri }: { item: string }) => (
    <View style={styles.photoPage}>
      <Pressable style={styles.photoTouchArea} onPress={handleClose}>
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
      </Pressable>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />
      <View style={styles.backdrop}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          {/* Art Deco corner ornaments */}
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />

          {/* Close hint */}
          <Pressable style={styles.closeHint} onPress={handleClose}>
            <View style={styles.closeHintLine} />
            <View style={styles.closeHintDiamond} />
            <View style={styles.closeHintLine} />
          </Pressable>

          {/* Photo carousel */}
          <Animated.View
            style={[
              styles.carouselContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <FlatList
              ref={flatListRef}
              data={photos}
              renderItem={renderPhoto}
              keyExtractor={(item, index) => `${item}-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              initialScrollIndex={initialIndex}
              onScrollToIndexFailed={(info) => {
                // Fallback if scroll fails
                setTimeout(() => {
                  flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
                }, 100);
              }}
            />
          </Animated.View>

          {/* Page indicator */}
          {photos.length > 1 && (
            <Animated.View style={[styles.pageIndicator, { opacity: fadeAnim }]}>
              <View style={styles.pageIndicatorLine} />
              <View style={styles.pageIndicatorContent}>
                <Text style={styles.pageIndicatorText}>
                  {currentIndex + 1} / {photos.length}
                </Text>
              </View>
              <View style={styles.pageIndicatorLine} />
            </Animated.View>
          )}

          {/* Swipe hint at bottom */}
          {photos.length > 1 && (
            <Animated.View style={[styles.swipeHint, { opacity: fadeAnim }]}>
              <View style={styles.swipeArrow} />
              <Text style={styles.swipeHintText}>SWIPE</Text>
              <View style={[styles.swipeArrow, { transform: [{ rotate: '180deg' }] }]} />
            </Animated.View>
          )}
        </Animated.View>
      </View>
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
  },
  carouselContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  photoPage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  photoTouchArea: {
    width: '100%',
    height: '100%',
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
    zIndex: 10,
    padding: spacing.md,
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

  // Page indicator
  pageIndicator: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageIndicatorLine: {
    width: 20,
    height: 1,
    backgroundColor: DecoColors.mint,
    opacity: 0.4,
  },
  pageIndicatorContent: {
    paddingHorizontal: spacing.md,
  },
  pageIndicatorText: {
    ...typography.caption,
    color: DecoColors.mint,
    letterSpacing: 2,
  },

  // Swipe hint at bottom
  swipeHint: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  swipeHintText: {
    ...typography.caption,
    color: DecoColors.text.muted,
    opacity: 0.5,
    letterSpacing: 2,
  },
  swipeArrow: {
    width: 8,
    height: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: DecoColors.mint,
    transform: [{ rotate: '-45deg' }],
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
