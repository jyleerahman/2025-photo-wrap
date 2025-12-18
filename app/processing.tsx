import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import { scanPhotos, computeBestPlaces, computeTimeStats, reverseGeocodePlace } from '@/utils/photoAnalysis';
import { initDatabase, saveWrappedRun, savePlaceCluster, saveCardModel, getPlaceClusters, ALGORITHM_VERSION } from '@/utils/database';
import type { ProcessingStage, PhotoAccess, WrappedRun, PlaceCluster, CardModel } from '@/types';
import { DecoColors } from '@/constants/Colors';
import { typography, spacing, stroke, motion } from '@/constants/theme';

export const options = {
  headerShown: false,
};

// Animated sunburst component
function AnimatedSunburst() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[sunburstStyles.container, { transform: [{ rotate }] }]}>
      {[...Array(12)].map((_, i) => (
        <View
          key={i}
          style={[
            sunburstStyles.ray,
            { transform: [{ rotate: `${i * 30}deg` }] },
          ]}
        />
      ))}
    </Animated.View>
  );
}

const sunburstStyles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  ray: {
    position: 'absolute',
    width: 1,
    height: 80,
    backgroundColor: DecoColors.mint,
    opacity: 0.25,
  },
});

// Progress indicator with Art Deco styling
function DecoProgressIndicator({ stage }: { stage: ProcessingStage }) {
  const stages: { key: ProcessingStage; label: string }[] = [
    { key: 'scan', label: 'SCANNING' },
    { key: 'places', label: 'ANALYZING' },
    { key: 'geocode', label: 'LABELING' },
    { key: 'complete', label: 'COMPLETE' },
  ];

  const currentIndex = stages.findIndex(s => s.key === stage);

  return (
    <View style={progressStyles.container}>
      {stages.map((s, index) => (
        <View key={s.key} style={progressStyles.step}>
          <View style={[
            progressStyles.dot,
            index <= currentIndex && progressStyles.dotActive,
            index === currentIndex && progressStyles.dotCurrent,
          ]}>
            {index < currentIndex && (
              <View style={progressStyles.dotInner} />
            )}
          </View>
          {index < stages.length - 1 && (
            <View style={[
              progressStyles.line,
              index < currentIndex && progressStyles.lineActive,
            ]} />
          )}
        </View>
      ))}
    </View>
  );
}

const progressStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: stroke.hairline,
    borderColor: DecoColors.stroke.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  dotActive: {
    borderColor: DecoColors.mint,
  },
  dotCurrent: {
    backgroundColor: DecoColors.mint,
  },
  dotInner: {
    width: 6,
    height: 6,
    backgroundColor: DecoColors.mint,
  },
  line: {
    width: 40,
    height: 1,
    backgroundColor: DecoColors.stroke.subtle,
    marginHorizontal: spacing.sm,
  },
  lineActive: {
    backgroundColor: DecoColors.mint,
  },
});

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const startTime = parseInt(params.start as string);
  const endTime = parseInt(params.end as string);

  const [stage, setStage] = useState<ProcessingStage>('scan');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Animated values for text
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    processWrapped();
  }, []);

  // Animate text changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: motion.micro,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: motion.standard,
        useNativeDriver: true,
      }),
    ]).start();
  }, [progress]);

  async function processWrapped() {
    try {
      await initDatabase();

      // Check access
      const { status } = await MediaLibrary.getPermissionsAsync();
      const accessPrivileges: PhotoAccess = status === 'granted' ? 'all' : status === 'limited' ? 'limited' : 'none';

      // Stage A: Fast scan
      setStage('scan');
      setProgress('Scanning your photos...');
      const { assets, totalCount } = await scanPhotos({ start: startTime, end: endTime });

      if (totalCount === 0) {
        setError('No photos found in this time range');
        return;
      }

      setProgress(`${totalCount.toLocaleString()} photos found`);

      // Create wrapped run
      const wrappedRunId = `run_${Date.now()}`;
      const wrappedRun: WrappedRun = {
        id: wrappedRunId,
        timeRangeStart: startTime,
        timeRangeEnd: endTime,
        totalAssets: totalCount,
        locationAssets: 0,
        locationCoveragePct: 0,
        accessPrivileges,
        filtersHash: '',
        algorithmVersion: ALGORITHM_VERSION,
        createdAt: Date.now(),
      };

      // Stage B: Best Places
      setStage('places');
      setProgress('Finding your favorite places...');
      const places = await computeBestPlaces(assets, wrappedRunId);

      // Update location stats
      const actualLocationAssets = places.reduce((sum, p) => sum + p.photoCount, 0);
      wrappedRun.locationAssets = actualLocationAssets;
      wrappedRun.locationCoveragePct = totalCount > 0 ? (actualLocationAssets / totalCount) * 100 : 0;
      await saveWrappedRun(wrappedRun);

      // Save places
      for (const place of places) {
        await savePlaceCluster(place);
      }

      // Stage C: Geocode top places
      setStage('geocode');
      setProgress('Naming your places...');
      const topPlaces = places.slice(0, 10);
      for (const place of topPlaces) {
        if (place.centroidLat && place.centroidLon && place.labelConfidence === 'low') {
          try {
            const label = await reverseGeocodePlace(place.centroidLat, place.centroidLon);
            place.label = label;
            place.labelConfidence = 'medium';
            await savePlaceCluster(place);
          } catch (error) {
            console.warn('Geocoding failed for place:', error);
          }
        }
      }

      // Compute time stats
      const timeStats = computeTimeStats(assets);

      // Generate cards
      await generateCards(wrappedRunId, places, timeStats, totalCount, wrappedRun.locationCoveragePct);

      setStage('complete');
      router.replace({ pathname: '/wrapped', params: { runId: wrappedRunId } });
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process photos');
    }
  }

  async function generateCards(
    wrappedRunId: string,
    places: PlaceCluster[],
    timeStats: ReturnType<typeof computeTimeStats>,
    totalPhotos: number,
    coveragePct: number
  ) {
    const cards: CardModel[] = [];
    let order = 0;

    function selectRepresentatives(assetIds: string[], k: number): string[] {
      if (assetIds.length <= k) return assetIds;
      const selected: string[] = [];
      const n = assetIds.length;
      for (let i = 0; i < k; i++) {
        const idx = Math.floor((i * (n - 1)) / (k - 1));
        selected.push(assetIds[idx]);
      }
      return selected;
    }

    // Card 1: Title
    cards.push({
      id: `card_${order++}`,
      wrappedRunId,
      type: 'title',
      payload: { year: new Date(endTime).getFullYear() },
      renderOrder: order,
    });

    // Card 2: Trust / coverage
    const trustPhotos = selectRepresentatives(timeStats.allAssetIds, 6);
    cards.push({
      id: `card_${order++}`,
      wrappedRunId,
      type: 'trust',
      payload: { totalPhotos, coveragePct: Math.round(coveragePct), assetIds: trustPhotos },
      renderOrder: order,
    });

    // Card 3: Top Place #1
    if (places.length > 0) {
      cards.push({
        id: `card_${order++}`,
        wrappedRunId,
        type: 'topPlace1',
        payload: { place: places[0] },
        renderOrder: order,
      });
    }

    // Card 4: Top Places #2-3
    if (places.length >= 3) {
      cards.push({
        id: `card_${order++}`,
        wrappedRunId,
        type: 'topPlaces23',
        payload: { place2: places[1], place3: places[2] },
        renderOrder: order,
      });
    }

    // Card 5: Peak day
    if (timeStats.peakDay) {
      const peakDayPhotos = selectRepresentatives(timeStats.peakDay.assetIds, 6);
      cards.push({
        id: `card_${order++}`,
        wrappedRunId,
        type: 'peakDay',
        payload: {
          date: timeStats.peakDay.date.getTime(),
          count: timeStats.peakDay.count,
          assetIds: peakDayPhotos,
        },
        renderOrder: order,
      });
    }

    // Card 6: Peak month
    if (timeStats.peakMonth) {
      const peakMonthPhotos = selectRepresentatives(timeStats.peakMonth.assetIds, 6);
      cards.push({
        id: `card_${order++}`,
        wrappedRunId,
        type: 'peakMonth',
        payload: { 
          month: timeStats.peakMonth.month, 
          count: timeStats.peakMonth.count,
          assetIds: peakMonthPhotos,
        },
        renderOrder: order,
      });
    }

    // Card 7: Time of day
    if (timeStats.timeOfDay) {
      const timeOfDayPhotos = selectRepresentatives(timeStats.timeOfDay.assetIds, 6);
      cards.push({
        id: `card_${order++}`,
        wrappedRunId,
        type: 'timeOfDay',
        payload: { 
          window: timeStats.timeOfDay.window, 
          hour: timeStats.timeOfDay.hour,
          assetIds: timeOfDayPhotos,
        },
        renderOrder: order,
      });
    }

    // Card 8: Distinct places
    if (places.length > 0) {
      const distinctPlacePhotos: string[] = [];
      for (let i = 0; i < Math.min(places.length, 6); i++) {
        const place = places[i];
        if (place.representativeAssetIds.length > 0) {
          distinctPlacePhotos.push(place.representativeAssetIds[0]);
        }
      }
      cards.push({
        id: `card_${order++}`,
        wrappedRunId,
        type: 'distinctPlaces',
        payload: { count: places.length, assetIds: distinctPlacePhotos },
        renderOrder: order,
      });
    }

    // Card 9: Collage
    const collageAssets = places.length > 0 
      ? places[0].representativeAssetIds.slice(0, 9)
      : selectRepresentatives(timeStats.allAssetIds, 9);
    cards.push({
      id: `card_${order++}`,
      wrappedRunId,
      type: 'collage',
      payload: { assetIds: collageAssets },
      renderOrder: order,
    });

    // Save all cards
    for (const card of cards) {
      await saveCardModel(card);
    }
  }

  return (
    <View style={styles.container}>
      {/* Corner ornaments */}
      <View style={styles.cornerTL} />
      <View style={styles.cornerTR} />
      <View style={styles.cornerBL} />
      <View style={styles.cornerBR} />

      <View style={styles.content}>
        {/* Decorative header */}
        <View style={styles.headerDecor}>
          <View style={styles.headerLine} />
          <View style={styles.headerDiamond} />
          <View style={styles.headerLine} />
        </View>

        <Text style={styles.title}>CREATING YOUR</Text>
        <Text style={styles.titleAccent}>WRAPPED</Text>

        <View style={styles.doubleLine}>
          <View style={styles.lineTop} />
          <View style={styles.lineBottom} />
        </View>

        {/* Animated sunburst */}
        <AnimatedSunburst />

        {/* Progress indicator */}
        <DecoProgressIndicator stage={stage} />

        {/* Status text */}
        <Animated.Text style={[styles.progress, { opacity: fadeAnim }]}>
          {progress}
        </Animated.Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.error}>{error}</Text>
          </View>
        )}
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
    alignItems: 'center',
    width: '100%',
  },

  // Header decoration
  headerDecor: {
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
    ...typography.h2,
    color: DecoColors.text.muted,
    textAlign: 'center',
  },
  titleAccent: {
    ...typography.display,
    color: DecoColors.mint,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  doubleLine: {
    width: 120,
    marginBottom: spacing.xxl,
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

  progress: {
    ...typography.body,
    color: DecoColors.text.muted,
    textAlign: 'center',
  },

  errorContainer: {
    marginTop: spacing.xl,
    backgroundColor: '#6B3A3A',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 6,
  },
  error: {
    ...typography.body,
    color: DecoColors.text.primary,
    textAlign: 'center',
  },

  // Corner ornaments
  cornerTL: {
    position: 'absolute',
    top: 50,
    left: 24,
    width: 24,
    height: 24,
    borderLeftWidth: stroke.standard,
    borderTopWidth: stroke.standard,
    borderColor: DecoColors.mint,
  },
  cornerTR: {
    position: 'absolute',
    top: 50,
    right: 24,
    width: 24,
    height: 24,
    borderRightWidth: stroke.standard,
    borderTopWidth: stroke.standard,
    borderColor: DecoColors.mint,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    width: 24,
    height: 24,
    borderLeftWidth: stroke.standard,
    borderBottomWidth: stroke.standard,
    borderColor: DecoColors.mint,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 50,
    right: 24,
    width: 24,
    height: 24,
    borderRightWidth: stroke.standard,
    borderBottomWidth: stroke.standard,
    borderColor: DecoColors.mint,
  },
});
