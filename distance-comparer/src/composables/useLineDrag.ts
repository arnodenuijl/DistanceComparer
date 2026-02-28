/**
 * T023: Line Endpoint Drag Composable
 * Manages draggable endpoint interactions with real-time line updates
 * FIXED: Use map events instead of Leaflet.Draggable for proper lat/lng tracking
 */
import { ref, shallowRef, type Ref } from 'vue'
import L from 'leaflet'
import type { Coordinate } from '../types/map.types'

interface UseLineDragOptions {
  /** Leaflet map instance */
  map: Ref<L.Map | null>
  /** Callback when drag operation starts */
  onDragStart?: (endpoint: 'start' | 'end', position: Coordinate) => void
  /** Callback during drag (called with debounce) */
  onDrag?: (endpoint: 'start' | 'end', position: Coordinate) => void
  /** Callback when drag operation ends */
  onDragEnd?: (endpoint: 'start' | 'end', position: Coordinate) => void
  /** Debounce interval for drag updates in milliseconds (default: 16ms for 60fps) */
  debounceMs?: number
}

interface DraggableEndpoint {
  marker: L.Marker | L.CircleMarker
  type: 'start' | 'end'
}

export function useLineDrag(options: UseLineDragOptions) {
  const {
    map,
    onDragStart,
    onDrag,
    onDragEnd,
    debounceMs = 16, // T025: 16ms debounce for 60fps
  } = options

  // T023: Drag state management
  const isDragging = ref(false)
  const draggedEndpoint = ref<'start' | 'end' | null>(null)

  // Store draggable endpoints
  const draggableEndpoints = shallowRef<Map<'start' | 'end', DraggableEndpoint>>(new Map())

  // Debounce timer for drag updates
  let dragDebounceTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * Handle map mousemove during drag
   */
  const handleMapMouseMove = (e: L.LeafletMouseEvent): void => {
    if (!isDragging.value || !draggedEndpoint.value) return

    const endpoint = draggableEndpoints.value.get(draggedEndpoint.value)
    if (!endpoint) return

    // Update marker position to follow mouse
    endpoint.marker.setLatLng(e.latlng)

    const position: Coordinate = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    }

    // T025: Debounce drag updates
    if (dragDebounceTimer) {
      clearTimeout(dragDebounceTimer)
    }

    dragDebounceTimer = setTimeout(() => {
      onDrag?.(draggedEndpoint.value!, position)
    }, debounceMs)
  }

  /**
   * Handle map mouseup during drag
   */
  const handleMapMouseUp = (): void => {
    if (!isDragging.value || !draggedEndpoint.value || !map.value) return

    const currentDraggedEndpoint = draggedEndpoint.value
    const endpoint = draggableEndpoints.value.get(currentDraggedEndpoint)

    // Clear any pending debounced updates
    if (dragDebounceTimer) {
      clearTimeout(dragDebounceTimer)
      dragDebounceTimer = null
    }

    // Update final position
    const finalLatLng = endpoint?.marker.getLatLng()
    if (finalLatLng) {
      const position: Coordinate = {
        lat: finalLatLng.lat,
        lng: finalLatLng.lng,
      }

      // T030: Reset cursor
      if (endpoint) {
        const element = endpoint.marker.getElement() as HTMLElement | null
        if (element) {
          element.style.cursor = 'grab'
        }
      }

      // Re-enable map dragging
      map.value.dragging.enable()

      // Remove map event listeners
      map.value.off('mousemove', handleMapMouseMove)
      map.value.off('mouseup', handleMapMouseUp)

      isDragging.value = false
      draggedEndpoint.value = null

      // T029: Trigger distance recalculation via callback
      onDragEnd?.(currentDraggedEndpoint, position)
    }
  }

  /**
   * T024: Make a marker endpoint draggable using map events
   */
  const makeDraggable = (
    marker: L.Marker | L.CircleMarker,
    endpointType: 'start' | 'end'
  ): void => {
    if (!map.value) {
      return
    }

    // Store endpoint reference
    draggableEndpoints.value.set(endpointType, {
      marker,
      type: endpointType,
    })

    // T030: Set cursor to grab
    const element = marker.getElement() as HTMLElement | null
    if (element) {
      element.style.cursor = 'grab'
    }

    // T026: Handle mousedown on marker to start drag
    marker.on('mousedown', (e: L.LeafletMouseEvent) => {
      if (!map.value) return

      // Prevent map from dragging
      map.value.dragging.disable()

      isDragging.value = true
      draggedEndpoint.value = endpointType

      const latLng = marker.getLatLng()
      const position: Coordinate = {
        lat: latLng.lat,
        lng: latLng.lng,
      }

      // T030: Update cursor to grabbing
      if (element) {
        element.style.cursor = 'grabbing'
      }

      // Add map event listeners
      map.value.on('mousemove', handleMapMouseMove)
      map.value.on('mouseup', handleMapMouseUp)

      onDragStart?.(endpointType, position)

      // Prevent event from propagating to map
      L.DomEvent.stopPropagation(e.originalEvent)
    })
  }

  /**
   * Remove draggable behavior from an endpoint
   */
  const removeDraggable = (endpointType: 'start' | 'end'): void => {
    const endpoint = draggableEndpoints.value.get(endpointType)
    if (!endpoint) return

    // Remove marker event listeners
    endpoint.marker.off('mousedown')

    draggableEndpoints.value.delete(endpointType)
  }

  /**
   * Enable drag for both endpoints
   */
  const enableDrag = (
    startMarker: L.CircleMarker,
    endMarker: L.Marker | L.CircleMarker
  ): void => {
    makeDraggable(startMarker, 'start')
    makeDraggable(endMarker, 'end')

    // T030: Set initial cursor to grab
    const startElement = startMarker.getElement() as HTMLElement | null
    if (startElement) {
      startElement.style.cursor = 'grab'
    }
    const endElement = endMarker.getElement() as HTMLElement | null
    if (endElement) {
      endElement.style.cursor = 'grab'
    }
  }

  /**
   * Disable drag for both endpoints
   */
  const disableDrag = (): void => {
    removeDraggable('start')
    removeDraggable('end')
  }

  /**
   * Cleanup all draggable instances
   */
  const cleanup = (): void => {
    // Clear debounce timer
    if (dragDebounceTimer) {
      clearTimeout(dragDebounceTimer)
      dragDebounceTimer = null
    }

    // Remove map event listeners if still active
    if (map.value) {
      map.value.off('mousemove', handleMapMouseMove)
      map.value.off('mouseup', handleMapMouseUp)
      map.value.dragging.enable()
    }

    // Remove all draggable instances
    disableDrag()

    // Reset state
    isDragging.value = false
    draggedEndpoint.value = null
  }

  return {
    // State
    isDragging,
    draggedEndpoint,

    // Methods
    makeDraggable,
    removeDraggable,
    enableDrag,
    disableDrag,
    cleanup,
  }
}
