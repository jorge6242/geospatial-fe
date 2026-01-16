/**
 * @fileoverview Hook to manage MapViewer state and logic
 * Following SOLID principles - extracts state logic from component
 */

'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import type { MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox';
import type { MapViewState, MapConfig, MapFilters } from '@/types/map';

interface UseMapViewerProps {
  /** Initial map configuration */
  config: MapConfig;
  /** Active filters */
  filters: MapFilters;
  /** Callback when view state changes */
  onViewStateChange?: (viewState: MapViewState) => void;
  /** Callback when clicked */
  onClick?: (event: { lng: number; lat: number; features?: any[] }) => void;
  /** Callback when map loads */
  onLoad?: (map: mapboxgl.Map) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

interface UseMapViewerReturn {
  // References
  mapRef: React.RefObject<MapRef | null>;
  
  // States
  viewState: MapViewState;
  isMapLoaded: boolean;
  cursor: string;
  hoveredFeature: any;
  
  // Main handlers
  handleViewStateChange: (evt: ViewStateChangeEvent) => void;
  handleMapClick: (event: any) => void;
  handleMapLoad: () => void;
  handleMapError: (event: any) => void;
  handleMouseMove: (event: any) => void;
  
  // Map actions
  handleResetView: () => void;
  handleGeolocate: () => void;
}

/**
 * Centralized hook for all MapViewer logic
 * Extracts state and handlers following SRP principle
 */
export function useMapViewer({
  config,
  filters,
  onViewStateChange,
  onClick,
  onLoad,
  onError,
}: UseMapViewerProps): UseMapViewerReturn {
  
  // References
  const mapRef = useRef<MapRef>(null);
  
  // Local states
  const [viewState, setViewState] = useState<MapViewState>(config.initialViewState);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [cursor, setCursor] = useState<string>('auto');
  const [hoveredFeature, setHoveredFeature] = useState<any>(null);

  /**
   * Handler for map view state changes
   */
  const handleViewStateChange = useCallback((evt: ViewStateChangeEvent) => {
    const newViewState = evt.viewState as MapViewState;
    setViewState(newViewState);
    onViewStateChange?.(newViewState);
  }, [onViewStateChange]);

  /**
   * Handler for map click
   */
  const handleMapClick = useCallback((event: any) => {
    const { lng, lat } = event.lngLat;
    const features = event.features || [];
    
    onClick?.({
      lng,
      lat,
      features,
    });
  }, [onClick]);

  /**
   * Handler for map load
   */
  const handleMapLoad = useCallback(() => {
    console.log('✅ Map loaded successfully');
    const map = mapRef.current?.getMap();
    if (map) {
      setIsMapLoaded(true);
      onLoad?.(map);
    }
  }, [onLoad]);

  /**
   * Handler for map errors
   */
  const handleMapError = useCallback((event: any) => {
    console.error('❌ Map error:', event.error);
    console.error('❌ Full error event:', event);
    
    let errorMessage = event.error?.message || 'Unknown map error';
    
    // Specific handling for token errors
    if (errorMessage.includes('access token') || errorMessage.includes('Unauthorized')) {
      errorMessage = '❌ Invalid Mapbox token. Go to https://account.mapbox.com/access-tokens/ to get a free one.';
    }
    
    onError?.(new Error(errorMessage));
  }, [onError]);

  /**
   * Handler for hover over features
   */
  const handleMouseMove = useCallback((event: any) => {
    const features = event.features;
    
    if (features && features.length > 0) {
      setCursor('pointer');
      setHoveredFeature(features[0]);
    } else {
      setCursor('auto');
      setHoveredFeature(null);
    }
  }, []);

  /**
   * Reset view to France
   */
  const handleResetView = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: [config.initialViewState.longitude, config.initialViewState.latitude],
        zoom: config.initialViewState.zoom,
        bearing: config.initialViewState.bearing,
        pitch: config.initialViewState.pitch,
        essential: true,
        duration: 2000,
      });
    }
  }, [config.initialViewState]);

  /**
   * Get user's current location
   */
  const handleGeolocate = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const map = mapRef.current;
          
          if (map) {
            map.flyTo({
              center: [longitude, latitude],
              zoom: 12,
              duration: 2000,
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          onError?.(new Error('Could not get current location'));
        }
      );
    }
  }, [onError]);

  /**
   * Effect to apply filters to map
   */
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    
    const map = mapRef.current.getMap();
    
    // Here we will apply filters to layers
    // For now just debug logging
    console.log('Applying filters:', filters);
  }, [filters, isMapLoaded]);
  console.log('isMapLoaded ', isMapLoaded);
  return {
    // References
    mapRef,
    
    // States
    viewState,
    isMapLoaded,
    cursor,
    hoveredFeature,
    
    // Main handlers
    handleViewStateChange,
    handleMapClick,
    handleMapLoad,
    handleMapError,
    handleMouseMove,
    
    // Map actions
    handleResetView,
    handleGeolocate,
  };
}

export default useMapViewer;