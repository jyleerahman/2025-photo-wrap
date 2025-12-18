# Art Deco App — Design Spec (v0.1)

Status: Draft  
Style name: “Modern Art Deco” (1920s–30s geometry + contemporary usability)  
Design goals: Luxurious, structured, architectural; decorative but disciplined; fast to scan; easy to implement.

---

## 1 Visual thesis

An Art Deco app should feel like a crafted object: strong symmetry, confident geometry, and restrained ornament. Instead of soft minimalism, it uses frames, borders, stepped forms, and “metallic jewelry” accents. The vibe is a theater marquee meets a polished lobby.

Key idea: decoration is structural. Every flourish should also improve hierarchy, grouping, or affordance.

---

## 2 Layout and grid

### 2.1 Composition rules
Default to symmetry and clear centerlines. Use a “framed canvas” approach: content sits inside panels with deliberate borders and dividers, not floating on empty space.

Prefer:
Centered headings, balanced columns, aligned edges, consistent margins, repeated motifs.

Avoid:
Random asymmetry, organic blobs, overly soft rounded cards.

### 2.2 Spacing system
Use an 8pt base scale with a few “Deco jumps” for dramatic breathing room:
4, 8, 12, 16, 24, 32, 48, 64.

### 2.3 App frame
Use a consistent outer margin (safe area) and an inner “stage” panel for primary content.
Recommended:
Outer padding 16–24.
Primary panel padding 16–24.
Section spacing 24–32.

---

## 3 Shape language

### 3.1 Core shapes
Art Deco UI should be built from:
Rectangles, chamfered corners, stepped edges, chevrons, fans, sunbursts, parallel line rules.

### 3.2 Corner treatment
Avoid bubbly rounding. Use one of these two:
Option A (modern): small chamfer (clipped corners).
Option B (classic): sharp corners with stepped border details.

Practical token guidance:
Card corners: chamfer 6–10 (or square).
Buttons: chamfer 8 (or square).
Modals: chamfer 10–14.

### 3.3 Linework
Lines are part of the brand. Use crisp strokes and frequent rules.
Stroke weights:
Hairline: 1
Standard: 2
Emphasis: 3

---

## 4 Color system

### 4.1 Palette concept
Base: deep black / midnight navy for “stage.”
Text: warm cream for readability.
Accent: metallic gold/brass (sparingly, like jewelry).
Optional highlights: jewel tones (emerald, burgundy, sapphire) as controlled accents.

### 4.2 Recommended palette (starter)
Background: #0B0B0F (black-indigo)
Panel: #11121A
Cream text: #F4EBDD
Muted text: #C9C1B6
Metallic accent: #C8A24A (gold)
Deep emerald accent (optional): #0E5A4E
Burgundy accent (optional): #6B1E2E

### 4.3 Usage rules
Gold is for emphasis only:
Primary button border, key icons, active tab underline, important counters, achievement moments.

Avoid:
Gold everywhere, neon gradients, high-saturation rainbow UI.

### 4.4 Texture
Use extremely subtle texture (2–6% opacity) to suggest lacquer, paper grain, brushed metal.
Never let texture reduce text contrast.

---

## 5 Typography

### 5.1 Typeface strategy
Use a Deco display font for headlines + a modern UI font for body.
Headlines carry the era. Body stays clean and highly readable.

### 5.2 Recommended fonts

Free (Google Fonts) headline options:
Josefin Sans (best all-around “Deco poster” for headings)
Poiret One (very elegant; use only for large titles)
Limelight (marquee vibe; use sparingly)
League Spartan (bold, geometric, modern-Deco)

Paid / premium headline options:
Futura PT (classic geometric; period-correct)
ITC Avant Garde Gothic (strong personality; use carefully)

Body font:
Inter (recommended default)
Alternatives: Source Sans 3, IBM Plex Sans

### 5.3 Default pairing (recommended)
Headlines: Josefin Sans  
Body: Inter

### 5.4 Typographic styling rules
Headlines:
All caps.
Tracking: 0.08em–0.16em (increase with size).
Use weight contrast: 300–600 depending on size.
Short lines, confident statements.

Body:
Normal case.
Tracking: 0.
Line height: 1.45–1.6.

