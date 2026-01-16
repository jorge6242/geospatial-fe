/**
 * useMapsPage
 * Hook that centralizes map page state and handlers to keep the page component slim
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createDefaultFilters } from '@/lib/mapUtils';
import type { MapViewState, MapFilters, ForestLayer } from '@/types/map';
import { useGeoLayers, useGeoHierarchy, useTreeSpecies } from '@/hooks';

export default function useMapsPage() {
  const [viewState, setViewState] = useState<MapViewState>({
    latitude: 46.2276,
    longitude: 2.2137,
    zoom: 6,
    bearing: 0,
    pitch: 0,
  });

  const [filters, setFilters] = useState<MapFilters>(createDefaultFilters());
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedCommune, setSelectedCommune] = useState<string>('');

  const [controlsPanelOpen, setControlsPanelOpen] = useState(true);

  // Domain hooks
  const geoHierarchy = useGeoHierarchy({
    region: selectedRegion || undefined,
    department: selectedDepartment || undefined,
    commune: selectedCommune || undefined,
  });

  const treeSpeciesQuery = useTreeSpecies();

  const {
    forestLayers: fetchedForestLayers,
    cadastreLayers,
    isLoadingForest,
    isLoadingCadastre,
    forestError,
    cadastreError,
  } = useGeoLayers({
    viewState,
    filters,
    enabled: !!viewState && !mapError,
  });

  // Track which layers are visible (for UI toggles)
  const [visibleLayerIds, setVisibleLayerIds] = useState<Set<string>>(new Set());

  // Combine fetched layers with visibility state
  const forestLayers = useMemo(() => {
    return fetchedForestLayers.map(layer => ({
      ...layer,
      visible: visibleLayerIds.has(layer.id)
    }));
  }, [fetchedForestLayers, visibleLayerIds]);

  // Sync visible layer IDs when fetched layers change
  useEffect(() => {
    const fetchedIds = new Set(fetchedForestLayers.map(l => l.id));
    const fetchedIdsString = JSON.stringify([...fetchedIds].sort());

    setVisibleLayerIds(prev => {
      const prevIdsString = JSON.stringify([...prev].sort());

      // Only update if the set of IDs actually changed
      if (prevIdsString === fetchedIdsString) {
        return prev;
      }

      const newSet = new Set(prev);
      // Add any new layer IDs that aren't already tracked
      fetchedForestLayers.forEach(layer => {
        if (!newSet.has(layer.id)) {
          newSet.add(layer.id); // Default to visible
        }
      });
      // Remove IDs that are no longer in fetched layers
      for (const id of newSet) {
        if (!fetchedIds.has(id)) {
          newSet.delete(id);
        }
      }
      return newSet;
    });
  }, [fetchedForestLayers]);

  const toggleLayer = useCallback((layerId: string) => {
    setVisibleLayerIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
      } else {
        newSet.add(layerId);
      }
      return newSet;
    });
  }, []);

  const handleViewStateChange = useCallback((newViewState: MapViewState) => {
    setViewState(newViewState);
  }, []);

  const handleMapClick = useCallback((event: { lng: number; lat: number; features?: any[] }) => {
    const { features } = event;
    if (features && features.length > 0) {
      const feature = features[0];
      if (feature.properties?.type === 'region') {
        setSelectedRegion(feature.properties.id);
      } else if (feature.properties?.type === 'department') {
        setSelectedDepartment(feature.properties.id);
      } else if (feature.properties?.type === 'commune') {
        setSelectedCommune(feature.properties.id);
      }
    }
  }, []);

  const loadInitialLayers = useCallback(() => {
    // Set all fetched layers as visible by default
    setVisibleLayerIds(new Set(fetchedForestLayers.map(layer => layer.id)));
    // eslint-disable-next-line no-console
    console.log('Initial layers loaded:', fetchedForestLayers.length);
  }, [fetchedForestLayers]);

  const handleMapLoad = useCallback((map: mapboxgl.Map) => {
    // eslint-disable-next-line no-console
    setIsMapLoading(false);
    loadInitialLayers();
  }, [loadInitialLayers]);

  const handleRegionFilter = useCallback((regionId: string) => {
    setFilters((prev) => ({ ...prev, region: regionId, department: undefined, commune: undefined }));
    setSelectedRegion(regionId);
  }, []);

  const handleDepartmentFilter = useCallback((departmentId: string) => {
    setFilters((prev) => ({ ...prev, department: departmentId, commune: undefined }));
    setSelectedDepartment(departmentId);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(createDefaultFilters());
    setSelectedRegion('');
    setSelectedDepartment('');
    setSelectedCommune('');
  }, []);

  return {
    viewState,
    setViewState,
    filters,
    setFilters,
    isMapLoading,
    setIsMapLoading,
    mapError,
    setMapError,
    selectedRegion,
    setSelectedRegion,
    selectedDepartment,
    setSelectedDepartment,
    selectedCommune,
    setSelectedCommune,
    controlsPanelOpen,
    setControlsPanelOpen,
    geoHierarchy,
    treeSpecies: treeSpeciesQuery.data || [],
    isLoadingTreeSpecies: treeSpeciesQuery.isLoading,
    treeSpeciesError: treeSpeciesQuery.error,
    forestLayers,
    cadastreLayers,
    isLoadingForest,
    isLoadingCadastre,
    forestError,
    cadastreError,
    handleViewStateChange,
    handleMapClick,
    handleMapLoad,
    toggleLayer,
    loadInitialLayers,
    handleRegionFilter,
    handleDepartmentFilter,
    clearFilters,
  } as const;
}
