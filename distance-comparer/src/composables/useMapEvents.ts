/**
 * Map events composable - Event adapter pattern
 * Translates Leaflet events to Vue component events with debouncing
 * T041-T046: useMapEvents implementation
 */

import { ref, watch, onUnmounted, type Ref } from 'vue'
import type L from 'leaflet'
import type { Coordinate, Bounds } from '../types/map.types'
import { EVENT_DEBOUNCE_DELAY } from '../config/map.config'

export interface UseMapEventsOptions {
  /** Leaflet map instance */
  map: Ref<L.Map | null>
  /** Debounce delay in milliseconds */
  debounceDelay?: number
}

export interface MapEventCallbacks {
  onCenterChanged?: (center: Coordinate) => void
  onZoomChanged?: (zoom: number) => void
  onBoundsChanged?: (bounds: Bounds) => void
  onLoadingStart?: () => void
  onLoadingEnd?: (success: boolean) => void
  onError?: (error: { code: string; message: string }) => void
}

export function useMapEvents(options: UseMapEventsOptions, callbacks: MapEventCallbacks) {
  const { map, debounceDelay = EVENT_DEBOUNCE_DELAY } = options

  const isLoading = ref(false)
  
  // Debounce timers
  let moveEndTimeout: ReturnType<typeof setTimeout>
  let zoomEndTimeout: ReturnType<typeof setTimeout>

  // T042: Attach moveend event listener with debouncing
  const handleMoveEnd = () => {
    clearTimeout(moveEndTimeout)
    moveEndTimeout = setTimeout(() => {
      if (!map.value) return
      
      // T045: Convert Leaflet event data to plain objects
      const center = map.value.getCenter()
      const plainCenter: Coordinate = {
        lat: center.lat,
        lng: center.lng,
      }
      
      callbacks.onCenterChanged?.(plainCenter)
      
      // Also emit bounds changed
      const bounds = map.value.getBounds()
      const plainBounds: Bounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      }
      callbacks.onBoundsChanged?.(plainBounds)
    }, debounceDelay)
  }

  // T043: Attach zoomend event listener with debouncing
  const handleZoomEnd = () => {
    clearTimeout(zoomEndTimeout)
    zoomEndTimeout = setTimeout(() => {
      if (!map.value) return
      
      // T045: Extract zoom as plain number
      const zoom = map.value.getZoom()
      callbacks.onZoomChanged?.(zoom)
    }, debounceDelay)
  }

  // Loading event handlers
  const handleLoadingStart = () => {
    isLoading.value = true
    callbacks.onLoadingStart?.()
  }

  const handleLoadingEnd = () => {
    isLoading.value = false
    callbacks.onLoadingEnd?.(true)
  }

  // Tile error handler
  const handleTileError = (error: any) => {
    callbacks.onError?.({
      code: 'TILE_LOAD_FAILED',
      message: `Failed to load tile: ${error.tile?.src || 'unknown'}`,
    })
  }

  // Watch for map initialization
  watch(
    map,
    (mapInstance) => {
      if (!mapInstance) return

      // T042-T043: Attach Leaflet event listeners
      mapInstance.on('moveend', handleMoveEnd)
      mapInstance.on('zoomend', handleZoomEnd)
      mapInstance.on('loading', handleLoadingStart)
      mapInstance.on('load', handleLoadingEnd)
      mapInstance.on('tileerror', handleTileError)
    },
    { immediate: true }
  )

  // T046: Cleanup on unmount
  onUnmounted(() => {
    clearTimeout(moveEndTimeout)
    clearTimeout(zoomEndTimeout)

    if (map.value) {
      map.value.off('moveend', handleMoveEnd)
      map.value.off('zoomend', handleZoomEnd)
      map.value.off('loading', handleLoadingStart)
      map.value.off('load', handleLoadingEnd)
      map.value.off('tileerror', handleTileError)
    }
  })

  return {
    isLoading,
  }
}
