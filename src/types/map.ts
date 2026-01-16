/**
 * @fileoverview Tipos TypeScript para funcionalidades de mapas
 * Siguiendo principios SOLID y definiciones claras de interfaces
 */

import type { LayerProps as MapboxLayerProps } from 'react-map-gl/mapbox';

export type LayerProps = MapboxLayerProps;

export interface MapViewState {
  /** Latitud del centro del mapa */
  latitude: number;
  /** Longitud del centro del mapa */
  longitude: number;
  /** Nivel de zoom del mapa */
  zoom: number;
  /** Bearing (rotación) del mapa */
  bearing: number;
  /** Pitch (inclinación) del mapa */
  pitch: number;
}

/**
 * Configuración inicial del mapa
 */
export interface MapConfig {
  /** Token de acceso de Mapbox */
  accessToken: string;
  /** Estilo del mapa */
  mapStyle?: string;
  /** Estado inicial de la vista */
  initialViewState: MapViewState;
  /** Controles habilitados */
  controls?: {
    navigation: boolean;
    fullscreen: boolean;
    geolocate: boolean;
    scale: boolean;
  };
}

/**
 * Datos de regiones administrativas francesas
 */
export interface FrenchRegion {
  id: string;
  name: string;
  code: string;
  departments: FrenchDepartment[];
}

export interface FrenchDepartment {
  id: string;
  name: string;
  code: string;
  regionId: string;
  communes: FrenchCommune[];
}

export interface FrenchCommune {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  lieuxDits: FrenchLieuxDit[];
}

export interface FrenchLieuxDit {
  id: string;
  name: string;
  communeId: string;
  geometry: GeoJSON.Geometry;
}

/**
 * Tipos para capas de datos forestales (BD Forêt)
 */
export interface ForestLayer {
  id: string;
  name: string;
  type: 'forest' | 'species' | 'parcel';
  visible: boolean;
  opacity: number;
  species?: string;
  geoData: GeoJSON.FeatureCollection;
  source?: ForestDataSource;
}

export interface CadastreLayer {
  id: string;
  name: string;
  type: 'cadastre';
  visible: boolean;
  opacity: number;
  geoData: GeoJSON.FeatureCollection;
  commune?: string;
}

export interface ForestDataSource {
  type: 'geojson' | 'vector' | 'raster';
  url: string;
  layer?: string;
}

/**
 * Especies de árboles del BD Forêt
 */
export interface TreeSpecies {
  id: string;
  name: string;
  scientificName: string;
  code: string;
  color: string;
}

/**
 * Datos de parcelas catastrales
 */
export interface CadastreParcel {
  id: string;
  reference: string;
  geometry: GeoJSON.Polygon;
  area: number;
  owner?: string;
  landUse: string;
}

/**
 * Filtros para el mapa
 */
export interface MapFilters {
  /** Región seleccionada */
  region?: string;
  /** Departamento seleccionado */
  department?: string;
  /** Comuna seleccionada */
  commune?: string;
  /** Especies de árboles visibles */
  treeSpecies?: string[];
  /** Mostrar parcelas catastrales */
  showCadastre: boolean;
  /** Rango de fechas para datos forestales */
  dateRange?: {
    from: Date;
    to: Date;
  };
}

/**
 * Estado del mapa guardado por usuario
 */
export interface SavedMapState {
  /** ID del usuario */
  userId: string;
  /** Estado de la vista del mapa */
  viewState: MapViewState;
  /** Filtros aplicados */
  filters: MapFilters;
  /** Capas visibles */
  visibleLayers: string[];
  /** Última actualización */
  updatedAt: Date;
}

/**
 * Props para eventos del mapa
 */
export interface MapEventHandlers {
  /** Callback cuando cambia la vista del mapa */
  onViewStateChange?: (viewState: MapViewState) => void;
  /** Callback cuando se hace click en el mapa */
  onClick?: (event: { lng: number; lat: number; features?: any[] }) => void;
  /** Callback cuando se carga el mapa */
  onLoad?: (map: mapboxgl.Map) => void;
  /** Callback cuando ocurre un error */
  onError?: (error: Error) => void;
}

/**
 * Props del componente principal del mapa
 */
export interface MapViewerProps extends MapEventHandlers {
  /** Configuración del mapa */
  config: MapConfig;
  /** Filtros activos */
  filters?: MapFilters;
  /** Capas de bosque a mostrar */
  layers?: ForestLayer[];
  /** Capas de cadastre a mostrar */
  cadastreLayers?: CadastreLayer[];
  /** Altura del contenedor */
  height?: string | number;
  /** Ancho del contenedor */
  width?: string | number;
  /** Clase CSS adicional */
  className?: string;
  /** Si está cargando */
  isLoading?: boolean;
}

/**
 * Response de la API para datos geoespaciales
 */
export interface GeospatialApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Parámetros para consultas geoespaciales
 */
export interface GeospatialQuery {
  /** Bounding box para la consulta */
  bbox?: [number, number, number, number];
  /** Nivel de zoom para optimizar datos */
  zoom: number;
  /** Filtros específicos */
  filters?: MapFilters;
  /** Límite de resultados */
  limit?: number;
  /** Página para paginación */
  page?: number;
}

/**
 * Props para el componente MapViewer
 */
export interface MapViewerProps {
  /** Configuración del mapa */
  config: MapConfig;
  /** Filtros activos */
  filters?: MapFilters;
  /** Capas forestales a mostrar */
  layers?: ForestLayer[];
  /** Capas de cadastre a mostrar */
  cadastreLayers?: CadastreLayer[];
  /** Altura del mapa */
  height?: string | number;
  /** Ancho del mapa */
  width?: string | number;
  /** Clases CSS adicionales */
  className?: string;
  /** Indica si el mapa está cargando */
  isLoading?: boolean;
  /** Callback cuando cambia el estado de vista */
  onViewStateChange?: (viewState: MapViewState) => void;
  /** Callback cuando se hace click en el mapa */
  onClick?: (event: { lng: number; lat: number; features?: any[] }) => void;
  /** Callback cuando el mapa se carga */
  onLoad?: (map: mapboxgl.Map) => void;
  /** Callback cuando ocurre un error */
  onError?: (error: Error) => void;
}