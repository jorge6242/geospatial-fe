/**
 * @fileoverview MapViewer - Main component for map visualization
 * Implements Mapbox GL JS with react-map-gl following SOLID principles
 * Refactored to use useMapViewer hook (Single Responsibility)
 */

'use client';

import React from 'react';
import Map, { NavigationControl, GeolocateControl, FullscreenControl, ScaleControl } from 'react-map-gl/mapbox';
import { MapViewerProps } from '@/types/map';
import { cn, formatDate } from '@/lib/utils';
import { formatCoordinates } from '@/lib/mapUtils';
import { Button } from '@/components/atoms';
import { LayerRenderer } from './LayerRenderer';
import { useMapViewer } from '@/hooks/useMapViewer';
import { useLoadingState } from '@/hooks/useLoadingState';

/**
 * Main map visualization component
 * Now follows the Single Responsibility principle - only renders
 */
export function MapViewer({
  config,
  filters = { showCadastre: false, treeSpecies: [] },
  layers = [],
  cadastreLayers = [],
  height = 'h-full',
  width = 'w-full',
  className,
  isLoading = false,
  onViewStateChange,
  onClick,
  onLoad,
  onError,
}: MapViewerProps) {

  // Toda la lógica del estado ahora está en el hook
  const {
    mapRef,
    viewState,
    isMapLoaded,
    cursor,
    hoveredFeature,
    handleViewStateChange,
    handleMapClick,
    handleMapLoad,
    handleMapError,
    handleMouseMove,
    handleResetView,
    handleGeolocate,
  } = useMapViewer({
    config,
    filters,
    onViewStateChange,
    onClick,
    onLoad,
    onError,
  });

  // Smart loading system - avoids flickering
  const { shouldShowLoading } = useLoadingState(isLoading, {
    delayMs: 300,      // Wait 300ms before showing
    minDisplayMs: 200, // Show minimum 200ms
    isInitialLoad: !isMapLoaded, // Initial if map is not loaded
  });

  return (
    <div className={cn('relative overflow-hidden rounded-lg border border-gray-200', className)}>
      {/* Loading overlay with smart system */}
      {shouldShowLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading map data...</span>
          </div>
        </div>
      )}

      {/* Custom top controls */}
      <div className="absolute top-4 left-4 z-40 flex flex-col space-y-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span>📍</span>
            <span>{formatCoordinates(viewState.latitude, viewState.longitude)}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Zoom: {viewState.zoom.toFixed(1)}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col space-y-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetView}
            className="bg-white border border-gray-200 shadow-sm"
          >
            🇫🇷 Francia
          </Button>
          
          {config.controls?.geolocate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGeolocate}
              className="bg-white border border-gray-200 shadow-sm"
            >
              📍 Mi ubicación
            </Button>
          )}
        </div>
      </div>

      {/* Feature information on hover */}
      {hoveredFeature && (
        <div className="absolute top-4 right-4 z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
          <h3 className="font-medium text-sm text-gray-900 mb-1">
            {hoveredFeature.properties?.name || 'Feature'}
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            {hoveredFeature.properties?.type && (
              <div>Type: {hoveredFeature.properties.type}</div>
            )}
            {hoveredFeature.properties?.area && (
              <div>Area: {hoveredFeature.properties.area} ha</div>
            )}
          </div>
        </div>
      )}
      
      {/* Main map */}
      <div className={cn(height, width)}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={handleViewStateChange}
          onClick={handleMapClick}
          onLoad={handleMapLoad}
          onError={handleMapError}
          onMouseMove={handleMouseMove}
          mapStyle={config.mapStyle}
          mapboxAccessToken={config.accessToken}
          cursor={cursor}
          interactiveLayerIds={layers.flatMap(layer => [
            `forest-fill-${layer.id}`,
            `forest-line-${layer.id}`,
            `species-symbol-${layer.id}`,
          ])}
          maxZoom={18}
          minZoom={3}
          doubleClickZoom={true}
          dragRotate={true}
          dragPan={true}
          scrollZoom={true}
          touchZoomRotate={true}
          keyboard={true}
          attributionControl={false}
        >
          {/* Controles de navegación */}
          {config.controls?.navigation && (
            <NavigationControl 
              position="bottom-right" 
              showCompass={true}
              showZoom={true}
            />
          )}
          
          {/* Control de geolocalización */}
          {config.controls?.geolocate && (
            <GeolocateControl
              position="bottom-right"
              positionOptions={{ enableHighAccuracy: true }}
              trackUserLocation={false}
              showUserHeading={true}
            />
          )}
          
          {/* Control de pantalla completa */}
          {config.controls?.fullscreen && (
            <FullscreenControl position="bottom-right" />
          )}
          
          {/* Escala del mapa */}
          {config.controls?.scale && (
            <ScaleControl 
              position="bottom-left"
              maxWidth={200}
              unit="metric"
            />
          )}

          {/* Renderizar capas geoespaciales */}
          <LayerRenderer
            forestLayers={layers}
            cadastreLayers={cadastreLayers}
            filters={filters}
            currentZoom={viewState.zoom}
            onLayerClick={(layerId, feature) => {
              // Propagar evento click de capa
              onClick?.({
                lng: feature.geometry?.coordinates?.[0] || 0,
                lat: feature.geometry?.coordinates?.[1] || 0,
                features: [feature]
              });
            }}
          />
        </Map>
      </div>

      {/* Footer with information */}
      <div className="absolute bottom-4 left-4 z-40">
        <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600">
          Powered by Mapbox GL JS • {formatDate(new Date())}
        </div>
      </div>
    </div>
  );
}