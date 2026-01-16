/**
 * @fileoverview Service for French geospatial data
 * Handles BD Forêt®, administrative divisions and cadastre
 * Refactored with pure functions following React paradigm
 */

import { apiClient, addAuthHeader } from './api';
import type {
  FrenchRegion,
  FrenchDepartment,
  FrenchCommune,
  TreeSpecies,
  CadastreParcel,
  GeospatialApiResponse,
  GeospatialQuery,
  ForestLayer,
  CadastreLayer,
} from '@/types/map';

/**
 * Base URLs for French public APIs
 */
const APIS = {
  // French Government API for administrative divisions
  GEO_API: 'https://geo.api.gouv.fr',
  // Geoportail WMS service for BD Forêt®
  IGN_WMS: 'https://geoservices.ign.fr/bdforet',
  // Cadastre API
  CADASTRE_API: 'https://cadastre.data.gouv.fr/data/etalab-cadastre/latest',
} as const;

/**
 * Get all French regions
 */
export async function getRegions(): Promise<FrenchRegion[]> {
  try {
    const response = await fetch(`${APIS.GEO_API}/regions`);
    const regions = await response.json();

    return regions.map((region: any) => ({
      id: region.code,
      name: region.nom,
      code: region.code,
      departments: [], // Loaded dynamically
    }));
  } catch (error) {
    console.error('Error getting regions:', error);
    // Fallback with mocked data
    return getMockRegions();
  }
}

/**
 * Get departments of a region
 */
export async function getDepartments(regionCode: string): Promise<FrenchDepartment[]> {
  try {
    const response = await fetch(`${APIS.GEO_API}/regions/${regionCode}/departements`);
    const departments = await response.json();

    return departments.map((dept: any) => ({
      id: dept.code,
      name: dept.nom,
      code: dept.code,
      regionId: regionCode,
      communes: [], // Loaded dynamically
    }));
  } catch (error) {
    console.error('Error getting departments:', error);
    return getMockDepartments(regionCode);
  }
}

/**
 * Get communes of a department
 */
export async function getCommunes(departmentCode: string): Promise<FrenchCommune[]> {
  try {
    const response = await fetch(`${APIS.GEO_API}/departements/${departmentCode}/communes`);
    const communes = await response.json();

    return communes.map((commune: any) => ({
      id: commune.code,
      name: commune.nom,
      code: commune.code,
      departmentId: departmentCode,
      lieuxDits: [], // Loaded dynamically
    }));
  } catch (error) {
    console.error('Error getting communes:', error);
    return getMockCommunes(departmentCode);
  }
}

/**
 * Get geometry of an administrative division
 * For zooming and showing boundaries
 */
export async function getAdministrativeBoundary(
  type: 'region' | 'departement' | 'commune',
  code: string
): Promise<GeoJSON.FeatureCollection> {
  try {
    const response = await fetch(
      `${APIS.GEO_API}/${type}s/${code}?format=geojson&geometry=contour`
    );
    return await response.json();
  } catch (error) {
    console.error(`Error getting ${type} boundary:`, error);
    return getMockBoundary(type, code);
  }
}

/**
 * Get forest data (BD Forêt®) for an area
 */

/**
 * Get forest data (BD Forêt®) from real API
 * @param query - GeospatialQuery with filters (must include species)
 * @returns FeatureCollection of forest parcels
 */
export async function getForestData(query: GeospatialQuery): Promise<GeoJSON.FeatureCollection> {
  try {
    // Build real endpoint URL
    const species = query.filters?.treeSpecies?.[0];
    const params = species ? { species } : {};

    const config = addAuthHeader({
      method: 'GET',
      url: '/geo/forest',
      params
    });
    const response = await apiClient(config);
    const data = response.data;
    if (!data || !data.features) {
      throw new Error('Invalid response from forest API');
    }
    return data;
  } catch (error) {
    console.error('Error getting forest data:', error);
    // No fallback: only return empty if fails
    return { type: 'FeatureCollection', features: [] };
  }
}

/**
 * Get available tree species
 */
export async function getTreeSpecies(): Promise<TreeSpecies[]> {
  try {
    const config = addAuthHeader({
      method: 'GET',
      url: '/geo/species'
    });
    const response = await apiClient(config);
    const data = response.data;
    if (!Array.isArray(data)) {
      throw new Error('Invalid response from species endpoint');
    }
    console.log('data ', data);
    return data.map((species: any) => ({
      id: species.id,
      name: species.name,
      scientificName: species.scientificName,
      code: species.code,
      color: species.color,
    }));
  } catch (error) {
    console.error('Error getting species:', error);
    return [];
  }
}

/**
 * Get cadastral parcels for a specific area
 */
