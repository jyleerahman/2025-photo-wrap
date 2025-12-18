import * as SQLite from 'expo-sqlite';
import type { WrappedRun, PlaceCluster, CardModel } from '@/types';

const DB_NAME = 'photowrap.db';
const ALGORITHM_VERSION = '1.0.0';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync(DB_NAME);
  
  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS WrappedRun (
      id TEXT PRIMARY KEY,
      timeRangeStart INTEGER NOT NULL,
      timeRangeEnd INTEGER NOT NULL,
      totalAssets INTEGER NOT NULL,
      locationAssets INTEGER NOT NULL,
      locationCoveragePct REAL NOT NULL,
      accessPrivileges TEXT NOT NULL,
      filtersHash TEXT NOT NULL,
      algorithmVersion TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS PlaceCluster (
      id TEXT PRIMARY KEY,
      wrappedRunId TEXT NOT NULL,
      centroidLat REAL,
      centroidLon REAL,
      photoCount INTEGER NOT NULL,
      distinctDaysCount INTEGER NOT NULL,
      label TEXT NOT NULL,
      labelConfidence TEXT NOT NULL,
      representativeAssetIds TEXT NOT NULL,
      isHidden INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL,
      FOREIGN KEY (wrappedRunId) REFERENCES WrappedRun(id)
    );

    CREATE TABLE IF NOT EXISTS CardModel (
      id TEXT PRIMARY KEY,
      wrappedRunId TEXT NOT NULL,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      renderOrder INTEGER NOT NULL,
      FOREIGN KEY (wrappedRunId) REFERENCES WrappedRun(id)
    );

    CREATE TABLE IF NOT EXISTS GeocodeCache (
      key TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);
  
  return db;
}

export async function saveWrappedRun(run: WrappedRun) {
  const database = await initDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO WrappedRun 
     (id, timeRangeStart, timeRangeEnd, totalAssets, locationAssets, locationCoveragePct, 
      accessPrivileges, filtersHash, algorithmVersion, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      run.id,
      run.timeRangeStart,
      run.timeRangeEnd,
      run.totalAssets,
      run.locationAssets,
      run.locationCoveragePct,
      run.accessPrivileges,
      run.filtersHash,
      run.algorithmVersion,
      run.createdAt,
    ]
  );
}

export async function savePlaceCluster(place: PlaceCluster) {
  const database = await initDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO PlaceCluster 
     (id, wrappedRunId, centroidLat, centroidLon, photoCount, distinctDaysCount,
      label, labelConfidence, representativeAssetIds, isHidden, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      place.id,
      place.wrappedRunId,
      place.centroidLat,
      place.centroidLon,
      place.photoCount,
      place.distinctDaysCount,
      place.label,
      place.labelConfidence,
      JSON.stringify(place.representativeAssetIds),
      place.isHidden ? 1 : 0,
      place.source,
    ]
  );
}

export async function saveCardModel(card: CardModel) {
  const database = await initDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO CardModel 
     (id, wrappedRunId, type, payload, renderOrder)
     VALUES (?, ?, ?, ?, ?)`,
    [
      card.id,
      card.wrappedRunId,
      card.type,
      JSON.stringify(card.payload),
      card.renderOrder,
    ]
  );
}

export async function getWrappedRun(id: string): Promise<WrappedRun | null> {
  const database = await initDatabase();
  const result = await database.getFirstAsync<WrappedRun>(
    `SELECT * FROM WrappedRun WHERE id = ?`,
    [id]
  );
  return result || null;
}

export async function getPlaceClusters(wrappedRunId: string, includeHidden = false): Promise<PlaceCluster[]> {
  const database = await initDatabase();
  const query = includeHidden
    ? `SELECT * FROM PlaceCluster WHERE wrappedRunId = ? ORDER BY photoCount DESC`
    : `SELECT * FROM PlaceCluster WHERE wrappedRunId = ? AND isHidden = 0 ORDER BY photoCount DESC`;
  
  const results = await database.getAllAsync<any>(query, [wrappedRunId]);
  
  return results.map((row) => ({
    ...row,
    representativeAssetIds: JSON.parse(row.representativeAssetIds),
    isHidden: row.isHidden === 1,
  }));
}

export async function getCardModels(wrappedRunId: string): Promise<CardModel[]> {
  const database = await initDatabase();
  const results = await database.getAllAsync<any>(
    `SELECT * FROM CardModel WHERE wrappedRunId = ? ORDER BY renderOrder ASC`,
    [wrappedRunId]
  );
  
  return results.map((row) => ({
    ...row,
    payload: JSON.parse(row.payload),
  }));
}

export async function hidePlace(placeId: string) {
  const database = await initDatabase();
  await database.runAsync(
    `UPDATE PlaceCluster SET isHidden = 1 WHERE id = ?`,
    [placeId]
  );
}

export function getCacheKey(
  timeRangeStart: number,
  timeRangeEnd: number,
  filtersHash: string,
  accessPrivileges: string
): string {
  return `${timeRangeStart}-${timeRangeEnd}-${filtersHash}-${ALGORITHM_VERSION}-${accessPrivileges}`;
}

export { ALGORITHM_VERSION };

