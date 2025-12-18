import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import type { CardModel, PlaceCluster } from '@/types';
import { DecoColors } from '@/constants/Colors';
import { typography, spacing, chamfer, stroke, shadows } from '@/constants/theme';
import { formatDate } from '@/utils/timeRanges';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CardProps {
  card: CardModel;
  places?: PlaceCluster[];
  onPlacePress?: (place: PlaceCluster) => void;
}

// ============================================================================
// DECORATIVE COMPONENTS
// ============================================================================

function CardFrame({ children, accentColor = DecoColors.gold }: { children: React.ReactNode; accentColor?: string }) {
  return (
    <View style={frameStyles.outer}>
      {/* Corner ornaments */}
      <View style={[frameStyles.cornerTL, { borderColor: accentColor }]} />
      <View style={[frameStyles.cornerTR, { borderColor: accentColor }]} />
      <View style={[frameStyles.cornerBL, { borderColor: accentColor }]} />
      <View style={[frameStyles.cornerBR, { borderColor: accentColor }]} />
      
      {/* Inner content frame */}
      <View style={frameStyles.inner}>
        {children}
      </View>
    </View>
  );
}

const frameStyles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: DecoColors.panel,
    borderWidth: stroke.standard,
    borderColor: DecoColors.stroke.subtle,
    borderRadius: chamfer.md,
    padding: spacing.lg,
    position: 'relative',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  cornerTL: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 20,
    height: 20,
    borderLeftWidth: stroke.standard,
    borderTopWidth: stroke.standard,
  },
  cornerTR: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRightWidth: stroke.standard,
    borderTopWidth: stroke.standard,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 20,
    height: 20,
    borderLeftWidth: stroke.standard,
    borderBottomWidth: stroke.standard,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRightWidth: stroke.standard,
    borderBottomWidth: stroke.standard,
  },
});

function DecorativeDivider({ width = 100 }: { width?: number }) {
  return (
    <View style={[dividerStyles.container, { width }]}>
      <View style={dividerStyles.lineTop} />
      <View style={dividerStyles.lineBottom} />
    </View>
  );
}

const dividerStyles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: spacing.lg,
  },
  lineTop: {
    height: 1,
    backgroundColor: DecoColors.gold,
    marginBottom: 4,
  },
  lineBottom: {
    height: 1,
    backgroundColor: DecoColors.gold,
  },
});

function DecorativeHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.decor}>
        <View style={headerStyles.line} />
        <View style={headerStyles.diamond} />
        <View style={headerStyles.line} />
      </View>
      {subtitle && <Text style={headerStyles.subtitle}>{subtitle}</Text>}
      {title && <Text style={headerStyles.title}>{title}</Text>}
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  decor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  line: {
    width: 30,
    height: 1,
    backgroundColor: DecoColors.gold,
  },
  diamond: {
    width: 6,
    height: 6,
    backgroundColor: DecoColors.gold,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.sm,
  },
  subtitle: {
    ...typography.caption,
    color: DecoColors.text.muted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: DecoColors.text.primary,
    textAlign: 'center',
  },
});

// Sunburst background decoration
function SunburstBackground({ opacity = 0.1 }: { opacity?: number }) {
  return (
    <View style={[sunburstStyles.container, { opacity }]}>
      {[...Array(16)].map((_, i) => (
        <View
          key={i}
          style={[
            sunburstStyles.ray,
            { transform: [{ rotate: `${i * 22.5}deg` }] },
          ]}
        />
      ))}
    </View>
  );
}

const sunburstStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    width: 1,
    height: 150,
    backgroundColor: DecoColors.gold,
  },
});

// ============================================================================
// CARD COMPONENTS
// ============================================================================

export function TitleCard({ card }: CardProps) {
  const year = card.payload.year;
  return (
    <CardFrame>
      <SunburstBackground opacity={0.15} />
      
      <View style={titleStyles.content}>
        <DecorativeHeader />
        
        <Text style={titleStyles.preTitle}>YOUR</Text>
        <Text style={titleStyles.mainTitle}>PHOTO</Text>
        <Text style={titleStyles.mainTitle}>WRAPPED</Text>
        
        <DecorativeDivider width={120} />
        
        <Text style={titleStyles.year}>{year}</Text>
        
        <View style={titleStyles.bottomDecor}>
          <View style={titleStyles.bottomLine} />
          <View style={titleStyles.bottomDiamond} />
          <View style={titleStyles.bottomLine} />
        </View>
      </View>
    </CardFrame>
  );
}

