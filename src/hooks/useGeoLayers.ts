/**
 * @fileoverview Hook para manejo de capas geoespaciales
 * Gestiona carga de capas BD Forêt® y cadastre con TanStack Query
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { getForestLayers, getCadastreLayers } from '@/services/geoService';
import type { 
  ForestLayer, 
  CadastreLayer, 
  GeospatialQuery, 
  MapFilters,
  MapViewState 
} from '@/types/map';

interface UseGeoLayersProps {
  viewState: MapViewState;
  filters: MapFilters;
  enabled?: boolean;
}

interface UseGeoLayersReturn {
  forestLayers: ForestLayer[];
  cadastreLayers: CadastreLayer[];
  isLoadingForest: boolean;
  isLoadingCadastre: boolean;
  forestError: Error | null;
  cadastreError: Error | null;
  refetchForest: () => void;
  refetchCadastre: () => void;
}

/**
 * Hook para cargar y manejar capas geoespaciales
 * Integra con react-query para caching optimizado
 */
export function useGeoLayers({
  viewState,
  filters,
  enabled = true
}: UseGeoLayersProps): UseGeoLayersReturn {

  /**
   * Debounce viewState para evitar queries excesivas durante interacciones
   */
  const debouncedViewState = useDebounce(viewState, 300);
  
  /**
   * Crear query para optimizar consultas basadas en vista y filtros
   * Nota: treeSpecies se filtra solo en frontend, no se envía al backend
   */
  const geoQuery = useMemo<GeospatialQuery>(() => ({
    zoom: Math.round(debouncedViewState.zoom),
    bbox: [
      debouncedViewState.longitude - 0.5,
      debouncedViewState.latitude - 0.5,
      debouncedViewState.longitude + 0.5,
      debouncedViewState.latitude + 0.5
    ],
    filters: {
      ...filters,
      treeSpecies: undefined, // No enviar treeSpecies al backend
    },
    limit: 100,
  }), [debouncedViewState, filters]);

  /**
   * Query para capas forestales
   */
  const {
    data: forestLayers = [],
    isLoading: isLoadingForest,
    error: forestError,
    refetch: refetchForest
  } = useQuery({
    queryKey: ['geoLayers', 'forest', {
      ...geoQuery,
      filters: {
        ...geoQuery.filters,
        treeSpecies: undefined, // Excluir treeSpecies del queryKey para evitar re-queries
      }
    }],
    queryFn: () => getForestLayers(geoQuery),
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });

  /**
   * Query para capas de cadastre
   * Solo se carga si el filtro está activo
   */
  const {
    data: cadastreLayers = [],
    isLoading: isLoadingCadastre,
    error: cadastreError,
    refetch: refetchCadastre
  } = useQuery({
    queryKey: ['geoLayers', 'cadastre', geoQuery],
    queryFn: () => getCadastreLayers(geoQuery),
    enabled: enabled && filters.showCadastre && viewState.zoom >= 14,
    staleTime: 10 * 60 * 1000, // 10 minutos para cadastre
    gcTime: 20 * 60 * 1000, // 20 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  /**
   * Filtrar capas forestales según filtros activos
   */

  const filteredForestLayers = useMemo(() => {
    if (!filters.treeSpecies?.length) return forestLayers;
    return forestLayers.filter(layer => 
      filters.treeSpecies?.includes(layer.species || '')
    );
  }, [forestLayers, filters.treeSpecies?.join(',')]); // Use string representation for stability

  return {
    forestLayers: filteredForestLayers,
    cadastreLayers,
    isLoadingForest,
    isLoadingCadastre,
    forestError: forestError as Error | null,
    cadastreError: cadastreError as Error | null,
    refetchForest,
    refetchCadastre,
  };
}

/**
 * Hook simplificado para solo capas forestales
 */
export function useForestLayers(
  viewState: MapViewState,
  filters: MapFilters,
  enabled = true
) {
  const { forestLayers, isLoadingForest, forestError, refetchForest } = useGeoLayers({
    viewState,
    filters,
    enabled
  });

  return {
    layers: forestLayers,
    isLoading: isLoadingForest,
    error: forestError,
    refetch: refetchForest,
  };
}

/**
 * Hook simplificado para solo capas de cadastre
 */
export function useCadastreLayers(
  viewState: MapViewState,
  filters: MapFilters,
  enabled = true
) {
  const { cadastreLayers, isLoadingCadastre, cadastreError, refetchCadastre } = useGeoLayers({
    viewState,
    filters,
    enabled
  });

  return {
    layers: cadastreLayers,
    isLoading: isLoadingCadastre,
    error: cadastreError,
    refetch: refetchCadastre,
  };
}

export default useGeoLayers;