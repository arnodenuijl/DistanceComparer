/**
 * Map navigation composable
 * Tracks interaction state and provides navigation methods
 * T047-T051: useMapNavigation implementation
 */

import { ref, type Ref } from 'vue'
import type L from 'leaflet'
import type { Coordinate, Bounds, InputMode } from '../types/map.types'

export interface UseMapNavigationOptions {
  /** Leaflet map instance */
  map: Ref<L.Map | null>
}

export function useMapNavigation(options: UseMapNavigationOptions) {
  const { map } = options

  // T048: Track interaction state
  const isDragging = ref(false)
  const isZooming = ref(false)
  const inputMode = ref<InputMode>('mouse')

  // T049: Pan to specific coordinates
  const panTo = (
    center: Coordinate,
    options?: { animate?: boolean; duration?: number }
  ): void => {
    if (!map.value) return
    
    map.value.panTo([center.lat, center.lng], {
      animate: options?.animate ?? true,
      duration: options?.duration ? options.duration / 1000 : 0.3,
    })
  }

  // T050: Zoom in/out methods
  const zoomIn = (options?: { animate?: boolean }): void => {
    if (!map.value) return
    map.value.zoomIn(1, {
      animate: options?.animate ?? true,
    })
  }

  const zoomOut = (options?: { animate?: boolean }): void => {
    if (!map.value) return
    map.value.zoomOut(1, {
      animate: options?.animate ?? true,
    })
  }

  const setZoom = (zoom: number, options?: { animate?: boolean }): void => {
    if (!map.value) return
    map.value.setZoom(zoom, {
      animate: options?.animate ?? true,
    })
  }

  // T051: Fit bounds method
  const fitBounds = (
    bounds: Bounds,
    options?: { padding?: number; animate?: boolean }
  ): void => {
    if (!map.value) return

    const leafletBounds = new (window as any).L.LatLngBounds(
      [bounds.south, bounds.west],
      [bounds.north, bounds.east]
    )

    map.value.fitBounds(leafletBounds, {
      padding: options?.padding ? [options.padding, options.padding] : [0, 0],
      animate: options?.animate ?? true,
    })
  }

  // Set view with both center and zoom
  const setView = (
    center: Coordinate,
    zoom: number,
    options?: { animate?: boolean; duration?: number }
  ): void => {
    if (!map.value) return
    
    map.value.setView([center.lat, center.lng], zoom, {
      animate: options?.animate ?? true,
      duration: options?.duration ? options.duration / 1000 : 0.3,
    })
  }

  // Pan by pixel offset (useful for keyboard navigation)
  const panBy = (x: number, y: number, options?: { animate?: boolean }): void => {
    if (!map.value) return
    map.value.panBy([x, y], {
      animate: options?.animate ?? true,
    })
  }

  // Get current state
  const getCenter = (): Coordinate | null => {
    if (!map.value) return null
    const center = map.value.getCenter()
    return { lat: center.lat, lng: center.lng }
  }

  const getZoom = (): number | null => {
    if (!map.value) return null
    return map.value.getZoom()
  }

  const getBounds = (): Bounds | null => {
    if (!map.value) return null
    const bounds = map.value.getBounds()
    return {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    }
  }

  return {
    // T048: State
    isDragging,
    isZooming,
    inputMode,

    // T049-T051: Navigation methods
    panTo,
    panBy,
    zoomIn,
    zoomOut,
    setZoom,
    setView,
    fitBounds,
    
    // Query methods
    getCenter,
    getZoom,
    getBounds,
  }
}