const titleStyles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  preTitle: {
    ...typography.h3,
    color: DecoColors.text.muted,
    marginBottom: spacing.xs,
  },
  mainTitle: {
    ...typography.display,
    color: DecoColors.gold,
    lineHeight: 52,
  },
  year: {
    ...typography.heroNumber,
    marginTop: spacing.lg,
  },
  bottomDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  bottomLine: {
    width: 40,
    height: 1,
    backgroundColor: DecoColors.stroke.subtle,
  },
  bottomDiamond: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: DecoColors.stroke.subtle,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.md,
  },
});

export function TrustCard({ card }: CardProps) {
  const { totalPhotos, coveragePct, assetIds = [] } = card.payload;
  const [uris, setUris] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    const loaded: string[] = [];
    for (const assetId of assetIds.slice(0, 6)) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(assetId);
        if (info.localUri) {
          loaded.push(info.localUri);
        }
      } catch (error) {
        console.warn('Failed to load image:', error);
      }
    }
    setUris(loaded);
  }

  return (
    <CardFrame>
      <View style={trustStyles.content}>
        <DecorativeHeader subtitle="THIS YEAR" title="YOU CAPTURED" />
        
        <Text style={trustStyles.heroNumber}>{totalPhotos.toLocaleString()}</Text>
        <Text style={trustStyles.heroLabel}>MOMENTS</Text>
        
        <DecorativeDivider width={80} />
        
        <Text style={trustStyles.coverage}>
          {coveragePct}% with location data
        </Text>
        
        {uris.length > 0 && (
          <View style={trustStyles.photoGrid}>
            {uris.map((uri, index) => (
              <View key={index} style={trustStyles.photoWrapper}>
                <ExpoImage
                  source={{ uri }}
                  style={trustStyles.photo}
                  contentFit="cover"
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </CardFrame>
  );
}

const trustStyles = StyleSheet.create({
  content: {
    alignItems: 'center',
    width: '100%',
  },
  heroNumber: {
    ...typography.heroNumber,
    fontSize: 80,
    lineHeight: 88,
  },
  heroLabel: {
    ...typography.h2,
    color: DecoColors.text.muted,
    marginTop: spacing.xs,
  },
  coverage: {
    ...typography.small,
    color: DecoColors.text.muted,
    marginBottom: spacing.xl,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  photoWrapper: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: stroke.hairline,
    borderColor: DecoColors.stroke.subtle,
    borderRadius: chamfer.sm,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});

export function TopPlace1Card({ card, onPlacePress }: CardProps) {
  const place: PlaceCluster = card.payload.place;
  const [previewUri, setPreviewUri] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadPreview();
  }, []);

  async function loadPreview() {
    if (place.representativeAssetIds.length > 0) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(place.representativeAssetIds[0]);
        if (info.localUri) {
          setPreviewUri(info.localUri);
        }
      } catch (error) {
        console.warn('Failed to load preview:', error);
      }
    }
  }

  return (
    <CardFrame accentColor={DecoColors.gold}>
      <View style={topPlace1Styles.content}>
        <DecorativeHeader subtitle="YOUR #1 PLACE" />
        
        <Text style={topPlace1Styles.placeName}>{place.label.toUpperCase()}</Text>
        
        <DecorativeDivider width={100} />
        
        <View style={topPlace1Styles.statsRow}>
          <View style={topPlace1Styles.stat}>
            <Text style={topPlace1Styles.statNumber}>{place.photoCount}</Text>
            <Text style={topPlace1Styles.statLabel}>PHOTOS</Text>
          </View>
          <View style={topPlace1Styles.statDivider} />
          <View style={topPlace1Styles.stat}>
            <Text style={topPlace1Styles.statNumber}>{place.distinctDaysCount}</Text>
            <Text style={topPlace1Styles.statLabel}>DAYS</Text>
          </View>
        </View>
        
        {previewUri && (
          <View style={topPlace1Styles.imageFrame}>
            <ExpoImage
              source={{ uri: previewUri }}
              style={topPlace1Styles.image}
              contentFit="cover"
            />
          </View>
        )}
      </View>
    </CardFrame>
  );
}

const topPlace1Styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    width: '100%',
  },
  placeName: {
    ...typography.h1,
    color: DecoColors.gold,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statNumber: {
    ...typography.heroNumber,
    fontSize: 36,
    lineHeight: 44,
  },
  statLabel: {
    ...typography.caption,
    color: DecoColors.text.muted,
    letterSpacing: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: DecoColors.stroke.subtle,
  },
  imageFrame: {
    width: '80%',
    aspectRatio: 1,
    borderWidth: stroke.standard,
    borderColor: DecoColors.gold,
    borderRadius: chamfer.sm,
    overflow: 'hidden',
    ...shadows.gold,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export function TopPlaces23Card({ card }: CardProps) {
  const { place2, place3 } = card.payload;
  const [place2Uris, setPlace2Uris] = React.useState<string[]>([]);
  const [place3Uris, setPlace3Uris] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    // Load photos for place 2
    const loaded2: string[] = [];
    for (const assetId of place2.representativeAssetIds.slice(0, 2)) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(assetId);
        if (info.localUri) {
          loaded2.push(info.localUri);
        }
      } catch (error) {
        console.warn('Failed to load image:', error);
      }
    }
    setPlace2Uris(loaded2);

    // Load photos for place 3
    const loaded3: string[] = [];
    for (const assetId of place3.representativeAssetIds.slice(0, 2)) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(assetId);
        if (info.localUri) {
          loaded3.push(info.localUri);
        }
      } catch (error) {
        console.warn('Failed to load image:', error);
      }
    }
    setPlace3Uris(loaded3);
  }

  return (
    <CardFrame>
      <View style={places23Styles.content}>
        <DecorativeHeader subtitle="ALSO LOVED" title="TOP SPOTS" />
        
        {/* Place 2 */}
        <View style={places23Styles.placeCard}>
          <View style={places23Styles.placeHeader}>
            <View style={places23Styles.rankBadge}>
              <Text style={places23Styles.rankText}>#2</Text>
            </View>
            <View style={places23Styles.placeInfo}>
              <Text style={places23Styles.placeName}>{place2.label.toUpperCase()}</Text>
              <Text style={places23Styles.placeStats}>{place2.photoCount} photos</Text>
            </View>
          </View>
          {place2Uris.length > 0 && (
            <View style={places23Styles.placePhotos}>
              {place2Uris.map((uri, index) => (
                <View key={index} style={places23Styles.photoWrapper}>
                  <ExpoImage source={{ uri }} style={places23Styles.photo} contentFit="cover" />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={places23Styles.divider} />

        {/* Place 3 */}
        <View style={places23Styles.placeCard}>
          <View style={places23Styles.placeHeader}>
            <View style={places23Styles.rankBadge}>
              <Text style={places23Styles.rankText}>#3</Text>
            </View>
            <View style={places23Styles.placeInfo}>
              <Text style={places23Styles.placeName}>{place3.label.toUpperCase()}</Text>
              <Text style={places23Styles.placeStats}>{place3.photoCount} photos</Text>
            </View>
          </View>
          {place3Uris.length > 0 && (
            <View style={places23Styles.placePhotos}>
              {place3Uris.map((uri, index) => (
                <View key={index} style={places23Styles.photoWrapper}>
                  <ExpoImage source={{ uri }} style={places23Styles.photo} contentFit="cover" />
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </CardFrame>
  );
}

const places23Styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  placeCard: {
    backgroundColor: DecoColors.background,
    borderWidth: stroke.hairline,
    borderColor: DecoColors.stroke.subtle,
    borderRadius: chamfer.sm,
    padding: spacing.lg,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rankBadge: {
    width: 32,
    height: 32,
    backgroundColor: DecoColors.gold,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    ...typography.caption,
    fontWeight: '600',
    color: DecoColors.background,
    transform: [{ rotate: '-45deg' }],
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    ...typography.h3,
    fontSize: 16,
    color: DecoColors.text.primary,
  },
  placeStats: {
    ...typography.caption,
    color: DecoColors.text.muted,
  },
  placePhotos: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoWrapper: {
    flex: 1,
    aspectRatio: 1.2,
    borderRadius: chamfer.sm,
    overflow: 'hidden',
    borderWidth: stroke.hairline,
    borderColor: DecoColors.stroke.subtle,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: DecoColors.stroke.subtle,
    marginVertical: spacing.lg,
  },
});

export function PeakDayCard({ card }: CardProps) {
  const { date, count, assetIds = [] } = card.payload;
  const dateStr = formatDate(new Date(date));
  const [uris, setUris] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    const loaded: string[] = [];
    for (const assetId of assetIds.slice(0, 6)) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(assetId);
        if (info.localUri) {
          loaded.push(info.localUri);
        }
      } catch (error) {
        console.warn('Failed to load image:', error);
      }
    }
    setUris(loaded);
  }

  return (
    <CardFrame accentColor={DecoColors.emerald}>
      <View style={peakDayStyles.content}>
        <DecorativeHeader subtitle="YOUR BIGGEST DAY" />
        
        <Text style={peakDayStyles.heroNumber}>{count}</Text>
        <Text style={peakDayStyles.heroLabel}>PHOTOS</Text>
        
        <DecorativeDivider width={80} />
        
        <Text style={peakDayStyles.date}>{dateStr.toUpperCase()}</Text>
        
        {uris.length > 0 && (
          <View style={peakDayStyles.photoGrid}>
            {uris.map((uri, index) => (
              <View key={index} style={peakDayStyles.photoWrapper}>
                <ExpoImage source={{ uri }} style={peakDayStyles.photo} contentFit="cover" />
              </View>
            ))}
          </View>
        )}
      </View>
    </CardFrame>
  );
}

const peakDayStyles = StyleSheet.create({
  content: {
    alignItems: 'center',
    width: '100%',
  },
  heroNumber: {
    ...typography.heroNumber,
    color: DecoColors.emerald,
  },
  heroLabel: {
    ...typography.h3,
    color: DecoColors.text.muted,
  },
  date: {
    ...typography.bodyMedium,
    color: DecoColors.text.primary,
    letterSpacing: 1,
    marginBottom: spacing.xl,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  photoWrapper: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: chamfer.sm,
    overflow: 'hidden',
    borderWidth: stroke.hairline,
    borderColor: DecoColors.stroke.subtle,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});

export function PeakMonthCard({ card }: CardProps) {
  const { month, assetIds = [] } = card.payload;
  const [uris, setUris] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    const loaded: string[] = [];
    for (const assetId of assetIds.slice(0, 6)) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(assetId);
        if (info.localUri) {
          loaded.push(info.localUri);
        }
      } catch (error) {
        console.warn('Failed to load image:', error);
      }
    }
    setUris(loaded);
  }

  return (
    <CardFrame accentColor={DecoColors.sapphire}>
      <View style={peakMonthStyles.content}>
        <DecorativeHeader subtitle="BUSIEST MONTH" />
        
        <Text style={peakMonthStyles.month}>{month.toUpperCase()}</Text>
        
        <DecorativeDivider width={100} />
        
        {uris.length > 0 && (
          <View style={peakMonthStyles.photoGrid}>
            {uris.map((uri, index) => (
              <View key={index} style={peakMonthStyles.photoWrapper}>
                <ExpoImage source={{ uri }} style={peakMonthStyles.photo} contentFit="cover" />
              </View>
            ))}
          </View>
        )}
      </View>
    </CardFrame>
  );
}

const peakMonthStyles = StyleSheet.create({
  content: {
    alignItems: 'center',
    width: '100%',
  },
  month: {
    ...typography.display,
    color: DecoColors.sapphire,
    textAlign: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  photoWrapper: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: chamfer.sm,
    overflow: 'hidden',
    borderWidth: stroke.hairline,
    borderColor: DecoColors.stroke.subtle,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});

export function TimeOfDayCard({ card }: CardProps) {
  const { window, assetIds = [] } = card.payload;
  const [uris, setUris] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    const loaded: string[] = [];
    for (const assetId of assetIds.slice(0, 6)) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(assetId);
        if (info.localUri) {
          loaded.push(info.localUri);
        }
      } catch (error) {
        console.warn('Failed to load image:', error);
      }
    }
    setUris(loaded);
  }

  return (
    <CardFrame>
      <View style={timeStyles.content}>
        <DecorativeHeader subtitle="FAVORITE TIME" title="TO SHOOT" />
        
        <Text style={timeStyles.window}>{window.toUpperCase()}</Text>
        
        <DecorativeDivider width={80} />
        
        {uris.length > 0 && (
          <View style={timeStyles.photoGrid}>
            {uris.map((uri, index) => (
              <View key={index} style={timeStyles.photoWrapper}>
                <ExpoImage source={{ uri }} style={timeStyles.photo} contentFit="cover" />
              </View>
            ))}
          </View>
        )}
      </View>
    </CardFrame>
  );
}

const timeStyles = StyleSheet.create({
  content: {
    alignItems: 'center',
    width: '100%',
  },
  window: {
    ...typography.h1,
    color: DecoColors.gold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  photoWrapper: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: chamfer.sm,
    overflow: 'hidden',
    borderWidth: stroke.hairline,
    borderColor: DecoColors.stroke.subtle,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});

export function DistinctPlacesCard({ card }: CardProps) {
  const { count, assetIds = [] } = card.payload;
  const [uris, setUris] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    const loaded: string[] = [];
    for (const assetId of assetIds.slice(0, 6)) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(assetId);
        if (info.localUri) {
          loaded.push(info.localUri);
        }
      } catch (error) {
        console.warn('Failed to load image:', error);
      }
    }
    setUris(loaded);
  }

  return (
    <CardFrame>
      <View style={distinctStyles.content}>
        <DecorativeHeader subtitle="YOU EXPLORED" />
        
        <Text style={distinctStyles.heroNumber}>{count}</Text>
        <Text style={distinctStyles.heroLabel}>DISTINCT PLACES</Text>
        
        <DecorativeDivider width={120} />
        
        {uris.length > 0 && (
          <View style={distinctStyles.photoGrid}>
            {uris.map((uri, index) => (
              <View key={index} style={distinctStyles.photoWrapper}>
                <ExpoImage source={{ uri }} style={distinctStyles.photo} contentFit="cover" />
              </View>
            ))}
          </View>
        )}
      </View>
    </CardFrame>
  );
}

