/**
 * @fileoverview LayerRenderer - Component for rendering geospatial layers
 * Implementing SOLID principles for handling BD Forêt® and cadastre layers
 */

'use client';

import React, { useEffect, useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/mapbox';
import type { 
  LayerProps, 
  ForestLayer, 
  CadastreLayer, 
  MapFilters 
} from '@/types/map';
import { 
  generateLayerColor, 
  shouldShowCadastreAtZoom 
} from '@/lib/mapUtils';

interface LayerRendererProps {
  /** Forest layers to render */
  forestLayers: ForestLayer[];
  /** Cadastre layers to render */
  cadastreLayers?: CadastreLayer[];
  /** Active map filters */
  filters: MapFilters;
  /** Current zoom level */
  currentZoom: number;
  /** Callback when a layer is clicked */
  onLayerClick?: (layerId: string, feature: any) => void;
}

/**
 * Component that renders all geospatial layers on the map
 * Following the Single Responsibility principle for layer rendering
 */
export function LayerRenderer({
  forestLayers,
  cadastreLayers = [],
  filters,
  currentZoom,
  onLayerClick
}: LayerRendererProps) {
  
  /**
   * Filter forest layers according to active filters
   */
  const filteredForestLayers = useMemo(() => {
    return forestLayers.filter(layer => {
      // Si no hay filtros de especies, mostrar todas
      if (!filters.treeSpecies || !filters.treeSpecies.length) return true;
      
      // Filtrar por especies seleccionadas
      return layer.species && filters.treeSpecies.includes(layer.species);
    });
  }, [forestLayers, filters.treeSpecies]);

  /**
   * Determine whether to show cadastre layers based on zoom and filters
   */
  const shouldShowCadastre = useMemo(() => {
    return filters.showCadastre && shouldShowCadastreAtZoom(currentZoom);
  }, [filters.showCadastre, currentZoom]);

  /**
   * Configure event listeners for layer clicks
   */
  useEffect(() => {
    if (!onLayerClick) return;

    // Event listeners are handled directly in the MapViewer
    // This effect is for additional configurations if necessary
  }, [onLayerClick]);

  return (
    <>
      {/* Render forest layers */}
      {filteredForestLayers.map((layer, index) => (
        <ForestLayerRenderer
          key={layer.id}
          layer={layer}
          index={index}
          onClick={onLayerClick}
        />
      ))}

      {/* Render cadastre layers if applicable */}
      {shouldShowCadastre && cadastreLayers.map((layer, index) => (
        <CadastreLayerRenderer
          key={layer.id}
          layer={layer}
          index={index}
          onClick={onLayerClick}
        />
      ))}
    </>
  );
}

/**
 * Specific renderer for forest layers
 */
interface ForestLayerRendererProps {
  layer: ForestLayer;
  index: number;
  onClick?: (layerId: string, feature: any) => void;
}

function ForestLayerRenderer({ layer, index, onClick }: ForestLayerRendererProps) {
  const layerColor = generateLayerColor('forest', index);
  
  // Style configuration for forest polygons
  const forestFillLayer: LayerProps = {
    id: `forest-fill-${layer.id}`,
    type: 'fill',
    paint: {
      'fill-color': layerColor,
      'fill-opacity': 0.6,
      'fill-outline-color': layerColor
    },
    filter: ['==', ['get', 'type'], 'forest'],
    layout: {
      visibility: layer.visible ? 'visible' : 'none'
    }
  };

  // Style configuration for forest borders
  const forestLineLayer: LayerProps = {
    id: `forest-line-${layer.id}`,
    type: 'line',
    paint: {
      'line-color': layerColor,
      'line-width': 2,
      'line-opacity': 0.8
    },
    filter: ['==', ['get', 'type'], 'forest'],
    layout: {
      visibility: layer.visible ? 'visible' : 'none'
    }
  };

  // Configuration for species symbols/labels
  const speciesSymbolLayer: LayerProps = {
    id: `species-symbol-${layer.id}`,
    type: 'symbol',
    layout: {
      'text-field': ['get', 'species'],
      'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
      'text-size': 12,
      'text-anchor': 'center',
      visibility: layer.visible ? 'visible' : 'none'
    },
    paint: {
      'text-color': '#2d3748',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1
    },
    filter: ['==', ['get', 'type'], 'forest'],
    minzoom: 10
  };

  return (
    <Source
      id={`forest-source-${layer.id}`}
      type="geojson"
      data={layer.geoData}
    >
      <Layer {...forestFillLayer} />
      <Layer {...forestLineLayer} />
      {layer.species && <Layer {...speciesSymbolLayer} />}
    </Source>
  );
}

/**
 * Specific renderer for cadastre layers
 */
interface CadastreLayerRendererProps {
  layer: CadastreLayer;
  index: number;
  onClick?: (layerId: string, feature: any) => void;
}

function CadastreLayerRenderer({ layer, index, onClick }: CadastreLayerRendererProps) {
  const layerColor = generateLayerColor('parcel', index);
  
  // Style configuration for cadastral parcels
  const cadastreFillLayer: LayerProps = {
    id: `cadastre-fill-${layer.id}`,
    type: 'fill',
    paint: {
      'fill-color': layerColor,
      'fill-opacity': 0.3
    },
    filter: ['==', ['get', 'type'], 'cadastre'],
    layout: {
      visibility: layer.visible ? 'visible' : 'none'
    }
  };

  // Style configuration for parcel borders
  const cadastreLineLayer: LayerProps = {
    id: `cadastre-line-${layer.id}`,
    type: 'line',
    paint: {
      'line-color': layerColor,
      'line-width': 1,
      'line-opacity': 0.7,
      'line-dasharray': [2, 2]
    },
    filter: ['==', ['get', 'type'], 'cadastre'],
    layout: {
      visibility: layer.visible ? 'visible' : 'none'
    }
  };

  // Labels with parcel numbers
  const parcelLabelLayer: LayerProps = {
    id: `parcel-label-${layer.id}`,
    type: 'symbol',
    layout: {
      'text-field': ['get', 'parcelNumber'],
      'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
      'text-size': 10,
      'text-anchor': 'center',
      visibility: layer.visible ? 'visible' : 'none'
    },
    paint: {
      'text-color': '#4a5568',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1
    },
    filter: ['==', ['get', 'type'], 'cadastre'],
    minzoom: 15
  };

  return (
    <Source
      id={`cadastre-source-${layer.id}`}
      type="geojson"
      data={layer.geoData}
    >
      <Layer {...cadastreFillLayer} />
      <Layer {...cadastreLineLayer} />
      <Layer {...parcelLabelLayer} />
    </Source>
  );
}

export default LayerRenderer;