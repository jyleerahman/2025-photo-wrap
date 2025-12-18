import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import type { AssetRef, PlaceCluster, TimeRange } from '@/types';

const CELL_SIZE_METERS = 120;
const MIN_PHOTOS_PER_PLACE = 3;
const TOP_PLACES = 10;

export async function scanPhotos(timeRange: TimeRange): Promise<{
  assets: AssetRef[];
  totalCount: number;
}> {
  const assets: AssetRef[] = [];
  let hasNextPage = true;
  let after: string | undefined;

  const startTime = timeRange.start;
  const endTime = timeRange.end;

  while (hasNextPage) {
    const result = await MediaLibrary.getAssetsAsync({
      first: 1000,
      after,
      mediaType: ['photo'],
      createdAfter: startTime,
      createdBefore: endTime,
      sortBy: 'creationTime',
    });

    for (const asset of result.assets) {
      assets.push({
        assetId: asset.id,
        creationTime: asset.creationTime,
        mediaType: 'photo',
      });
    }

    hasNextPage = result.hasNextPage;
    after = result.endCursor;
  }

  return {
    assets,
    totalCount: assets.length,
  };
}

export async function getAssetsWithLocation(
  assetIds: string[],
  onProgress?: (processed: number, total: number) => void
): Promise<
  Array<{
    assetId: string;
    location: { latitude: number; longitude: number };
    creationTime: number;
  }>
> {
  const results: Array<{
    assetId: string;
    location: { latitude: number; longitude: number };
    creationTime: number;
  }> = [];
  
  const BATCH_SIZE = 20; // Process 20 photos in parallel at a time
  const total = assetIds.length;
  let processed = 0;
  
  for (let i = 0; i < assetIds.length; i += BATCH_SIZE) {
    const batch = assetIds.slice(i, i + BATCH_SIZE);
    
    const batchResults = await Promise.all(
      batch.map(async (assetId) => {
        try {
          const info = await MediaLibrary.getAssetInfoAsync(assetId);
          if (info.location) {
            return {
              assetId,
              location: {
                latitude: info.location.latitude,
                longitude: info.location.longitude,
              },
              creationTime: info.creationTime,
            };
          }
        } catch (error) {
          // Skip assets that can't be loaded
          console.warn(`Failed to load asset ${assetId}:`, error);
        }
        return null;
      })
    );
    
    // Filter out nulls and add to results
    for (const result of batchResults) {
      if (result) {
        results.push(result);
      }
    }
    
    processed += batch.length;
    onProgress?.(processed, total);
  }
  
  return results;
}

function gridClustering(
  assetsWithLocation: Array<{
    assetId: string;
    location: { latitude: number; longitude: number };
    creationTime: number;
  }>
): PlaceCluster[] {
  // Simple grid-based clustering
  const cells = new Map<string, {
    assetIds: string[];
    days: Set<string>;
    centroidLat: number;
    centroidLon: number;
  }>();

  for (const asset of assetsWithLocation) {
    // Quantize to grid cells (roughly 120m at equator)
    const latStep = 120 / 111320; // meters to degrees (rough)
    const lonStep = 120 / (111320 * Math.cos((asset.location.latitude * Math.PI) / 180));
    
    const cellLat = Math.floor(asset.location.latitude / latStep);
    const cellLon = Math.floor(asset.location.longitude / lonStep);
    const cellKey = `${cellLat},${cellLon}`;
    
    const dateKey = new Date(asset.creationTime).toDateString();
    
    if (!cells.has(cellKey)) {
      cells.set(cellKey, {
        assetIds: [],
        days: new Set(),
        centroidLat: asset.location.latitude,
        centroidLon: asset.location.longitude,
      });
    }
    
    const cell = cells.get(cellKey)!;
    cell.assetIds.push(asset.assetId);
    cell.days.add(dateKey);
    // Update centroid (simple average)
    const count = cell.assetIds.length;
    cell.centroidLat = (cell.centroidLat * (count - 1) + asset.location.latitude) / count;
    cell.centroidLon = (cell.centroidLon * (count - 1) + asset.location.longitude) / count;
  }

  // Convert to clusters and filter
  const clusters: PlaceCluster[] = [];
  let clusterId = 0;

  for (const [cellKey, cell] of cells.entries()) {
    if (cell.assetIds.length >= MIN_PHOTOS_PER_PLACE) {
      clusters.push({
        id: `cluster_${clusterId++}`,
        wrappedRunId: '', // Will be set by caller
        centroidLat: cell.centroidLat,
        centroidLon: cell.centroidLon,
        photoCount: cell.assetIds.length,
        distinctDaysCount: cell.days.size,
        label: 'Unknown Place', // Will be geocoded later
        labelConfidence: 'low',
        representativeAssetIds: selectRepresentatives(cell.assetIds, 9),
        isHidden: false,
        source: 'gridcluster',
      });
    }
  }

  // Sort by photo count and take top N
  clusters.sort((a, b) => b.photoCount - a.photoCount);
  return clusters.slice(0, TOP_PLACES);
}

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

export async function computeBestPlaces(
  assets: AssetRef[],
  wrappedRunId: string,
  onProgress?: (processed: number, total: number) => void
): Promise<PlaceCluster[]> {
  // Scan ALL photos for location data (parallel batched for performance)
  const assetIds = assets.map((a) => a.assetId);

  const assetsWithLocation = await getAssetsWithLocation(assetIds, onProgress);
  
  if (assetsWithLocation.length < MIN_PHOTOS_PER_PLACE) {
    return [];
  }

  const clusters = gridClustering(assetsWithLocation);
  
  // Set wrappedRunId
  clusters.forEach((cluster) => {
    cluster.wrappedRunId = wrappedRunId;
  });

  return clusters;
}

