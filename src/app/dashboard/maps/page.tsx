/**
 * @fileoverview Geospatial maps visualization page
 */

"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/templates';
import { MapViewer } from '@/components/organisms';
import { Button } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { createMapConfig } from '@/lib/mapUtils';
import useMapsPage from '@/hooks/useMapsPage';
import type { ForestLayer } from '@/types/map';
import { useEffect } from 'react';

/**
 * Main map page with hierarchical navigation
 * Following composition and single responsibility principles
 */
export default function MapsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();

  const {
    viewState,
    setViewState,
    filters,
    setFilters,
    isMapLoading,
    mapError,
    setMapError,
    controlsPanelOpen,
    setControlsPanelOpen,
    geoHierarchy,
    treeSpecies,
    isLoadingTreeSpecies,
    treeSpeciesError,
    forestLayers,
    cadastreLayers,
    isLoadingForest,
    isLoadingCadastre,
    handleViewStateChange,
    handleMapClick,
    handleMapLoad,
    toggleLayer,
    handleRegionFilter,
    handleDepartmentFilter,
    clearFilters,
    selectedRegion,
    selectedDepartment,
    selectedCommune,
    setSelectedCommune,
  } = useMapsPage();
  useEffect(() => {
    let cfg: any = null;
    try {
      cfg = createMapConfig({});
      setMapError(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating map config:', error);
      setMapError(error instanceof Error ? error.message : 'Configuration error');
    }
  }, [setMapError]);

  let mapConfig: any = null;
  if (!mapError) {
    try {
      mapConfig = createMapConfig({});
    } catch (error) {
      mapConfig = null;
    }
  }

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Do not render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Maps' },
  ];

  return (
    <DashboardLayout 
      pageTitle="Mapas Forestales"
      breadcrumbs={breadcrumbs}
    >
      <div className="h-[calc(100vh-8rem)] flex">
        {/* Sidebar controls panel */}
          <div className={cn(
          "transition-all duration-300 shrink-0 bg-white border-r border-gray-200",
          controlsPanelOpen ? "w-80" : "w-12"
        )}>
          {/* Panel header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {controlsPanelOpen && <h2 className="font-medium text-gray-900">Controls</h2>}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setControlsPanelOpen(!controlsPanelOpen)}
            >
              {controlsPanelOpen ? '‹' : '›'}
            </Button>
          </div>

          {controlsPanelOpen && (
            <div className="p-4 space-y-6">
              {/* Hierarchical navigation */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Location</h3>
                
                {/* Region selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Region</label>
                  <select 
                    value={selectedRegion}
                    onChange={(e) => handleRegionFilter(e.target.value)}
                    disabled={geoHierarchy.regions.isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-black"
                  >
                    <option value="">{geoHierarchy.regions.isLoading ? 'Loading regions...' : 'All regions'}</option>
                    {geoHierarchy.regions.data.map((region) => (
                      <option key={region.id} value={region.code}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                  {geoHierarchy.regions.error && (
                    <p className="text-xs text-red-500">Error loading regions</p>
                  )}
                </div>

                {/* Department selector */}
                {selectedRegion && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">Department</label>
                    <select 
                      value={selectedDepartment}
                      onChange={(e) => handleDepartmentFilter(e.target.value)}
                      disabled={geoHierarchy.departments.isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm  disabled:bg-gray-50 text-black"
                    >
                        <option value="">
                          {geoHierarchy.departments.isLoading ? 'Loading departments...' : 'All departments'}
                        </option>
                      {geoHierarchy.departments.data.map(dept => (
                        <option key={dept.id} value={dept.code}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Selector de comuna */}
                {selectedDepartment && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">Commune</label>
                    <select 
                      value={selectedCommune}
                      onChange={(e) => setSelectedCommune(e.target.value)}
                      disabled={geoHierarchy.communes.isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-black"
                    >
                        <option value="">
                          {geoHierarchy.communes.isLoading ? 'Loading communes...' : 'All communes'}
                        </option>
                      {geoHierarchy.communes.data.map(commune => (
                        <option key={commune.id} value={commune.code}>
                          {commune.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Botón para limpiar filtros */}
                <Button variant="secondary" size="sm" onClick={clearFilters} className="w-full">
                  🗑️ Clear filters
                </Button>
              </div>

              {/* Control de capas */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Forest Layers</h3>
                
                {isLoadingForest ? (
                  <div className="text-xs text-gray-500">Loading layers...</div>
                ) : forestLayers.length > 0 ? (
                  forestLayers.map((layer: ForestLayer) => (
                    <div key={layer.id} className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={layer.visible}
                          onChange={() => toggleLayer(layer.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-black">{layer.name}</span>
                      </label>
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: layer.type === 'forest' ? '#228B22' : '#4169E1' }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500">No layers available</div>
                )}

                {/* Control de especies de árboles */}
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">Tree species</label>
                  {isLoadingTreeSpecies ? (
                    <div className="text-xs text-gray-500">Loading species...</div>
                  ) : (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {treeSpecies?.map((species) => (
                        <label key={species.id} className="flex items-center space-x-2 text-xs">
                          <input
                            type="checkbox"
                            checked={filters.treeSpecies?.includes(species.id) || false}
                            onChange={(e) => {
                              const currentSpecies = filters.treeSpecies || [];
                              console.log('currentSpecies ', currentSpecies);
                              setFilters((prev) => ({
                                ...prev,
                                treeSpecies: e.target.checked ? [...currentSpecies, species.id] : currentSpecies.filter((id) => id !== species.id),
                              }));
                            }}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: species.color }} />
                          <span className='text-black'>{species.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Control para mostrar catastro */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.showCadastre}
                      onChange={(e) => setFilters((prev) => ({ ...prev, showCadastre: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Cadastre parcels</span>
                  </label>
                  <div className="w-4 h-4 rounded border bg-blue-400" />
                </div>
              </div>

              {/* Información actual */}
                <div className="space-y-2 text-xs text-gray-600 border-t border-gray-200 pt-4">
                  <div>🌍 View: {viewState ? `${viewState.latitude.toFixed(3)}, ${viewState.longitude.toFixed(3)}` : 'Loading...'}</div>
                  <div>🔍 Zoom: {viewState ? viewState.zoom.toFixed(1) : '-'}</div>
                  <div>📊 Active layers: {forestLayers.filter((l: ForestLayer) => l.visible).length}</div>
                  <div>🌲 Species: {filters.treeSpecies?.length || 0} selected</div>
                  {geoHierarchy.isLoadingAny && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                      <span>Loading data...</span>
                    </div>
                  )}
                </div>
            </div>
          )}
        </div>

        {/* Contenedor del mapa */}
        <div className="flex-1 relative">
          {mapError ? (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="max-w-md mx-auto text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-6xl mb-4">🗺️</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Mapbox configuration error</h2>
                <p className="text-gray-600 mb-4">{mapError}</p>
                <div className="space-y-3 text-sm text-left bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium text-gray-700">Pasos para solucionarlo:</div>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Ve a <a href="https://account.mapbox.com/access-tokens/" target="_blank" className="text-blue-600 hover:underline">account.mapbox.com</a></li>
                    <li>Crea una cuenta gratuita</li>
                    <li>Copia tu token público (pk.xxxxx)</li>
                    <li>Añádelo en <code className="bg-gray-200 px-1 rounded">.env.local</code></li>
                    <li>Reinicia el servidor</li>
                  </ol>
                </div>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  🔄 Retry
                </Button>
              </div>
            </div>
          ) : mapConfig ? (
            <MapViewer
              config={mapConfig}
              filters={filters}
              layers={forestLayers}
              cadastreLayers={cadastreLayers}
              isLoading={isMapLoading || isLoadingForest || isLoadingCadastre}
              onViewStateChange={handleViewStateChange}
              onClick={handleMapClick}
              onLoad={handleMapLoad}
              onError={(error) => {
                // eslint-disable-next-line no-console
                console.error('Map error:', error);
                setMapError(error.message);
              }}
              className="h-full"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}