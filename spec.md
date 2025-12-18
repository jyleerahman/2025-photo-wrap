# Photo Wrapped (iOS) — spec.md (Expo / React Native)

Version: 0.4  
Status: Draft  
Primary platform: iOS (iPhone)  
Build approach: Expo + EAS Build, on-device processing, privacy-first  
Experience goal: Spotify Wrapped structure (story pacing + share-first cards) combined with a Modern Playful Pastel in-app UI, plus a higher-contrast “Wrapped Poster” export skin for sharing.

---

## 0. One-paragraph definition

Photo Wrapped is “Spotify Wrapped, but with your Photos.” It generates a swipeable, shareable story deck (8–12 cards) that summarizes a user’s year (or any time range), with “Best Places” defined as where they took the most photos. The app keeps photos on-device and stores only derived stats plus asset IDs. In-app UI is warm pastel and friendly; exported share cards can optionally use a bolder Wrapped-style poster treatment for social readability.

---

## 1. Product definition

Photo Wrapped takes a photo library slice (default: Jan 1 → today), computes a small set of highlights, and presents them as a story deck. The deck is designed to be completed quickly, feel celebratory, and produce shareable cards that look good as screenshots.

The centerpiece is “Best Places,” ranked by photo count, labeled in human-readable ways that are privacy-safe by default (neighborhood/city, not street address).

---

## 2. Goals and non-goals

### 2.1 Goals
2.1.1 Generate a Wrapped fast enough to feel instant for typical libraries.  
2.1.2 Produce Best Places ranked by photo count, with readable labels.  
2.1.3 Present a cohesive swipeable story deck (8–12 cards).  
2.1.4 Allow sharing a single card as an image (MVP).  
2.1.5 Keep photos on-device; store only derived stats and asset IDs.  
2.1.6 Support iOS “Limited Photos” permissions gracefully.

### 2.2 Non-goals (MVP)
2.2.1 No accounts, cloud sync, or social graph.  
2.2.2 No face recognition or “most photographed person.”  
2.2.3 No uploading photo content to servers.  
2.2.4 No background tracking of user location.  
2.2.5 No venue-perfect naming. “Good-enough readable” is fine.  
2.2.6 No full-deck video export (Phase 3 optional).

---

## 3. Target user and value

Target user: iPhone user with a large photo library who enjoys nostalgic summaries and sharing.  
Value: fast reflection (“I didn’t realize this place was my year”) plus easy exporting.

---

## 4. User stories

### 4.1 Primary
4.1.1 User grants Photos access, picks a time range, generates a Wrapped.  
4.1.2 User sees Top Places with counts and can preview representative photos.  
4.1.3 User shares a Wrapped card as an image.

### 4.2 Secondary
4.2.1 User hides a place from the Wrapped for privacy.  
4.2.2 User regenerates the Wrapped after hiding a place.  
4.2.3 User expands Limited Photos access and regenerates.

---

## 5. UX structure (Spotify Wrapped-inspired)

The experience is a narrative, not a dashboard. It is designed for momentum and completion.

5.1 Linear story pacing: tap/slide through a deck; minimal decisions mid-stream.  
5.2 Curated highlights: show the strongest insights; skip weak or low-confidence ones.  
5.3 Identity-forward framing: cards speak like “this was your year,” not “here are metrics.”  
5.4 Share-first layouts: each share-eligible card must work as a standalone poster.  
5.5 Privacy-first defaults: labels avoid overly precise info unless the user opts in.

---

## 6. UX flow

### 6.1 Onboarding / permissions
Screen title: “Make your Photo Wrapped”  
Copy: “We analyze photo metadata to create your recap. Your photos stay on-device.”

Action: Continue → request Photos permission.

iOS permission handling:
- Full access: proceed normally.
- Limited access: show persistent notice that results are based on selected photos only, plus a “Manage Photo Access” action to expand the selection.
- Denied: show an explainer + “Open Settings” CTA, plus a limited demo mode (sample deck).

### 6.2 Range selection
Default: This year (Jan 1 → today).  
Options: This year, Last year, Last 30 days, Custom.

### 6.3 Processing (progressive, staged)
Processing is staged to show results quickly.

Stage A: fast scan  
Compute totals + time-based stats using a bulk metadata scan.

Stage B: Best Places  
Compute place buckets using Moments-first on iOS when possible, then fallback to GPS grid clustering if needed.

Stage C: Label refinement  
Reverse geocode only top places. This must not block the deck. Place labels can refine after initial render.

Processing UI shows:
- “X photos in range”
- “Y% include location data”
- If coverage is low: explain that place insights will be limited and the deck will emphasize time-based cards.

### 6.4 Wrapped deck playback
The deck is a pager. User swipes through cards. Controls are minimal during playback.

Primary interaction: swipe/tap to advance.  
Secondary: swipe back; optional long-press to pause (nice-to-have).

