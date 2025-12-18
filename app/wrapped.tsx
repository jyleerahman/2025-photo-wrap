import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Pressable, Text, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PagerView from 'react-native-pager-view';
import { getCardModels, getPlaceClusters } from '@/utils/database';
import { CardRenderer } from '@/components/CardRenderer';
import { shareCard } from '@/utils/share';
import type { CardModel, PlaceCluster } from '@/types';
import { DecoColors } from '@/constants/Colors';
import { typography, spacing, chamfer, stroke, shadows } from '@/constants/theme';

export const options = {
  headerShown: false,
};

export default function WrappedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const runId = params.runId as string;
  
  const [cards, setCards] = useState<CardModel[]>([]);
  const [places, setPlaces] = useState<PlaceCluster[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [sharing, setSharing] = useState(false);
  const pagerRef = useRef<PagerView>(null);
  const cardRefs = useRef<Map<number, React.RefObject<View>>>(new Map());

  useEffect(() => {
    loadWrapped();
  }, []);

  async function loadWrapped() {
    try {
      const [loadedCards, loadedPlaces] = await Promise.all([
        getCardModels(runId),
        getPlaceClusters(runId),
      ]);
      setCards(loadedCards);
      setPlaces(loadedPlaces);
    } catch (error) {
      console.error('Failed to load wrapped:', error);
    }
  }

  function handlePlacePress(place: PlaceCluster) {
    router.push({
      pathname: '/place-detail',
      params: { placeId: place.id, runId },
    });
  }

  async function handleShare() {
    const ref = cardRefs.current.get(currentPage);
    if (!ref) {
      Alert.alert('Error', 'Card not ready to share');
      return;
    }

    setSharing(true);
    try {
      await shareCard(ref);
    } catch (error) {
      Alert.alert('Error', 'Failed to share card');
      console.error('Share error:', error);
    } finally {
      setSharing(false);
    }
  }

  function getCardRef(index: number): React.RefObject<View> {
    if (!cardRefs.current.has(index)) {
      cardRefs.current.set(index, React.createRef<View>());
    }
    return cardRefs.current.get(index)!;
  }

  function handleBack() {
    router.back();
  }

  if (cards.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDecor}>
            <View style={styles.decorLine} />
            <View style={styles.decorDiamond} />
            <View style={styles.decorLine} />
          </View>
          <Text style={styles.loadingText}>LOADING</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Corner ornaments */}
      <View style={styles.cornerTL} />
      <View style={styles.cornerTR} />
      
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {cards.map((card, index) => (
          <View key={card.id} ref={getCardRef(index)} style={styles.page}>
            <CardRenderer
              card={card}
              places={places}
              onPlacePress={handlePlacePress}
            />
          </View>
        ))}
      </PagerView>

      {/* Art Deco progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLine} />
        <View style={styles.progressDots}>
          {cards.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentPage && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        <View style={styles.progressLine} />
      </View>

      {/* Controls - show on last page */}
      {currentPage === cards.length - 1 && (
        <View style={styles.controls}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.buttonPrimary,
              pressed && styles.buttonPressed,
              sharing && styles.buttonDisabled,
            ]}
            onPress={handleShare}
            disabled={sharing}
          >
            <Text style={styles.buttonPrimaryText}>
              {sharing ? 'PREPARING...' : 'SHARE'}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.buttonSecondary,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleBack}
          >
            <Text style={styles.buttonSecondaryText}>BACK</Text>
          </Pressable>
        </View>
      )}

      {/* Swipe hint on first page */}
      {currentPage === 0 && (
        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>SWIPE TO EXPLORE</Text>
          <View style={styles.swipeArrows}>
            <View style={styles.swipeArrow} />
            <View style={styles.swipeArrow} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DecoColors.background,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  decorLine: {
    width: 30,
    height: 1,
    backgroundColor: DecoColors.mint,
  },
  decorDiamond: {
    width: 8,
    height: 8,
    backgroundColor: DecoColors.mint,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.md,
  },
  loadingText: {
    ...typography.h3,
    color: DecoColors.text.muted,
    letterSpacing: 4,
  },

  // Progress indicator
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  progressLine: {
    flex: 1,
    height: 1,
    backgroundColor: DecoColors.stroke.subtle,
    maxWidth: 60,
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DecoColors.stroke.subtle,
  },
  progressDotActive: {
    backgroundColor: DecoColors.mint,
    borderColor: DecoColors.mint,
  },

  // Controls
  controls: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: chamfer.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: DecoColors.mint,
    borderWidth: stroke.standard,
    borderColor: DecoColors.mint,
    ...shadows.sage,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: stroke.hairline,
    borderColor: DecoColors.stroke.subtle,
  },
  buttonPressed: {
    backgroundColor: DecoColors.mintDark,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPrimaryText: {
    ...typography.button,
    color: DecoColors.teal,
  },
  buttonSecondaryText: {
    ...typography.button,
    color: DecoColors.text.muted,
  },

  // Swipe hint
  swipeHint: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    ...typography.caption,
    color: DecoColors.text.muted,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  swipeArrows: {
    flexDirection: 'row',
    gap: 4,
  },
  swipeArrow: {
    width: 8,
    height: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: DecoColors.mint,
    transform: [{ rotate: '-45deg' }],
    opacity: 0.6,
  },

  // Corner ornaments
  cornerTL: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 20,
    height: 20,
    borderLeftWidth: stroke.standard,
    borderTopWidth: stroke.standard,
    borderColor: DecoColors.mint,
    zIndex: 10,
  },
  cornerTR: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 20,
    height: 20,
    borderRightWidth: stroke.standard,
    borderTopWidth: stroke.standard,
    borderColor: DecoColors.mint,
    zIndex: 10,
  },
});