const distinctStyles = StyleSheet.create({
  content: {
    alignItems: 'center',
    width: '100%',
  },
  heroNumber: {
    ...typography.heroNumber,
  },
  heroLabel: {
    ...typography.h3,
    color: DecoColors.text.muted,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  photoWrapper: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: chamfer.sm,
    overflow: 'hidden',
    borderWidth: stroke.hairline,
    borderColor: DecoColors.stroke.subtle,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});

export function CollageCard({ card }: CardProps) {
  const { assetIds } = card.payload;
  const [uris, setUris] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    const loaded: string[] = [];
    for (const assetId of assetIds.slice(0, 9)) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(assetId);
        if (info.localUri) {
          loaded.push(info.localUri);
        }
      } catch (error) {
        console.warn('Failed to load image:', error);
      }
    }
    setUris(loaded);
  }

  return (
    <CardFrame>
      <View style={collageStyles.content}>
        <DecorativeHeader subtitle="YOUR YEAR IN" title="MOMENTS" />
        
        <View style={collageStyles.grid}>
          {uris.map((uri, index) => (
            <View key={index} style={collageStyles.photoWrapper}>
              <ExpoImage source={{ uri }} style={collageStyles.photo} contentFit="cover" />
            </View>
          ))}
        </View>
        
        <View style={collageStyles.bottomDecor}>
          <View style={collageStyles.bottomLine} />
          <View style={collageStyles.bottomDiamond} />
          <View style={collageStyles.bottomLine} />
        </View>
      </View>
    </CardFrame>
  );
}

const collageStyles = StyleSheet.create({
  content: {
    alignItems: 'center',
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.xl,
  },
  photoWrapper: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: chamfer.sm,
    overflow: 'hidden',
    borderWidth: stroke.standard,
    borderColor: DecoColors.gold,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  bottomDecor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomLine: {
    width: 50,
    height: 1,
    backgroundColor: DecoColors.gold,
  },
  bottomDiamond: {
    width: 10,
    height: 10,
    backgroundColor: DecoColors.gold,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.md,
  },
});