export async function reverseGeocodePlace(
  lat: number,
  lon: number
): Promise<string> {
  try {
    const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    if (result.length > 0) {
      const addr = result[0];
      // Prefer neighborhood/district, then city, then region
      if (addr.district) {
        return addr.district;
      }
      if (addr.subregion) {
        return addr.subregion;
      }
      if (addr.city) {
        return addr.city;
      }
      if (addr.region) {
        return addr.region;
      }
      if (addr.country) {
        return addr.country;
      }
    }
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
  }
  
  return 'Unknown Place';
}

export function computeTimeStats(assets: AssetRef[]): {
  peakDay: { date: Date; count: number; assetIds: string[] } | null;
  peakMonth: { month: string; count: number; assetIds: string[] } | null;
  timeOfDay: { window: string; hour: number; assetIds: string[] } | null;
  distinctDays: number;
  allAssetIds: string[];
} {
  const dayCounts = new Map<string, { count: number; assetIds: string[] }>();
  const monthCounts = new Map<string, { count: number; assetIds: string[] }>();
  const hourCounts = new Map<number, { count: number; assetIds: string[] }>();
  const days = new Set<string>();
  const allAssetIds: string[] = [];

  for (const asset of assets) {
    const date = new Date(asset.creationTime);
    const dayKey = date.toDateString();
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const hour = date.getHours();

    days.add(dayKey);
    allAssetIds.push(asset.assetId);

    // Track day counts and asset IDs
    if (!dayCounts.has(dayKey)) {
      dayCounts.set(dayKey, { count: 0, assetIds: [] });
    }
    const dayData = dayCounts.get(dayKey)!;
    dayData.count++;
    dayData.assetIds.push(asset.assetId);

    // Track month counts and asset IDs
    if (!monthCounts.has(monthKey)) {
      monthCounts.set(monthKey, { count: 0, assetIds: [] });
    }
    const monthData = monthCounts.get(monthKey)!;
    monthData.count++;
    monthData.assetIds.push(asset.assetId);

    // Track hour counts and asset IDs
    if (!hourCounts.has(hour)) {
      hourCounts.set(hour, { count: 0, assetIds: [] });
    }
    const hourData = hourCounts.get(hour)!;
    hourData.count++;
    hourData.assetIds.push(asset.assetId);
  }

  let peakDay: { date: Date; count: number; assetIds: string[] } | null = null;
  for (const [dayKey, data] of dayCounts.entries()) {
    if (!peakDay || data.count > peakDay.count) {
      peakDay = { date: new Date(dayKey), count: data.count, assetIds: data.assetIds };
    }
  }

  let peakMonth: { month: string; count: number; assetIds: string[] } | null = null;
  for (const [monthKey, data] of monthCounts.entries()) {
    if (!peakMonth || data.count > peakMonth.count) {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month));
      peakMonth = { 
        month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), 
        count: data.count,
        assetIds: data.assetIds,
      };
    }
  }

  let maxHour = 0;
  let maxCount = 0;
  let maxHourAssetIds: string[] = [];
  for (const [hour, data] of hourCounts.entries()) {
    if (data.count > maxCount) {
      maxCount = data.count;
      maxHour = hour;
      maxHourAssetIds = data.assetIds;
    }
  }

  const timeOfDay = maxCount > 0 ? {
    window: getTimeOfDayLabel(maxHour),
    hour: maxHour,
    assetIds: maxHourAssetIds,
  } : null;

  return {
    peakDay,
    peakMonth,
    timeOfDay,
    distinctDays: days.size,
    allAssetIds,
  };
}

function getTimeOfDayLabel(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function computeMostExploredMonth(
  assetsWithLocation: Array<{
    assetId: string;
    location: { latitude: number; longitude: number };
    creationTime: number;
  }>
): {
  month: string;
  distinctPlaces: number;
  assetIds: string[];
} | null {
  if (assetsWithLocation.length === 0) return null;

  // Track distinct grid cells per month
  const monthPlaces = new Map<string, {
    gridCells: Set<string>;
    assetIds: string[];
  }>();

  for (const asset of assetsWithLocation) {
    const date = new Date(asset.creationTime);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    
    // Quantize to grid cells (same logic as gridClustering)
    const latStep = 120 / 111320;
    const lonStep = 120 / (111320 * Math.cos((asset.location.latitude * Math.PI) / 180));
    const cellLat = Math.floor(asset.location.latitude / latStep);
    const cellLon = Math.floor(asset.location.longitude / lonStep);
    const cellKey = `${cellLat},${cellLon}`;

    if (!monthPlaces.has(monthKey)) {
      monthPlaces.set(monthKey, { gridCells: new Set(), assetIds: [] });
    }
    
    const monthData = monthPlaces.get(monthKey)!;
    monthData.gridCells.add(cellKey);
    monthData.assetIds.push(asset.assetId);
  }

  // Find the month with most distinct places
  let mostExplored: { monthKey: string; distinctPlaces: number; assetIds: string[] } | null = null;
  
  for (const [monthKey, data] of monthPlaces.entries()) {
    if (!mostExplored || data.gridCells.size > mostExplored.distinctPlaces) {
      mostExplored = {
        monthKey,
        distinctPlaces: data.gridCells.size,
        assetIds: data.assetIds,
      };
    }
  }

  if (!mostExplored) return null;

  const [year, month] = mostExplored.monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month));
  
  return {
    month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    distinctPlaces: mostExplored.distinctPlaces,
    assetIds: mostExplored.assetIds,
  };
}

