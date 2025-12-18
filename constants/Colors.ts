// Art Deco Color System
// Inspired by Radio City Music Hall program - mint green with dark teal accents

export const DecoColors = {
  // Base colors - the "stage"
  background: '#1E2D2F',       // Dark teal/charcoal
  panel: '#263638',            // Slightly lighter panel surfaces
  backgroundLight: '#A8D4AE',  // Mint green (for alternate cards)
  
  // Text hierarchy
  text: {
    primary: '#F5F0E6',        // Warm cream
    muted: '#C4CFC6',          // Muted sage
    dark: '#1E2D2F',           // Dark text for light backgrounds
    darkMuted: '#4A5E58',      // Muted dark for light backgrounds
  },
  
  // Primary accent - mint/sage green
  mint: '#A8D4AE',
  mintLight: '#C5E5C9',
  mintDark: '#8BC492',
  
  // Secondary accent - warm cream/gold for highlights
  cream: '#F5F0E6',
  gold: '#D4C896',             // Warm gold-cream accent
  
  // Dark accent for emphasis
  teal: '#1E2D2F',
  tealLight: '#354A4E',
  
  // Strokes and borders
  stroke: {
    light: '#A8D4AE',          // Mint stroke
    dark: '#1E2D2F',           // Dark stroke
    subtle: '#3A4D4F',         // Subtle dark stroke
    cream: '#F5F0E6',          // Cream stroke
  },
  
  // State variations
  states: {
    hover: 'rgba(168, 212, 174, 0.15)',    // Mint tint for hover
    pressed: 'rgba(168, 212, 174, 0.25)',  // Mint tint for pressed
    disabled: 'rgba(245, 240, 230, 0.3)',  // Muted cream for disabled
  },
};

// Poster/Export variant - slightly higher contrast for sharing
export const DecoPosterColors = {
  ...DecoColors,
  background: '#1A2628',
  mint: '#9ECC A4',
};

// Legacy export for backwards compatibility
export const PastelColors = {
  backgrounds: {
    softBeige: DecoColors.background,
    cream: DecoColors.panel,
    white: DecoColors.panel,
  },
  accents: {
    softPink: DecoColors.mint,
    oliveGreen: DecoColors.mint,
    lightBlue: DecoColors.tealLight,
    warmYellow: DecoColors.gold,
  },
  text: {
    darkBrown: DecoColors.text.primary,
    mutedGray: DecoColors.text.muted,
    darkGreen: DecoColors.mint,
  },
  borders: {
    softBrown: DecoColors.stroke.subtle,
    darkStroke: DecoColors.stroke.dark,
  },
};