CTA row appears on pause/end state:
- Share this card
- Regenerate
- Settings (filters/privacy)

### 6.5 Place detail
Tap a Top Place card to open:
- Label, photo count, distinct days visited
- Representative photo grid
- “Hide this place” action

---

## 7. Wrapped content (deck definition)

### 7.1 MVP deck (target 10 cards)
Card 1: Title  
“Your Photo Wrapped {Year}”

Card 2: Trust / coverage  
“You took {total} photos. {coverage}% had location data.”

Card 3: Top Place #1  
“Your #1 place: {Place}. {count} photos.”

Card 4: Top Places #2–#3 (stacked)  
Two mini-panels with labels and counts.

Card 5: Peak day  
“Your biggest day: {date}. {count} photos.”

Card 6: Peak month  
“Your busiest month: {month}.”

Card 7: Time of day  
“You photographed most around {time window}.”

Card 8: Distinct places  
“You photographed {N} distinct places.”

Card 9: New place (conditional)  
“First time at {Place} was {date}.”  
Only include if we can compute with reasonable confidence.

Card 10: Finale collage  
“Your year in moments.”  
A collage card designed to be highly shareable.

### 7.2 Fallback deck when location coverage < 20%
If GPS coverage is low, replace place-heavy cards with time-based insights:
- photos per week
- busiest week
- most common weekday
- streaks / bursts (e.g., “3-day photo streak”)

The deck length still targets 8–12 cards. Skip low-confidence insights.

---

## 8. Data sources and permissions (Expo, iOS)

### 8.1 Photos access
Use expo-media-library for permission and asset access.

Key requirement: support iOS “Limited Photos.”
If limited access is granted:
- label results clearly as based on selected photos only
- provide “Manage Photo Access” using the system picker
- allow re-scan when access changes

### 8.2 Two-tier data fetching (smart + fast)
We do not expand heavy per-asset info for the entire range.

Tier A: bulk scan (fast)
Fetch assets in the date range using getAssetsAsync in pages (large page size).
Extract:
- assetId
- creationTime
- mediaType
- basic dimensions (optional)
Do not depend on uri stability.

Tier B: targeted expansion (small subset)
Only for assets we will render or for GPS-based clustering:
- getAssetInfoAsync(assetId)
Extract:
- location (lat/lon) if present
- localUri if available
- flags indicating cloud-only status (avoid forced downloads)

Rule: never trigger iCloud downloads just to compute stats. Representative images prefer already-local assets.

### 8.3 Moments-first “Best Places” (iOS optimization)
Use iOS smart albums / Moments as a first-pass place bucketing strategy.
If Moments are unavailable, too sparse, or labels are low-quality, fallback to GPS grid clustering.

---

## 9. Derived data model (SQLite)

### 9.1 Stored inputs (minimal)
AssetRef
- assetId (string)
- creationTime (number ms)
- mediaType ('photo' | 'video') (MVP defaults to photo only)

We do not store image bytes. We avoid storing URIs long-term.

### 9.2 Derived entities
WrappedRun
- id
- timeRangeStart, timeRangeEnd
- totalAssets
- locationAssets
- locationCoveragePct
- accessPrivileges ('all' | 'limited' | 'none')
- filtersHash
- algorithmVersion
- createdAt

PlaceCluster
- id
- wrappedRunId
- centroidLat, centroidLon (nullable for Moment-derived without GPS)
- photoCount
- distinctDaysCount
- label
- labelConfidence ('high' | 'medium' | 'low')
- representativeAssetIds (JSON array)
- isHidden (boolean)
- source ('moment' | 'gridcluster')

CardModel
- id
- wrappedRunId
- type
- payload (JSON)
- renderOrder

GeocodeCache
- key (rounded lat/lon)
- label
- updatedAt

---

## 10. Algorithms

### 10.1 Time range filtering
Include assets with creationTime in [start, end].  
Compute day buckets using local timezone.

### 10.2 Location coverage
locationCoveragePct = locationAssets / totalAssets  
If totalAssets is 0, show empty state and suggest a different range.

### 10.3 Best Places (two modes)
Mode A (default on iOS): Moments-first  
Treat each Moment as a candidate place bucket.
Rank by:
- photoCount desc
- distinctDaysCount desc

Label strategy:
- Prefer Moment’s human-readable title if it looks meaningful.
- If title is missing or generic, labelConfidence becomes low and we attempt centroid-based geocode from representative GPS (if available).

Mode B (fallback): GPS grid clustering  
Use only assets with GPS. Cluster into stable buckets.

When to fallback:
- no Moments
- Moments overlap poorly with range
- too many generic titles
- user enables “Precision mode” (Phase 2)

### 10.4 Grid clustering (fallback)
Goal: stable “place buckets” at ~75–150m resolution.

Parameters:
- CELL_SIZE_METERS = 120
- MIN_PHOTOS_PER_PLACE = 3
- TOP_PLACES = 10

