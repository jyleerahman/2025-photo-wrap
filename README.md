# Photo Wrapped

A React Native app built with Expo that creates a "Spotify Wrapped" style experience for your photos.

## Features

- 📸 Analyze your photo library to find your "Best Places" based on photo count
- 📅 Generate a swipeable story deck (8-12 cards) summarizing your year
- 🎨 Beautiful pastel UI design system
- 🔒 Privacy-first: photos stay on-device, only metadata is processed
- 📤 Share individual cards as images
- 📍 Reverse geocoding for readable place labels
- 🗄️ SQLite caching for quick regeneration

## Tech Stack

- Expo SDK 51
- React Native
- TypeScript
- expo-router for navigation
- expo-media-library for photo access
- expo-sqlite for data storage
- expo-location for reverse geocoding
- react-native-pager-view for swipeable cards
- react-native-view-shot for sharing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Run on iOS:
```bash
npx expo start --ios
```

## Project Structure

```
/
├── app/              # Expo Router screens
│   ├── index.tsx     # Entry point (checks permissions)
│   ├── permission.tsx
│   ├── home.tsx      # Time range selection
│   ├── processing.tsx
│   ├── wrapped.tsx   # Main wrapped deck
│   └── place-detail.tsx
├── components/       # React components
│   ├── CardComponents.tsx
│   └── CardRenderer.tsx
├── constants/        # Constants and config
│   └── Colors.ts
├── types/            # TypeScript types
│   └── index.ts
└── utils/            # Utilities
    ├── database.ts
    ├── photoAnalysis.ts
    ├── share.tsx
    └── timeRanges.ts
```

## Permissions

The app requires Photos library access. On iOS, it supports:
- Full access
- Limited Photos access (with clear indication)
- Permission denied (with settings link)

## Notes

- Photos are processed on-device only
- Only metadata (location, timestamps) and asset IDs are stored
- No photo content is uploaded or synced to servers
- Location coverage may vary based on photo metadata
# 2025-photo-wrap
