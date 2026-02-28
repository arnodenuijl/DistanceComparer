/**
 * Core Leaflet map composable
 * Handles map initialization, cleanup, and basic operations
 * T013-T017: useLeafletMap implementation
 */

import { ref, shallowRef, onMounted, onUnmounted, type Ref } from 'vue'
import L from 'leaflet'
import type { Coordinate, MapConfig, TileLayerConfig, LoadingState } from '../types/map.types'

export interface UseLeafletMapOptions {
  /** DOM element reference for map container */
  container: Ref<HTMLElement | null>
  /** Map configuration */
  config: MapConfig
  /** Tile layer configuration */
  tileConfig: TileLayerConfig
}

export function useLeafletMap(options: UseLeafletMapOptions) {
  const { container, config, tileConfig } = options

  // Use shallowRef to prevent Vue reactivity on Leaflet objects
  const map = shallowRef<L.Map | null>(null)
  const tileLayer = shallowRef<L.TileLayer | null>(null)
  
  const isReady = ref(false)
  const loadingState = ref<LoadingState>('idle')
  const error = ref<{ message: string; code: string } | null>(null)

  // T014: Initialize map on mount
  onMounted(() => {
    if (!container.value) {
      error.value = {
        code: 'INIT_FAILED',
        message: 'Map container element not found',
      }
      loadingState.value = 'error'
      return
    }

    try {
      loadingState.value = 'loading'

      // Create Leaflet map instance
      map.value = L.map(container.value, {
        center: [config.center.lat, config.center.lng],
        zoom: config.zoom,
        minZoom: config.minZoom,
        maxZoom: config.maxZoom,
        zoomControl: true,
        attributionControl: true,
      })

      // Create and add tile layer
      tileLayer.value = L.tileLayer(tileConfig.urlTemplate, {
        attribution: tileConfig.attribution,
        maxZoom: tileConfig.maxZoom,
        minZoom: tileConfig.minZoom,
        subdomains: tileConfig.subdomains || ['a', 'b', 'c'],
      })

      tileLayer.value.addTo(map.value)

      // Mark as ready
      isReady.value = true
      loadingState.value = 'idle'
      error.value = null
    } catch (err) {
      console.error('Failed to initialize map:', err)
      error.value = {
        code: 'INIT_FAILED',
        message: err instanceof Error ? err.message : 'Unknown error',
      }
      loadingState.value = 'error'
      isReady.value = false
    }
  })

  // T015: Cleanup on unmount
  onUnmounted(() => {
    if (map.value) {
      map.value.remove()
      map.value = null
      tileLayer.value = null
    }
  })

  // T016: Basic exposed methods
  const getCenter = (): Coordinate | null => {
    if (!map.value) return null
    const center = map.value.getCenter()
    return { lat: center.lat, lng: center.lng }
  }

  const getZoom = (): number | null => {
    if (!map.value) return null
    return map.value.getZoom()
  }

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

  const panTo = (center: Coordinate, options?: { animate?: boolean }): void => {
    if (!map.value) return
    map.value.panTo([center.lat, center.lng], {
      animate: options?.animate ?? true,
    })
  }

  const zoomIn = (): void => {
    if (!map.value) return
    map.value.zoomIn()
  }

  const zoomOut = (): void => {
    if (!map.value) return
    map.value.zoomOut()
  }

  const invalidateSize = (): void => {
    if (!map.value) return
    map.value.invalidateSize()
  }

  const getBounds = () => {
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
    // T017: State
    map,
    isReady,
    loadingState,
    error,

    // T016: Methods
    getCenter,
    getZoom,
    setView,
    panTo,
    zoomIn,
    zoomOut,
    invalidateSize,
    getBounds,
  }
}