Steps:
A) Quantize GPS points into grid cells using lat/lon steps adjusted by latitude.  
B) Aggregate counts and distinct days per cell.  
C) Merge adjacent dense cells (8-neighborhood union).  
D) Rank clusters and keep TOP_PLACES.

### 10.5 Representative selection
Select K images spread across time to make collages varied.
Default K = 9.

Method:
- sort candidate assets by creationTime ascending
- pick evenly spaced indices:
  idx = floor(i * (n-1) / (K-1))

Optional heuristics:
- prefer higher-res images
- optionally exclude screenshots (toggle later)

### 10.6 Reverse geocoding (top places only)
Use expo-location reverse geocode for top places only (default 10).
Throttle requests and cache by rounded coordinate.

Label formatting:
- Prefer neighborhood/area + city.
- Never show street address by default.
- If only city is known, show city.

### 10.7 Privacy: hide a place
When user hides a place:
- set isHidden = true
- regenerate deck excluding it
- update dependent cards (rankings, distinct count, new place card)

---

## 11. Screens (MVP)

11.1 PermissionScreen  
11.2 HomeScreen (range selector + Generate)  
11.3 ProcessingScreen (staged progress + coverage)  
11.4 WrappedScreen (pager)  
11.5 PlaceDetailScreen (grid + hide)  
11.6 Share flow (single card export)

Navigation: expo-router

---

## 12. Share/export spec (MVP: single card)

### 12.1 Capture
- Render card inside a share-safe frame
- Capture to PNG using react-native-view-shot
- Write to temporary file via expo-file-system
- Open share sheet via expo-sharing

Important: capture only after card images have loaded. If needed, show “Preparing share…” briefly.

### 12.2 Share-safe rules
- Keep key text inside a safe bounding box with generous padding
- Avoid tiny text; assume social screenshot viewing
- Include subtle branding mark

### 12.3 Visual skins for export
Exports can use:
- Pastel In-App skin (matches the app)
- Wrapped Poster skin (higher contrast, bolder gradients) for social readability
User-facing control can be added later; MVP can default to Wrapped Poster for share exports while keeping in-app pastel.

---

## 13. Tech stack (Expo)

Core:
- Expo SDK + TypeScript
- expo-router
- expo-media-library
- expo-location (reverse geocode only)
- expo-file-system
- expo-sharing
- expo-sqlite

UI/performance:
- expo-image
- react-native-pager-view
- FlashList (place grid)
- react-native-view-shot
- react-native-reanimated (Phase 2 polish)

Map (Phase 2):
- react-native-maps

---

## 14. Performance plan and realistic timings

### 14.1 Cost centers
1) Asset scanning (Tier A pages)  
2) Targeted asset expansion (Tier B)  
3) Reverse geocoding (rate-limited)

### 14.2 Targets
Typical user (1–5k photos in range):
- Stage A totals and time stats: a few seconds
- Stage B Best Places: near-instant with Moments-first; fallback clustering should still stay within a short wait
- Stage C geocode: non-blocking, labels refine after render

Very large range (10k+):
- must progressively render:
  show time-based cards first, then place cards as they resolve

### 14.3 Smart rules
- Always compute time-based stats first (fast).
- Prefer Moments-first for places.
- Only expand per-asset info for representative images and clustering needs.
- Never reverse geocode more than TOP_PLACES per run.
- Cache aggressively by range and algorithm version.
- Avoid iCloud downloads for stats; prefer local representative assets.

---

## 15. Caching and persistence

Cache key:
(timeRangeStart, timeRangeEnd, filtersHash, algorithmVersion, accessPrivileges)

Cache behavior:
- On cache hit, open Wrapped instantly.
- Refresh only if permissions changed, algorithm version changed, or settings changed.

Storage rules:
- Store only derived data and asset IDs.
- Never store photo bytes.
- Never upload photos in MVP.

---

## 16. Build phases

Phase 0 (v0.0.1): Top Places proof
- permissions, range selection
- totals + time stats
- Moments-first Top Places + fallback clustering
- place detail grid
- share one card

Phase 1 (v0.1): Full Wrapped deck
- 8–12 card deck
- hide-place + regenerate
- caching + progressive rendering

Phase 2 (v0.2): Map card + polish
- top places map card
- motion polish, collage layouts
- Wrapped Poster export skin refined

Phase 3 (v0.3): Full-deck export (optional)
- export deck as video

---

## 17. Open questions

17.1 Videos included in stats or photos-only for v1?  
17.2 Screenshots excluded by default or a toggle?  
17.3 Default stance on “home”: auto-hide top place or user-controlled?  
17.4 Offer Precision mode (grid clustering) as a setting in Phase 2?  
17.5 Decorative direction: blobs vs characters vs minimal gradients?  
17.6 Animation budget: subtle continuous motion vs only on interaction?

---