export async function getCadastreData(query: GeospatialQuery): Promise<CadastreParcel[]> {
  try {
    // Simulation - in production it would be real cadastre API
    return getMockCadastreData(query);
  } catch (error) {
    console.error('Error getting cadastre:', error);
    return [];
  }
}

/**
 * Create forest layers from GeoJSON data
 */
export async function getForestLayers(query: GeospatialQuery): Promise<ForestLayer[]> {
  try {
    const forestData = await getForestData(query);
    console.log('forestData ', forestData);
    // Group features by species to create separate layers
    const layersBySpecies = new Map<string, GeoJSON.Feature[]>();
    forestData.features.forEach(feature => {
      const speciesName = feature.properties?.species || 'unknown';
      if (!layersBySpecies.has(speciesName)) {
        layersBySpecies.set(speciesName, []);
      }
      layersBySpecies.get(speciesName)?.push(feature);
    });

    // Create one layer per species using commonName from first feature
    const forestLayers: ForestLayer[] = [];
    for (const [speciesName, features] of layersBySpecies.entries()) {
      const firstFeature = features[0];
      const commonName = firstFeature?.properties?.commonName || speciesName;

      // Normalize speciesName to speciesId to match treeSpecies ids
      const speciesId = normalizeSpeciesToId(speciesName);
      const layerId = `forest-${speciesId}`;

      forestLayers.push({
        id: layerId,
        name: commonName,
        type: 'forest',
        visible: true,
        opacity: 0.7,
        species: speciesId, // Use normalized ID instead of raw name
        geoData: {
          type: 'FeatureCollection',
          features: features,
        }
      });
    }
    console.log('forestLayers ', forestLayers)
    return forestLayers;
  } catch (error) {
    console.error('Error creating forest layers:', error);
    return [];
  }
}

/**
 * Create cadastre layers from data
 */
export async function getCadastreLayers(query: GeospatialQuery): Promise<CadastreLayer[]> {
  try {
    const cadastreData = await getCadastreData(query);

    // Convert parcels to GeoJSON FeatureCollection
    const features: GeoJSON.Feature[] = cadastreData.map(parcel => ({
      type: 'Feature',
      properties: {
        id: parcel.id,
        type: 'cadastre',
        parcelNumber: parcel.reference,
        area: parcel.area,
        landUse: parcel.landUse,
        owner: parcel.owner,
      },
      geometry: parcel.geometry,
    }));

    if (features.length === 0) return [];

    return [{
      id: 'cadastre-parcels',
      name: 'Cadastral parcels',
      type: 'cadastre',
      visible: true,
      opacity: 0.4,
      commune: query.filters?.commune,
      geoData: {
        type: 'FeatureCollection',
        features: features,
      }
    }];
  } catch (error) {
    console.error('Error creating cadastre layers:', error);
    return [];
  }
}

/**
 * Mock data for development/testing
 */
function getMockRegions(): FrenchRegion[] {
  return [
    {
      id: '75',
      name: 'Nouvelle-Aquitaine',
      code: '75',
      departments: [],
    },
    {
      id: '76',
      name: 'Occitanie',
      code: '76',
      departments: [],
    },
    {
      id: '84',
      name: 'Auvergne-Rhône-Alpes',
      code: '84',
      departments: [],
    },
  ];
}

function getMockDepartments(regionCode: string): FrenchDepartment[] {
  const deptMap: Record<string, FrenchDepartment[]> = {
    '75': [
      { id: '33', name: 'Gironde', code: '33', regionId: '75', communes: [] },
      { id: '40', name: 'Landes', code: '40', regionId: '75', communes: [] },
    ],
    '76': [
      { id: '31', name: 'Haute-Garonne', code: '31', regionId: '76', communes: [] },
      { id: '34', name: 'Hérault', code: '34', regionId: '76', communes: [] },
    ],
  };

  return deptMap[regionCode] || [];
}

function getMockCommunes(departmentCode: string): FrenchCommune[] {
  return [
    {
      id: `${departmentCode}001`,
      name: `Commune 1 (${departmentCode})`,
      code: `${departmentCode}001`,
      departmentId: departmentCode,
      lieuxDits: [],
    },
    {
      id: `${departmentCode}002`,
      name: `Commune 2 (${departmentCode})`,
      code: `${departmentCode}002`,
      departmentId: departmentCode,
      lieuxDits: [],
    },
  ];
}

function getMockBoundary(
  type: string,
  code: string
): GeoJSON.FeatureCollection {
  // Simplified geometry of France
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          code,
          type,
          name: `${type} ${code}`,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [2.2, 46.2], [2.5, 46.5], [2.8, 46.2], [2.5, 45.9], [2.2, 46.2]
          ]],
        },
      },
    ],
  };
}

