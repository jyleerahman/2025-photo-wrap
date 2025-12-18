export type TimeRange = {
  start: number; // timestamp in ms
  end: number; // timestamp in ms
  label: string;
};

export type PhotoAccess = 'all' | 'limited' | 'none';

export type PlaceCluster = {
  id: string;
  wrappedRunId: string;
  centroidLat: number | null;
  centroidLon: number | null;
  photoCount: number;
  distinctDaysCount: number;
  label: string;
  labelConfidence: 'high' | 'medium' | 'low';
  representativeAssetIds: string[];
  isHidden: boolean;
  source: 'moment' | 'gridcluster';
};

export type WrappedRun = {
  id: string;
  timeRangeStart: number;
  timeRangeEnd: number;
  totalAssets: number;
  locationAssets: number;
  locationCoveragePct: number;
  accessPrivileges: PhotoAccess;
  filtersHash: string;
  algorithmVersion: string;
  createdAt: number;
};

export type CardType =
  | 'title'
  | 'trust'
  | 'topPlace1'
  | 'topPlaces23'
  | 'peakDay'
  | 'peakMonth'
  | 'mostExploredMonth'
  | 'timeOfDay'
  | 'distinctPlaces'
  | 'newPlace'
  | 'collage';

export type CardModel = {
  id: string;
  wrappedRunId: string;
  type: CardType;
  payload: Record<string, any>;
  renderOrder: number;
};

export type AssetRef = {
  assetId: string;
  creationTime: number;
  mediaType: 'photo' | 'video';
};

export type ProcessingStage = 'scan' | 'places' | 'geocode' | 'complete';

