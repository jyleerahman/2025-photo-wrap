// Art Deco Color System
// Extracted from Radio City Music Hall program poster

export const DecoColors = {
  // Base colors - the "stage"
  background: '#2b2d28',       // Dark charcoal (poster's building color)
  panel: '#353730',            // Slightly lighter panel surfaces
  backgroundLight: '#cdd798',  // Sage green (poster's main accent)
  
  // Text hierarchy
  text: {
    primary: '#faf1d4',        // Cream (poster's light areas)
    muted: '#c5c0aa',          // Muted cream
    dark: '#2b2d28',           // Dark text for light backgrounds
    darkMuted: '#4a4d46',      // Muted dark for light backgrounds
  },
  
  // Primary accent - sage green
  mint: '#cdd798',
  mintLight: '#dae4a8',
  mintDark: '#b8c485',
  
  // Secondary accent - olive/tan
  olive: '#b1a37c',
  oliveLight: '#c4b894',
  oliveDark: '#9a8e6a',
  
  // Cream accent
  cream: '#faf1d4',
  
  // Dark accent for emphasis
  teal: '#2b2d28',
  tealLight: '#3d3f38',
  
  // Strokes and borders
  stroke: {
    light: '#cdd798',          // Sage stroke
    dark: '#2b2d28',           // Dark stroke
    subtle: '#404238',         // Subtle dark stroke
    cream: '#faf1d4',          // Cream stroke
    olive: '#b1a37c',          // Olive stroke
  },
  
  // State variations
  states: {
    hover: 'rgba(205, 215, 152, 0.15)',    // Sage tint for hover
    pressed: 'rgba(205, 215, 152, 0.25)',  // Sage tint for pressed
    disabled: 'rgba(250, 241, 212, 0.3)',  // Muted cream for disabled
  },
};

// Poster/Export variant - slightly higher contrast for sharing
export const DecoPosterColors = {
  ...DecoColors,
  background: '#232520',
  mint: '#c5cf8a',
};

// Legacy export for backwards compatibility
export const PastelColors = {
  backgrounds: {
    softBeige: DecoColors.background,
    cream: DecoColors.panel,
    white: DecoColors.panel,
  },
  accents: {
    softPink: DecoColors.olive,
    oliveGreen: DecoColors.mint,
    lightBlue: DecoColors.tealLight,
    warmYellow: DecoColors.olive,
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
