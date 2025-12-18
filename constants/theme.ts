import { Platform, TextStyle, ViewStyle } from 'react-native';
import { DecoColors } from './Colors';

// ============================================================================
// SPACING SYSTEM
// 8pt base scale with "Deco jumps" for dramatic breathing room
// ============================================================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  jumbo: 64,
} as const;

// ============================================================================
// STROKE WEIGHTS
// Linework is part of the Art Deco brand
// ============================================================================
export const stroke = {
  hairline: 1,
  standard: 2,
  emphasis: 3,
} as const;

// ============================================================================
// CORNER TREATMENTS
// Chamfered or sharp - avoid bubbly rounding
// ============================================================================
export const chamfer = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
} as const;

// ============================================================================
// MOTION / ANIMATION
// Smooth, decisive, not bouncy - like machinery and velvet
// ============================================================================
export const motion = {
  micro: 160,
  standard: 240,
  large: 380,
} as const;

// ============================================================================
// TYPOGRAPHY
// Limelight for titles (marquee Art Deco display)
// Poiret One for content (elegant geometric)
// ============================================================================

// Font families - loaded in _layout.tsx
export const fontFamily = {
  // Limelight - bold marquee display for big titles
  display: Platform.select({
    ios: 'Limelight-Regular',
    android: 'Limelight-Regular',
    default: 'Limelight-Regular',
  }) as string,
  
  // Poiret One - elegant geometric for body/content
  body: Platform.select({
    ios: 'PoiretOne-Regular',
    android: 'PoiretOne-Regular',
    default: 'PoiretOne-Regular',
  }) as string,
};

// Type scale following the design spec
export const typography = {
  // Display: 40 / lh 48 / tracking 0.14em - Limelight marquee style
  display: {
    fontFamily: fontFamily.display,
    fontSize: 40,
    lineHeight: 52,
    letterSpacing: 40 * 0.08,
    textTransform: 'uppercase',
    color: DecoColors.text.primary,
  } as TextStyle,
  
  // H1: 32 / lh 40 / tracking 0.12em
  h1: {
    fontFamily: fontFamily.display,
    fontSize: 32,
    lineHeight: 42,
    letterSpacing: 32 * 0.06,
    textTransform: 'uppercase',
    color: DecoColors.text.primary,
  } as TextStyle,
  
  // H2: 24 / lh 32 / tracking 0.10em
  h2: {
    fontFamily: fontFamily.display,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 24 * 0.05,
    textTransform: 'uppercase',
    color: DecoColors.text.primary,
  } as TextStyle,
  
  // H3: 20 / lh 28 / tracking 0.08em
  h3: {
    fontFamily: fontFamily.body,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 20 * 0.06,
    textTransform: 'uppercase',
    color: DecoColors.text.primary,
  } as TextStyle,
  
  // Body: 18 / lh 26 - Poiret One is thin, needs larger size
  body: {
    fontFamily: fontFamily.body,
    fontSize: 18,
    lineHeight: 28,
    color: DecoColors.text.primary,
  } as TextStyle,
  
  // Body Medium - same as body for Poiret One
  bodyMedium: {
    fontFamily: fontFamily.body,
    fontSize: 18,
    lineHeight: 28,
    color: DecoColors.text.primary,
  } as TextStyle,
  
  // Small: 16 / lh 22
  small: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 22,
    color: DecoColors.text.muted,
  } as TextStyle,
  
  // Caption: 14 / lh 18
  caption: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 14 * 0.08,
    textTransform: 'uppercase',
    color: DecoColors.text.muted,
  } as TextStyle,
  
  // Hero number - for big stats displays
  heroNumber: {
    fontFamily: fontFamily.display,
    fontSize: 72,
    lineHeight: 80,
    letterSpacing: 72 * 0.04,
    color: DecoColors.mint,
  } as TextStyle,
  
  // Button text
  button: {
    fontFamily: fontFamily.body,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 18 * 0.1,
    textTransform: 'uppercase',
    color: DecoColors.text.primary,
  } as TextStyle,
};

// ============================================================================
// COMPONENT STYLES
// Reusable style patterns for Art Deco components
// ============================================================================

// Panel/Card base style
export const panelStyle: ViewStyle = {
  backgroundColor: DecoColors.panel,
  borderWidth: stroke.standard,
  borderColor: DecoColors.stroke.subtle,
  borderRadius: chamfer.md,
};

// Primary button style (dark fill + mint border like a marquee)
export const primaryButtonStyle: ViewStyle = {
  backgroundColor: DecoColors.panel,
  borderWidth: stroke.standard,
  borderColor: DecoColors.mint,
  borderRadius: chamfer.sm,
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.xl,
  alignItems: 'center',
  justifyContent: 'center',
};

// Secondary button style
export const secondaryButtonStyle: ViewStyle = {
  backgroundColor: 'transparent',
  borderWidth: stroke.hairline,
  borderColor: DecoColors.stroke.subtle,
  borderRadius: chamfer.sm,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  alignItems: 'center',
  justifyContent: 'center',
};

// Decorative divider (horizontal rule)
export const decorativeDividerStyle: ViewStyle = {
  height: stroke.hairline,
  backgroundColor: DecoColors.stroke.subtle,
  marginVertical: spacing.xl,
};

// Double line divider (Art Deco signature)
export const doubleDividerStyle: ViewStyle = {
  height: 6,
  borderTopWidth: stroke.hairline,
  borderBottomWidth: stroke.hairline,
  borderColor: DecoColors.mint,
  backgroundColor: 'transparent',
  marginVertical: spacing.xl,
};

// Container with safe area padding
export const containerStyle: ViewStyle = {
  flex: 1,
  backgroundColor: DecoColors.background,
  paddingHorizontal: spacing.lg,
};

// Card with inlay effect (double border)
export const inlayCardStyle: ViewStyle = {
  backgroundColor: DecoColors.panel,
  borderWidth: stroke.standard,
  borderColor: DecoColors.stroke.subtle,
  borderRadius: chamfer.md,
  padding: spacing.lg,
};

// ============================================================================
// DECORATIVE PATTERNS
// SVG paths and patterns for Art Deco motifs
// ============================================================================

// Sunburst rays pattern (for backgrounds)
export const sunburstRays = 12;

// Chevron pattern dimensions
export const chevronPattern = {
  width: 24,
  height: 12,
  strokeWidth: 1,
};

// Corner ornament dimensions
export const cornerOrnament = {
  size: 32,
  strokeWidth: 2,
};

// ============================================================================
// SHADOWS (subtle, for depth)
// ============================================================================
export const shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  mint: {
    shadowColor: DecoColors.mint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};
