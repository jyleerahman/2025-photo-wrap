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
  // Check permissions first
  const locationPermission = await Location.getForegroundPermissionsAsync();
  console.log(`[DEBUG] Location permission status: ${locationPermission.status}`);
  
  const mediaPermission = await MediaLibrary.getPermissionsAsync();
  console.log(`[DEBUG] Media library permission: status=${mediaPermission.status}, accessPrivileges=${mediaPermission.accessPrivileges}`);
  
  // Test first asset to see full structure
  if (assetIds.length > 0) {
    try {
      console.log(`[DEBUG] Testing first asset: ${assetIds[0]}`);
      const testInfo = await MediaLibrary.getAssetInfoAsync(assetIds[0]);
      console.log(`[DEBUG] First asset full info:`, JSON.stringify(testInfo, null, 2));
    } catch (error) {
      console.error(`[DEBUG] Failed to load first asset:`, error);
    }
  }
  
  const results: Array<{
    assetId: string;
    location: { latitude: number; longitude: number };
    creationTime: number;
  }> = [];
  
  const BATCH_SIZE = 10; // Process 10 photos in parallel (reduced for iCloud fetching)
  const total = assetIds.length;
  let processed = 0;
  
  // Enhanced debugging
  let successCount = 0;
  let noLocationCount = 0;
  let errorCount = 0;
  let invalidCoordCount = 0;
  
  for (let i = 0; i < assetIds.length; i += BATCH_SIZE) {
    const batch = assetIds.slice(i, i + BATCH_SIZE);
    
    const batchResults = await Promise.all(
      batch.map(async (assetId) => {
        try {
          // Try without shouldDownloadFromNetwork first - it might cause issues with location access
          // Note: This means we won't get data for iCloud-only photos, but it might help us see
          // if the issue is with the network fetch or fundamental permission/API issue
          const info = await MediaLibrary.getAssetInfoAsync(assetId);
          
          // Debug first few assets
          if (i === 0 && batch.indexOf(assetId) < 3) {
            console.log(`[DEBUG] Sample asset ${batch.indexOf(assetId)}: location=${JSON.stringify(info.location)}, creationTime=${info.creationTime}`);
          }
          
          if (info.location) {
            // expo-media-library sometimes returns coordinates as strings, not numbers
            const lat = typeof info.location.latitude === 'string' 
              ? parseFloat(info.location.latitude) 
              : info.location.latitude;
            const lon = typeof info.location.longitude === 'string' 
              ? parseFloat(info.location.longitude) 
              : info.location.longitude;
            
            // Validate coordinates are real numbers
            if (Number.isFinite(lat) && Number.isFinite(lon)) {
              successCount++;
              return {
                assetId,
                location: { latitude: lat, longitude: lon },
                creationTime: info.creationTime,
              };
            } else {
              invalidCoordCount++;
            }
          } else {
            noLocationCount++;
          }
        } catch (error) {
          errorCount++;
          if (i === 0 && batch.indexOf(assetId) < 3) {
            console.error(`[DEBUG] Error loading asset ${batch.indexOf(assetId)}:`, error);
          }
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
  
  console.log(`[DEBUG] Location extraction: ${results.length} with location out of ${assetIds.length} (${Math.round(results.length / assetIds.length * 100)}%)`);
  console.log(`[DEBUG] Breakdown: ${successCount} success, ${noLocationCount} no location, ${invalidCoordCount} invalid coords, ${errorCount} errors`);
  if (results.length > 0) {
    console.log(`[DEBUG] Sample location: (${results[0].location.latitude}, ${results[0].location.longitude})`);
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
    const lat = asset.location.latitude;
    const lon = asset.location.longitude;
    
    // Skip invalid coordinates
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      continue;
    }
    
    // Quantize to grid cells (roughly 120m at equator)
    const latStep = 120 / 111320; // meters to degrees (rough)
    const cosLat = Math.cos((lat * Math.PI) / 180);
    // Avoid division by zero near poles
    const lonStep = cosLat > 0.01 ? 120 / (111320 * cosLat) : latStep;
    
    const cellLat = Math.floor(lat / latStep);
    const cellLon = Math.floor(lon / lonStep);
    const cellKey = `${cellLat},${cellLon}`;
    
    const dateKey = new Date(asset.creationTime).toDateString();
    
    if (!cells.has(cellKey)) {
      cells.set(cellKey, {
        assetIds: [],
        days: new Set(),
        centroidLat: lat,
        centroidLon: lon,
      });
    }
    
    const cell = cells.get(cellKey)!;
    cell.assetIds.push(asset.assetId);
    cell.days.add(dateKey);
    // Update centroid (simple average)
    const count = cell.assetIds.length;
    cell.centroidLat = (cell.centroidLat * (count - 1) + lat) / count;
    cell.centroidLon = (cell.centroidLon * (count - 1) + lon) / count;
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
): Promise<{
  clusters: PlaceCluster[];
  assetsWithLocation: Array<{
    assetId: string;
    location: { latitude: number; longitude: number };
    creationTime: number;
  }>;
}> {
  // Scan ALL photos for location data (parallel batched for performance)
  const assetIds = assets.map((a) => a.assetId);

  const assetsWithLocation = await getAssetsWithLocation(assetIds, onProgress);
  
  if (assetsWithLocation.length < MIN_PHOTOS_PER_PLACE) {
    return { clusters: [], assetsWithLocation };
  }

  const clusters = gridClustering(assetsWithLocation);
  
  // Set wrappedRunId
  clusters.forEach((cluster) => {
    cluster.wrappedRunId = wrappedRunId;
  });

  return { clusters, assetsWithLocation };
}

export async function reverseGeocodePlace(
  lat: number,
  lon: number
): Promise<string> {
  try {
    console.log(`[DEBUG] Calling reverseGeocodeAsync for (${lat}, ${lon})`);
    const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    console.log(`[DEBUG] Geocode result:`, JSON.stringify(result, null, 2));
    if (result.length > 0) {
      const addr = result[0];
      // Prefer most specific location: neighborhood (subLocality) first, then district, city, etc.
      if (addr.subLocality) {
        return addr.subLocality;
      }
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
    console.log('[DEBUG] No usable address fields found in result');
  } catch (error) {
    console.error('[DEBUG] Reverse geocoding error:', error);
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

