/**
 * @fileoverview Exports de hooks personalizados
 */

export { useLocalStorage } from './useLocalStorage';
export { useFormWithValidation } from './useFormValidation';
export { useLoginMutation, useRegisterMutation, useLogoutMutation } from './useAuthMutations';
export { useGeoLayers, useForestLayers, useCadastreLayers } from './useGeoLayers';
export { useMapViewer } from './useMapViewer';
export { useDebounce, useDebounceCallback } from './useDebounce';
export { useLoadingState } from './useLoadingState';
export {
  useRegions,
  useDepartments,
  useCommunes,
  useAdministrativeBoundary,
  useForestData,
  useTreeSpecies,
  useCadastreData,
  useGeoHierarchy,
} from './useGeoData';
export { default as useMapsPage } from './useMapsPage';