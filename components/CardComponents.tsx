import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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

function CardFrame({ children, variant = 'dark' }: { children: React.ReactNode; variant?: 'dark' | 'light' }) {
  const isDark = variant === 'dark';
  
  return (
    <View style={[
      frameStyles.outer,
      isDark ? frameStyles.outerDark : frameStyles.outerLight,
    ]}>
      {/* Corner ornaments */}
      <View style={[frameStyles.cornerTL, isDark ? frameStyles.cornerDark : frameStyles.cornerLight]} />
      <View style={[frameStyles.cornerTR, isDark ? frameStyles.cornerDark : frameStyles.cornerLight]} />
      <View style={[frameStyles.cornerBL, isDark ? frameStyles.cornerDark : frameStyles.cornerLight]} />
      <View style={[frameStyles.cornerBR, isDark ? frameStyles.cornerDark : frameStyles.cornerLight]} />
      
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
    borderWidth: stroke.standard,
    borderRadius: chamfer.md,
    padding: spacing.lg,
    position: 'relative',
  },
  outerDark: {
    backgroundColor: DecoColors.panel,
    borderColor: DecoColors.stroke.subtle,
  },
  outerLight: {
    backgroundColor: DecoColors.backgroundLight,
    borderColor: DecoColors.teal,
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
  cornerDark: {
    borderColor: DecoColors.mint,
  },
  cornerLight: {
    borderColor: DecoColors.teal,
  },
});

function DecorativeDivider({ width = 100, variant = 'dark' }: { width?: number; variant?: 'dark' | 'light' }) {
  const color = variant === 'dark' ? DecoColors.mint : DecoColors.teal;
  return (
    <View style={[dividerStyles.container, { width }]}>
      <View style={[dividerStyles.lineTop, { backgroundColor: color }]} />
      <View style={[dividerStyles.lineBottom, { backgroundColor: color }]} />
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
    marginBottom: 4,
  },
  lineBottom: {
    height: 1,
  },
});

function DecorativeHeader({ title, subtitle, variant = 'dark' }: { title?: string; subtitle?: string; variant?: 'dark' | 'light' }) {
  const accentColor = variant === 'dark' ? DecoColors.mint : DecoColors.teal;
  const textColor = variant === 'dark' ? DecoColors.text.primary : DecoColors.text.dark;
  const mutedColor = variant === 'dark' ? DecoColors.text.muted : DecoColors.text.darkMuted;
  
  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.decor}>
        <View style={[headerStyles.line, { backgroundColor: accentColor }]} />
        <View style={[headerStyles.diamond, { backgroundColor: accentColor }]} />
        <View style={[headerStyles.line, { backgroundColor: accentColor }]} />
      </View>
      {subtitle && <Text style={[headerStyles.subtitle, { color: mutedColor }]}>{subtitle}</Text>}
      {title && <Text style={[headerStyles.title, { color: textColor }]}>{title}</Text>}
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
  },
  diamond: {
    width: 6,
    height: 6,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.sm,
  },
  subtitle: {
    ...typography.caption,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
  },
});

// Sunburst background decoration
function SunburstBackground({ opacity = 0.15, color = DecoColors.mint }: { opacity?: number; color?: string }) {
  return (
    <View style={[sunburstStyles.container, { opacity }]}>
      {[...Array(16)].map((_, i) => (
        <View
          key={i}
          style={[
            sunburstStyles.ray,
            { backgroundColor: color, transform: [{ rotate: `${i * 22.5}deg` }] },
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
  },
});

// ============================================================================
// CARD COMPONENTS
// ============================================================================

export function TitleCard({ card }: CardProps) {
  const year = card.payload.year;
  return (
    <CardFrame variant="light">
      <SunburstBackground opacity={0.2} color={DecoColors.teal} />
      
      <View style={titleStyles.content}>
        <DecorativeHeader variant="light" />
        
        <Text style={titleStyles.preTitle}>YOUR</Text>
        <Text style={titleStyles.mainTitle}>PHOTO</Text>
        <Text style={titleStyles.mainTitle}>WRAPPED</Text>
        
        <DecorativeDivider width={120} variant="light" />
        
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
    color: DecoColors.text.darkMuted,
    marginBottom: spacing.xs,
  },
  mainTitle: {
    ...typography.display,
    color: DecoColors.teal,
    lineHeight: 52,
  },
  year: {
    ...typography.heroNumber,
    color: DecoColors.teal,
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
    backgroundColor: DecoColors.teal,
    opacity: 0.4,
  },
  bottomDiamond: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: DecoColors.teal,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.md,
    opacity: 0.4,
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
    <CardFrame variant="light">
      <View style={topPlace1Styles.content}>
        <DecorativeHeader subtitle="YOUR #1 PLACE" variant="light" />
        
        <Text style={topPlace1Styles.placeName}>{place.label.toUpperCase()}</Text>
        
        <DecorativeDivider width={100} variant="light" />
        
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
    color: DecoColors.teal,
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
    color: DecoColors.teal,
  },
  statLabel: {
    ...typography.caption,
    color: DecoColors.text.darkMuted,
    letterSpacing: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: DecoColors.teal,
    opacity: 0.3,
  },
  imageFrame: {
    width: '80%',
    aspectRatio: 1,
    borderWidth: stroke.standard,
    borderColor: DecoColors.teal,
    borderRadius: chamfer.sm,
    overflow: 'hidden',
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
    backgroundColor: DecoColors.mint,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    ...typography.caption,
    fontWeight: '600',
    color: DecoColors.teal,
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
    <CardFrame>
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
    <CardFrame variant="light">
      <View style={peakMonthStyles.content}>
        <DecorativeHeader subtitle="BUSIEST MONTH" variant="light" />
        
        <Text style={peakMonthStyles.month}>{month.toUpperCase()}</Text>
        
        <DecorativeDivider width={100} variant="light" />
        
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
    color: DecoColors.teal,
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
    borderColor: DecoColors.teal,
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
    color: DecoColors.mint,
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
    <CardFrame variant="light">
      <View style={collageStyles.content}>
        <DecorativeHeader subtitle="YOUR YEAR IN" title="MOMENTS" variant="light" />
        
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
    borderColor: DecoColors.teal,
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
    backgroundColor: DecoColors.teal,
  },
  bottomDiamond: {
    width: 10,
    height: 10,
    backgroundColor: DecoColors.teal,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.md,
  },
});
