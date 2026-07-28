import type {PlaceItem} from '@twinmatrix/rn-ui-sdk';

/**
 * Minimal MetaAtlas feature shape used by the sample adapter.
 * Real SDK features may include additional fields.
 */
export type MetaAtlasFeatureLike = {
  mapObjectId?: string | number;
  name?: string;
  whereDimension?: string;
  whatDimension?: string;
  geometry?: {type?: string; coordinates?: unknown};
  coordinates?: number[];
  properties?: {
    areaName?: string;
    metadata?: {title?: string; [key: string]: unknown};
    [key: string]: unknown;
  };
};

function extractLngLat(
  feature: MetaAtlasFeatureLike,
): [number, number] | undefined {
  const geom = feature.geometry;
  if (geom?.type === 'Point' && Array.isArray(geom.coordinates)) {
    const [lng, lat] = geom.coordinates as number[];
    if (typeof lng === 'number' && typeof lat === 'number') {
      return [lng, lat];
    }
  }
  if (
    Array.isArray(feature.coordinates) &&
    feature.coordinates.length >= 2 &&
    typeof feature.coordinates[0] === 'number' &&
    typeof feature.coordinates[1] === 'number'
  ) {
    return [feature.coordinates[0], feature.coordinates[1]];
  }
  return undefined;
}

function formatSubtitle(feature: MetaAtlasFeatureLike): string | undefined {
  const area = feature.properties?.areaName;
  const where = feature.whereDimension;
  if (area) return String(area);
  if (where) {
    const parts = where.split('.');
    return parts.slice(-2).join(' · ');
  }
  return undefined;
}

/**
 * Transform a MetaAtlas map feature into an RN UI SDK PlaceItem.
 */
export function toPlaceItem(feature: MetaAtlasFeatureLike): PlaceItem {
  return {
    id: String(feature.mapObjectId ?? feature.name ?? Math.random()),
    name: feature.name ?? 'Unknown place',
    subtitle: formatSubtitle(feature),
    coordinates: extractLngLat(feature),
    whereDimension: feature.whereDimension,
    whatDimension: feature.whatDimension,
    metadata: feature.properties as Record<string, unknown> | undefined,
  };
}

export function toPlaceItems(features: MetaAtlasFeatureLike[]): PlaceItem[] {
  return features.map(toPlaceItem);
}