### 5.5 Type scale (starter)
Display: 40 / lh 48 / tracking 0.14em
H1: 32 / lh 40 / tracking 0.12em
H2: 24 / lh 32 / tracking 0.10em
H3: 20 / lh 28 / tracking 0.08em
Body: 16 / lh 24
Small: 14 / lh 20
Caption: 12 / lh 16

---

## 6 Components

### 6.1 Buttons
Primary button should feel like a plaque:
Dark fill, crisp border, subtle inner stroke, gold accent.

States:
Default: dark fill + gold border.
Hover: slight brightness lift, border glow very subtle.
Pressed: border darkens, fill deepens, content shifts 1px.
Disabled: remove metallic, reduce contrast but keep readable.

Text on primary buttons:
All caps optional, but keep tracking lower than headers (0.04em–0.08em).

### 6.2 Cards and panels
Cards are framed panels, not floating blobs.
Use:
Outer border (1–2), optional inner border (hairline) for “inlay.”
Header rule (double line) for section separation.

### 6.3 Inputs
Inputs should look etched:
Clear outline, minimal fill, strong focus ring.

Focus style:
2px ring in metallic or jewel accent.
Avoid overly soft shadows as the main affordance.

### 6.4 Navigation
Top bar: symmetrical, centered title, thin decorative rule below.
Tabs: use a gold underline or stepped indicator.
Bottom nav: icons with consistent stroke; label spacing tight and aligned.

### 6.5 Dividers and rules
Use decorative rules as structure:
Single line, double line, or triple parallel lines for major breaks.
Keep thickness consistent with the stroke system.

---

## 7 Iconography and illustration

Icons should feel engraved:
Geometric, consistent stroke, minimal curves, no cartoon style.

Motifs you can reuse:
Chevrons, rays, fans, stepped corners, medallion badges.

If using illustrations:
Prefer emblem-like badges or poster-style vignettes.
Avoid playful doodles and soft blob characters unless the product demands it.

---

## 8 Motion and interaction

Motion should feel like machinery and velvet:
Smooth, decisive, not bouncy.

Recommended easing:
Standard: ease-out for entrances.
Micro-interactions: ease-in-out for toggles.

Motion patterns:
Panels slide on “rails.”
Drawers close with a “latch” feeling (slightly faster exit).
Metal sweep highlight on key moments (rare).

Durations (starter):
Micro: 120–180ms
Standard: 200–280ms
Large transitions: 320–420ms

Avoid:
Springy overshoots, playful wobble, chaotic parallax.

---

## 9 Imagery and background patterns

Background patterns are subtle and structural:
Low-opacity sunburst behind hero titles.
Faint fan motif in empty states.
Geometric corner inlays on major cards.

Rule:
Patterns must never compete with content. If you notice it first, it’s too loud.

---

## 10 Accessibility requirements

Contrast:
Body text must meet WCAG AA.
Gold-on-cream is usually risky; prefer cream text on dark backgrounds, gold as border/accent.

Focus:
All interactive elements must show a strong visible focus state (2px ring).

Tap targets:
Minimum 44px.

Typography:
Avoid ultra-thin weights for small text.

---

## 11) Design tokens (starter)

Use these as a consistent implementation baseline.

```css
:root {
  /* Color */
  --bg: #0B0B0F;
  --panel: #11121A;
  --text: #F4EBDD;
  --text-muted: #C9C1B6;
  --gold: #C8A24A;
  --emerald: #0E5A4E;
  --burgundy: #6B1E2E;

  /* Stroke */
  --stroke-hair: 1px;
  --stroke-std: 2px;
  --stroke-em: 3px;

  /* Radii / chamfer approach */
  --chamfer-sm: 6px;
  --chamfer-md: 10px;
  --chamfer-lg: 14px;

  /* Spacing */
  --s-1: 4px;
  --s-2: 8px;
  --s-3: 12px;
  --s-4: 16px;
  --s-5: 24px;
  --s-6: 32px;
  --s-7: 48px;
  --s-8: 64px;

  /* Motion */
  --t-micro: 160ms;
  --t-std: 240ms;
  --t-lg: 380ms;
}