function getMockForestData(query: GeospatialQuery): GeoJSON.FeatureCollection {
  // Generate several forest parcels with different species
  const features = [
    {
      type: 'Feature' as const,
      properties: {
        id: 'forest_1',
        type: 'forest',
        species: 'Pinus sylvestrissssssssss',
        commonName: 'Pin sylvestre',
        area: 125.5,
        density: 0.75,
        age: '40-60',
        biomass: 280,
        carbonStock: 140,
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [2.3, 46.3], [2.35, 46.32], [2.38, 46.29], [2.33, 46.27], [2.3, 46.3]
        ]],
      },
    },
    {
      type: 'Feature' as const,
      properties: {
        id: 'forest_2',
        type: 'forest',
        species: 'Quercus robur',
        commonName: 'Chêne pédonculé',
        area: 89.2,
        density: 0.68,
        age: '60-80',
        biomass: 420,
        carbonStock: 210,
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [2.4, 46.35], [2.45, 46.37], [2.47, 46.33], [2.42, 46.31], [2.4, 46.35]
        ]],
      },
    },
    {
      type: 'Feature' as const,
      properties: {
        id: 'forest_3',
        type: 'forest',
        species: 'Fagus sylvatica',
        commonName: 'Hêtre commun',
        area: 67.8,
        density: 0.82,
        age: '20-40',
        biomass: 180,
        carbonStock: 90,
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [2.32, 46.25], [2.37, 46.27], [2.39, 46.23], [2.34, 46.21], [2.32, 46.25]
        ]],
      },
    },
    {
      type: 'Feature' as const,
      properties: {
        id: 'forest_4',
        type: 'forest',
        species: 'Abies alba',
        commonName: 'Sapin blanc',
        area: 203.4,
        density: 0.71,
        age: '80-100',
        biomass: 380,
        carbonStock: 190,
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [2.25, 46.4], [2.3, 46.43], [2.35, 46.4], [2.3, 46.37], [2.25, 46.4]
        ]],
      },
    },
  ];

  // Filter by species if specified in filters
  let filteredFeatures = features;
  if (query.filters?.treeSpecies?.length) {
    filteredFeatures = features.filter(feature =>
      query.filters?.treeSpecies?.includes(feature.properties.species)
    );
  }

  return {
    type: 'FeatureCollection',
    features: filteredFeatures,
  };
}

function getMockTreeSpecies(): TreeSpecies[] {
  return [
    {
      id: 'pinus_sylvestris',
      name: 'Pin sylvestre',
      scientificName: 'Pinus sylvestris',
      code: 'PISY',
      color: '#2E7D32',
    },
    {
      id: 'quercus_robur',
      name: 'Chêne pédonculé',
      scientificName: 'Quercus robur',
      code: 'QURO',
      color: '#558B2F',
    },
    {
      id: 'fagus_sylvatica',
      name: 'Hêtre commun',
      scientificName: 'Fagus sylvatica',
      code: 'FASY',
      color: '#33691E',
    },
    {
      id: 'abies_alba',
      name: 'Sapin blanc',
      scientificName: 'Abies alba',
      code: 'ABAL',
      color: '#1B5E20',
    },
    {
      id: 'picea_abies',
      name: 'Épicéa commun',
      scientificName: 'Picea abies',
      code: 'PIAB',
      color: '#4CAF50',
    },
    {
      id: 'betula_pendula',
      name: 'Bouleau verruqueux',
      scientificName: 'Betula pendula',
      code: 'BEPE',
      color: '#689F38',
    },
  ];
}

function getMockCadastreData(query: GeospatialQuery): CadastreParcel[] {
  return [
    {
      id: 'parcel_1',
      reference: 'AB0123',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [2.31, 46.31], [2.32, 46.32], [2.33, 46.31], [2.32, 46.30], [2.31, 46.31]
        ]],
      },
      area: 2.5,
      landUse: 'Forêt',
    },
  ];
}

/**
 * Normalize scientific species name to consistent ID
 * Example: "Pinus sylvatissssssssss" -> "pinus_sylvestris"
 */
function normalizeSpeciesToId(speciesName: string): string {
  return speciesName
    .toLowerCase()
    .replace(/\s+/g, '_') // spaces to underscores
    .replace(/[^a-z0-9_]/g, '') // only letters, numbers and underscores
    .replace(/_+/g, '_') // multiple underscores to one
    .replace(/^_|_$/g, ''); // remove underscores from start/end
}

// Default export as object for backward compatibility
const geoService = {
  getRegions,
  getDepartments,
  getCommunes,
  getAdministrativeBoundary,
  getForestData,
  getTreeSpecies,
  getCadastreData,
  getForestLayers,
  getCadastreLayers,
};

export default geoService;