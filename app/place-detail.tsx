import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { getPlaceClusters, hidePlace } from '@/utils/database';
import { PhotoLightbox } from '@/components/PhotoLightbox';
import type { PlaceCluster } from '@/types';
import { DecoColors } from '@/constants/Colors';
import { typography, spacing, chamfer, stroke, shadows } from '@/constants/theme';

export const options = {
  headerShown: false,
};

export default function PlaceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const placeId = params.placeId as string;
  const runId = params.runId as string;

  const [place, setPlace] = useState<PlaceCluster | null>(null);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadPlace();
  }, []);

  async function loadPlace() {
    try {
      const places = await getPlaceClusters(runId, true);
      const foundPlace = places.find((p) => p.id === placeId);
      if (foundPlace) {
        setPlace(foundPlace);
        await loadImages(foundPlace.representativeAssetIds);
      }
    } catch (error) {
      console.error('Failed to load place:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadImages(assetIds: string[]) {
    const uris: string[] = [];
    for (const assetId of assetIds) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(assetId);
        if (info.localUri) {
          uris.push(info.localUri);
        }
      } catch (error) {
        console.warn('Failed to load image:', error);
      }
    }
    setImageUris(uris);
  }

  async function handleHidePlace() {
    if (!place) return;
    await hidePlace(place.id);
    router.back();
  }

  if (loading || !place) {
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerDecor}>
            <View style={styles.headerLine} />
            <View style={styles.headerDiamond} />
            <View style={styles.headerLine} />
          </View>
          
          <Text style={styles.title}>{place.label.toUpperCase()}</Text>
          
          <View style={styles.doubleLine}>
            <View style={styles.lineTop} />
            <View style={styles.lineBottom} />
          </View>
        </View>

        {/* Stats panel */}
        <View style={styles.statsPanel}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{place.photoCount}</Text>
            <Text style={styles.statLabel}>PHOTOS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{place.distinctDaysCount}</Text>
            <Text style={styles.statLabel}>DAYS</Text>
          </View>
        </View>

        {/* Image grid with Art Deco frame */}
        <View style={styles.imageGridContainer}>
          <View style={styles.gridHeader}>
            <View style={styles.gridHeaderLine} />
            <Text style={styles.gridHeaderText}>GALLERY</Text>
            <View style={styles.gridHeaderLine} />
          </View>
          
          <View style={styles.imageGrid}>
            {imageUris.map((uri, index) => (
              <Pressable 
                key={index} 
                style={({ pressed }) => [
                  styles.imageWrapper,
                  pressed && styles.imagePressed,
                ]}
                onPress={() => setSelectedPhoto(uri)}
              >
                <ExpoImage
                  source={{ uri }}
                  style={styles.image}
                  contentFit="cover"
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable 
            style={({ pressed }) => [
              styles.button,
              styles.hideButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleHidePlace}
          >
            <Text style={styles.hideButtonText}>HIDE THIS PLACE</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.button,
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>BACK</Text>
          </Pressable>
        </View>

        {/* Bottom decoration */}
        <View style={styles.bottomDecor}>
          <View style={styles.bottomLine} />
          <View style={styles.bottomDiamond} />
          <View style={styles.bottomLine} />
        </View>
      </ScrollView>

      {/* Photo Lightbox */}
      <PhotoLightbox
        visible={selectedPhoto !== null}
        uri={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DecoColors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingTop: 80,
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

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  headerDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLine: {
    width: 30,
    height: 1,
    backgroundColor: DecoColors.mint,
  },
  headerDiamond: {
    width: 6,
    height: 6,
    backgroundColor: DecoColors.mint,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.sm,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  doubleLine: {
    width: 100,
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

  // Stats panel
  statsPanel: {
    flexDirection: 'row',
    backgroundColor: DecoColors.panel,
    borderWidth: stroke.standard,
    borderColor: DecoColors.stroke.subtle,
    borderRadius: chamfer.md,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.heroNumber,
    fontSize: 48,
    lineHeight: 56,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: DecoColors.text.muted,
    letterSpacing: 2,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: DecoColors.stroke.subtle,
    marginHorizontal: spacing.xl,
  },

  // Image grid
  imageGridContainer: {
    marginBottom: spacing.xxl,
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  gridHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: DecoColors.stroke.subtle,
  },
  gridHeaderText: {
    ...typography.caption,
    color: DecoColors.text.muted,
    letterSpacing: 2,
    marginHorizontal: spacing.md,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  imageWrapper: {
    width: '31.5%',
    aspectRatio: 1,
    borderWidth: stroke.hairline,
    borderColor: DecoColors.stroke.subtle,
    borderRadius: chamfer.sm,
    overflow: 'hidden',
  },
  imagePressed: {
    opacity: 0.7,
    borderColor: DecoColors.mint,
    borderWidth: stroke.standard,
  },
  image: {
    width: '100%',
    height: '100%',
  },

  // Actions
  actions: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  button: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: chamfer.sm,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  hideButton: {
    backgroundColor: '#5A3A3A',
    borderWidth: stroke.hairline,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hideButtonText: {
    ...typography.button,
    color: DecoColors.text.primary,
  },
  backButton: {
    backgroundColor: DecoColors.mint,
    borderWidth: stroke.standard,
    borderColor: DecoColors.mint,
    ...shadows.sage,
  },
  backButtonPressed: {
    backgroundColor: DecoColors.mintDark,
  },
  backButtonText: {
    ...typography.button,
    color: DecoColors.teal,
  },

  // Bottom decoration
  bottomDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.lg,
  },
  bottomLine: {
    width: 50,
    height: 1,
    backgroundColor: DecoColors.stroke.subtle,
  },
  bottomDiamond: {
    width: 8,
    height: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DecoColors.stroke.subtle,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.lg,
  },

  // Corner ornaments
  cornerTL: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 24,
    height: 24,
    borderLeftWidth: stroke.standard,
    borderTopWidth: stroke.standard,
    borderColor: DecoColors.mint,
    zIndex: 10,
  },
  cornerTR: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 24,
    height: 24,
    borderRightWidth: stroke.standard,
    borderTopWidth: stroke.standard,
    borderColor: DecoColors.mint,
    zIndex: 10,
  },
});
