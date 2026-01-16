/**
 * @fileoverview Utilities for map features
 * Following SOLID principles and pure functions
 */

import { MapViewState, MapConfig, MapFilters } from '@/types/map';

/**
 * Default configuration for France
 */
export const FRANCE_DEFAULT_VIEW: MapViewState = {
  latitude: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || '46.2276'),
  longitude: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG || '2.2137'),
  zoom: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_ZOOM || '6'),
  bearing: 0,
  pitch: 0,
};

/**
 * Predefined map styles
 */
export const MAP_STYLES = {
  STREETS: 'mapbox://styles/mapbox/streets-v12',
  SATELLITE: 'mapbox://styles/mapbox/satellite-v9',
  OUTDOOR: 'mapbox://styles/mapbox/outdoors-v12',
  LIGHT: 'mapbox://styles/mapbox/light-v11',
  DARK: 'mapbox://styles/mapbox/dark-v11',
} as const;

/**
 * Validate Mapbox token
 */
export function validateMapboxToken(token: string): string {
  return token && token.startsWith('pk.') ? token : '';
}

/**
 * Create map configuration with default values
 */
export function createMapConfig(overrides?: Partial<MapConfig>): MapConfig {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error(
      'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN no está configurado. ' +
      'Por favor añádelo a tu archivo .env.local'
    );
  }
  
  if (!validateMapboxToken(accessToken)) {
    throw new Error(
      'Token de Mapbox inválido. Debe empezar con "pk." y ser un token real. ' +
      'Obtén uno gratuito en: https://account.mapbox.com/access-tokens/'
    );
  }

  return {
    accessToken,
    mapStyle: MAP_STYLES.STREETS,
    initialViewState: FRANCE_DEFAULT_VIEW,
    controls: {
      navigation: true,
      fullscreen: true,
      geolocate: true,
      scale: true,
    },
    ...overrides,
  };
}

/**
 * Validate if coordinates are within France
 */
export function isWithinFrance(lat: number, lng: number): boolean {
  // Approximate bounding box of metropolitan France
  const FRANCE_BOUNDS = {
    north: 51.124,
    south: 41.333,
    east: 9.662,
    west: -5.225,
  };
  
  return (
    lat >= FRANCE_BOUNDS.south && 
    lat <= FRANCE_BOUNDS.north &&
    lng >= FRANCE_BOUNDS.west && 
    lng <= FRANCE_BOUNDS.east
  );
}

/**
 * Calculate bounding box from coordinates and zoom
 */
export function calculateBoundingBox(
  center: { lat: number; lng: number },
  zoom: number
): [number, number, number, number] {
  // Approximate visible area based on zoom
  const zoomFactor = Math.pow(2, 14 - zoom);
  const deltaLat = 0.01 * zoomFactor;
  const deltaLng = 0.015 * zoomFactor;
  
  return [
    center.lng - deltaLng, // west
    center.lat - deltaLat, // south
    center.lng + deltaLng, // east
    center.lat + deltaLat, // north
  ];
}

/**
 * Format coordinates for user display
 */
export function formatCoordinates(lat: number, lng: number): string {
  const formatCoord = (coord: number, isLat: boolean): string => {
    const direction = isLat 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    
    return `${Math.abs(coord).toFixed(4)}°${direction}`;
  };
  
  return `${formatCoord(lat, true)}, ${formatCoord(lng, false)}`;
}

/**
 * Calculate distance between two points (Haversine formula)
 */
export function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Generate colors for map layers
 */
export function generateLayerColor(layerType: string, index: number): string {
  const colors = {
    forest: ['#228B22', '#32CD32', '#90EE90', '#006400', '#7CFC00'],
    species: ['#8B4513', '#A0522D', '#D2691E', '#F4A460', '#DEB887'],
    parcel: ['#4169E1', '#6495ED', '#87CEEB', '#1E90FF', '#00BFFF'],
  };
  
  const colorArray = colors[layerType as keyof typeof colors] || colors.forest;
  return colorArray[index % colorArray.length];
}

/**
 * Create default filters
 */
export function createDefaultFilters(): MapFilters {
  return {
    showCadastre: false,
    treeSpecies: [],
  };
}

/**
 * Validate map view state
 */
export function validateMapViewState(viewState: Partial<MapViewState>): boolean {
  const { latitude, longitude, zoom } = viewState;
  
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }
  
  if (latitude < -90 || latitude > 90) {
    return false;
  }
  
  if (longitude < -180 || longitude > 180) {
    return false;
  }
  
  if (zoom !== undefined && (zoom < 0 || zoom > 24)) {
    return false;
  }
  
  return true;
}

/**
 * Serialize map state for storage
 */
export function serializeMapState(viewState: MapViewState, filters: MapFilters): string {
  return JSON.stringify({
    viewState,
    filters,
    timestamp: Date.now(),
  });
}

/**
 * Deserialize map state from storage
 */
export function deserializeMapState(serialized: string): {
  viewState: MapViewState;
  filters: MapFilters;
  timestamp: number;
} | null {
  try {
    const parsed = JSON.parse(serialized);
    
    if (validateMapViewState(parsed.viewState)) {
      return parsed;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Optimize zoom level for data loading
 */
export function getOptimizedZoomLevel(currentZoom: number): number {
  // Round to nearest integer to optimize cache
  return Math.round(currentZoom);
}

/**
 * Determine if cadastral parcels should be shown based on zoom level
 */
export function shouldShowCadastreAtZoom(zoom: number): boolean {
  // Show parcels only when there is sufficient zoom
  return zoom >= 14;
}