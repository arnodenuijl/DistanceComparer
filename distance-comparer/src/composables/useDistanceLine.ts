/**
 * Distance Line State Management Composable
 * T010, T012, T013, T017, T022: Line state, rendering, distance calculation, single-line constraint
 * Based on quickstart.md Phase 3
 */

import { ref, computed, shallowRef } from 'vue'
import type { Ref } from 'vue'
import L from 'leaflet'
import type {
  DistanceLine,
  Coordinate,
  LineStyle,
} from '../types/map.types'
import { useGeodesic } from './useGeodesic'
import { DEFAULT_LINE_STYLE } from '../config/map.config'

export interface UseDistanceLineOptions {
  /** Leaflet map instance */
  map: Ref<L.Map | null>
  /** Which map side this line belongs to */
  side: 'left' | 'right'
  /** Custom styling overrides */
  style?: Partial<LineStyle>
}

/**
 * Composable for managing distance line state and rendering
 * Handles line creation, updates, and cleanup
 */
export function useDistanceLine(options: UseDistanceLineOptions) {
  const { map, side, style: customStyle } = options
  const { calculateDistance, calculateBearing, formatDistance } = useGeodesic()

  // T010: Line state
  const line = ref<DistanceLine | null>(null)

  // T012, T013: Leaflet objects (shallowRef to avoid Vue reactivity wrapping)
  const polyline = shallowRef<L.Polyline | null>(null)
  const startMarker = shallowRef<L.CircleMarker | null>(null)
  const endMarker = shallowRef<L.Marker | null>(null)

  // Merge custom style with defaults
  const lineStyle: LineStyle = {
    ...DEFAULT_LINE_STYLE,
    ...customStyle,
  }

  // Computed properties
  const isVisible = computed(() => line.value !== null)
  const distanceMeters = computed(() => line.value?.distanceMeters ?? 0)
  const distanceDisplay = computed(() => {
    if (!line.value) return ''
    return formatDistance(line.value.distanceMeters)
  })

  // T057: Edge case detection for zero-length lines
  const isZeroLength = computed(() => {
    if (!line.value) return false
    return line.value.distanceMeters < 1 // Less than 1 meter considered zero-length
  })

  // T058: Check if line extends beyond current viewport
  const isOutsideViewport = computed(() => {
    if (!line.value || !map.value) return false
    
    const bounds = map.value.getBounds()
    const startInView = bounds.contains([line.value.startPoint.lat, line.value.startPoint.lng])
    const endInView = bounds.contains([line.value.endPoint.lat, line.value.endPoint.lng])
    
    // Line is outside if both endpoints are out of view
    // (Partial visibility is acceptable)
    return !startInView && !endInView
  })

  /**
   * T010: Create new line from two points
   * T017: Calculate distance on creation
   * T022: Single-line constraint - clears existing line before creating new one
   */
  function createLine(start: Coordinate, end: Coordinate): DistanceLine {
    // T022: Clear existing line (single-line constraint per FR-011)
    if (line.value) {
      clearLine()
    }

    // T017: Calculate distance using geodesic formula
    const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng)
    const bearing = side === 'right' ? calculateBearing(start, end) : undefined

    // T057: Warn if creating zero-length line
    if (distance < 1) {
      console.warn('[DistanceLine] Creating zero-length line (< 1m). Rotation disabled.')
    }

    const newLine: DistanceLine = {
      id: `line-${side}-${Date.now()}`,
      startPoint: start,
      endPoint: end,
      distanceMeters: distance,
      bearing,
    }

    line.value = newLine
    renderLine()

    return newLine
  }

  /**
   * T010: Update line endpoint and recalculate distance
   * For right map: maintains locked distance, only updates bearing
   */
  function updateEndpoint(
    endpointType: 'start' | 'end',
    newPosition: Coordinate
  ): void {
    if (!line.value) return

    // Right map: maintain locked distance, update bearing
    if (side === 'right') {
      const lockedDistance = line.value.distanceMeters
      const { calculateDestinationPoint } = useGeodesic()

      if (endpointType === 'start') {
        // Dragging start point: lock bearing, move start, recalculate end at locked distance
        const lockedBearing = line.value.bearing ?? 0
        line.value.startPoint = newPosition
        
        // Recalculate end point at locked distance and locked bearing from new start
        line.value.endPoint = calculateDestinationPoint(
          newPosition,
          lockedDistance,
          lockedBearing
        )
      } else {
        // Dragging end point: keep start, calculate bearing to new position, snap to locked distance
        const bearing = calculateBearing(line.value.startPoint, newPosition)
        line.value.bearing = bearing
        
        // Snap end point to locked distance from start
        line.value.endPoint = calculateDestinationPoint(
          line.value.startPoint,
          lockedDistance,
          bearing
        )
      }

      renderLine()
      return
    }

    // Left map: normal behavior - update endpoint and recalculate distance
    if (endpointType === 'start') {
      line.value.startPoint = newPosition
    } else {
      line.value.endPoint = newPosition
    }

    // Recalculate distance
    line.value.distanceMeters = calculateDistance(
      line.value.startPoint.lat,
      line.value.startPoint.lng,
      line.value.endPoint.lat,
      line.value.endPoint.lng
    )

    renderLine()
  }

  /**
   * T012: Render Leaflet polyline
   * T013: Render CircleMarker endpoints with fixed lat/lng
   */
  function renderLine(): void {
    if (!map.value || !line.value) return

    const { startPoint, endPoint } = line.value

    // Remove existing layers
    cleanupLayers()

    // T012: Create polyline connecting the two points
    polyline.value = L.polyline(
      [
        [startPoint.lat, startPoint.lng],
        [endPoint.lat, endPoint.lng],
      ],
      {
        color: lineStyle.color,
        weight: lineStyle.weight,
        opacity: lineStyle.opacity,
        dashArray: lineStyle.dashArray,
      }
    ).addTo(map.value)

    // T013: Create endpoint markers anchored to geographic coordinates
    // Start marker: circle to indicate starting point
    startMarker.value = L.circleMarker([startPoint.lat, startPoint.lng], {
      radius: lineStyle.endpointRadius,
      fillColor: lineStyle.endpointFillColor,
      fillOpacity: 1,
      color: lineStyle.endpointBorderColor,
      weight: lineStyle.endpointBorderWeight,
    }).addTo(map.value)

    // End marker: arrow pointing in direction of bearing
    const { calculateBearing } = useGeodesic()
    const bearing = calculateBearing(startPoint, endPoint)
    
    const arrowIcon = L.divIcon({
      className: 'arrow-marker',
      html: `<div style="
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 16px solid ${lineStyle.endpointFillColor};
        transform: rotate(${bearing}deg);
        transform-origin: center 12px;
        filter: drop-shadow(0 0 2px rgba(0,0,0,0.3));
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 12],
    })

    endMarker.value = L.marker([endPoint.lat, endPoint.lng], {
      icon: arrowIcon,
    }).addTo(map.value)
  }

  /**
   * T010: Clear line from map
   * T022: Allows clearing without creating replacement
   */
  function clearLine(): void {
    cleanupLayers()
    line.value = null
  }

  /**
   * Helper: Remove all Leaflet layers
   */
  function cleanupLayers(): void {
    if (!map.value) return

    if (polyline.value) {
      map.value.removeLayer(polyline.value)
      polyline.value = null
    }
    if (startMarker.value) {
      map.value.removeLayer(startMarker.value)
      startMarker.value = null
    }
    if (endMarker.value) {
      map.value.removeLayer(endMarker.value)
      endMarker.value = null
    }
  }

  /**
   * Update distance for synchronized line (right map)
   * Preserves bearing while updating distance
   * Creates line if it doesn't exist yet
   */
  function updateDistance(newDistanceMeters: number): void {
    if (side !== 'right' || !map.value) return

    const { calculateDestinationPoint } = useGeodesic()

    // If no line exists yet, create one at map center with 0° bearing
    if (!line.value) {
      const mapCenter = map.value.getCenter()
      const startPoint: Coordinate = {
        lat: mapCenter.lat,
        lng: mapCenter.lng,
      }

      // Calculate endpoint at 0° bearing (North) with given distance
      const endPoint = calculateDestinationPoint(startPoint, newDistanceMeters, 0)

      createLine(startPoint, endPoint)
      return
    }

    // Update existing line
    const bearing = line.value.bearing ?? 0

    // Calculate new endpoint based on distance and bearing
    const newEndPoint = calculateDestinationPoint(
      line.value.startPoint,
      newDistanceMeters,
      bearing
    )

    line.value.endPoint = newEndPoint
    line.value.distanceMeters = newDistanceMeters

    renderLine()
  }

  /**
   * T047: Set bearing for line (right map only)
   * Used for rotation
   */
  function setBearing(newBearing: number): void {
    if (!line.value || side !== 'right') return
    
    line.value.bearing = newBearing
  }

  return {
    // State
    line,
    polyline,
    startMarker,
    endMarker,
    isVisible,
    distanceMeters,
    distanceDisplay,
    isZeroLength, // T057: Edge case detection
    isOutsideViewport, // T058: Viewport overflow detection
    
    // Methods
    createLine,
    updateEndpoint,
    clearLine,
    renderLine,
    updateDistance,
    setBearing, // T047: Set bearing for rotation
  }
}
