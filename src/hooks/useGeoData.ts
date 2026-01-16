/**
 * @fileoverview Hook for handling geospatial data with TanStack Query
 * Optimizing cache and loading states for maps
 */

import { useQuery } from '@tanstack/react-query';
import {
  getRegions,
  getDepartments,
  getCommunes,
  getAdministrativeBoundary,
  getForestData,
  getTreeSpecies,
  getCadastreData
} from '@/services/geoService';
import type {
  FrenchRegion,
  FrenchDepartment,
  FrenchCommune,
  TreeSpecies,
  CadastreParcel,
  GeospatialQuery
} from '@/types/map';

/**
 * Hook to get French regions
 */
export function useRegions() {
  return useQuery({
    queryKey: ['geo', 'regions'],
    queryFn: () => getRegions(),
    staleTime: 1000 * 60 * 60, // 1 hour - administrative data changes rarely
    gcTime: 1000 * 60 * 60 * 24, // 24 hours in cache
  });
}

/**
 * Hook to get departments of a region
 */
export function useDepartments(regionCode?: string) {
  return useQuery({
    queryKey: ['geo', 'departments', regionCode],
    queryFn: () => getDepartments(regionCode!),
    enabled: !!regionCode,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours in cache
  });
}

/**
 * Hook to get communes of a department
 */
export function useCommunes(departmentCode?: string) {
  return useQuery({
    queryKey: ['geo', 'communes', departmentCode],
    queryFn: () => getCommunes(departmentCode!),
    enabled: !!departmentCode,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours in cache
  });
}

/**
 * Hook to get administrative boundary (for zoom)
 */
export function useAdministrativeBoundary(
  type?: 'region' | 'departement' | 'commune',
  code?: string
) {
  return useQuery({
    queryKey: ['geo', 'boundary', type, code],
    queryFn: () => getAdministrativeBoundary(type!, code!),
    enabled: !!(type && code),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 4, // 4 hours in cache
  });
}

/**
 * Hook to get forest data BD Forêt®
 */
export function useForestData(query?: GeospatialQuery) {
  return useQuery({
    queryKey: ['geo', 'forest', query],
    queryFn: () => getForestData(query!),
    enabled: !!query,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes in cache
  });
}

/**
 * Hook to get available tree species
 */
export function useTreeSpecies() {
  return useQuery({
    queryKey: ['geo', 'tree-species'],
    queryFn: () => getTreeSpecies(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - rarely change
    gcTime: 1000 * 60 * 60 * 48, // 48 hours in cache
  });
}

/**
 * Hook to get cadastral data
 */
export function useCadastreData(query?: GeospatialQuery) {
  return useQuery({
    queryKey: ['geo', 'cadastre', query],
    queryFn: () => getCadastreData(query!),
    enabled: !!query,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes in cache
  });
}

/**
 * Composite hook for complete hierarchical navigation
 */
export function useGeoHierarchy(filters: {
  region?: string;
  department?: string;
  commune?: string;
}) {
  const regionsQuery = useRegions();
  const departmentsQuery = useDepartments(filters.region);
  const communesQuery = useCommunes(filters.department);

  return {
    regions: {
      data: regionsQuery.data || [],
      isLoading: regionsQuery.isLoading,
      error: regionsQuery.error,
    },
    departments: {
      data: departmentsQuery.data || [],
      isLoading: departmentsQuery.isLoading,
      error: departmentsQuery.error,
    },
    communes: {
      data: communesQuery.data || [],
      isLoading: communesQuery.isLoading,
      error: communesQuery.error,
    },
    isLoadingAny: regionsQuery.isLoading || departmentsQuery.isLoading || communesQuery.isLoading,
    hasError: !!(regionsQuery.error || departmentsQuery.error || communesQuery.error),
  };
}