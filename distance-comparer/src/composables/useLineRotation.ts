/**
 * T043: Line Rotation Composable
 * Manages rotation interactions for distance lines
 */
import { ref, type Ref } from 'vue'
import L from 'leaflet'
import type { Coordinate } from '../types/map.types'

interface UseLineRotationOptions {
  /** Leaflet map instance */
  map: Ref<L.Map | null>
  /** Initial bearing in degrees (0-360, 0 = North) */
  initialBearing?: number
  /** Callback when rotation starts */
  onRotationStart?: (bearing: number) => void
  /** Callback during rotation */
  onRotate?: (bearing: number) => void
  /** Callback when rotation ends */
  onRotationEnd?: (bearing: number) => void
}

export function useLineRotation(options: UseLineRotationOptions) {
  const {
    map,
    initialBearing = 0,
    onRotationStart,
    onRotate,
    onRotationEnd,
  } = options

  // T043: Rotation state
  const bearing = ref<number>(initialBearing) // 0-360 degrees, 0 = North
  const isRotating = ref(false)
  const rotationAnchor = ref<Coordinate | null>(null)

  // Internal state for mouse rotation
  let animationFrameId: number | null = null

  /**
   * Normalize bearing to 0-360 range
   */
  const normalizeBearing = (deg: number): number => {
    let normalized = deg % 360
    if (normalized < 0) normalized += 360
    return normalized
  }

  /**
   * T044: Calculate bearing from anchor point to cursor position
   */
  const calculateBearingFromMouse = (
    anchor: Coordinate,
    mouseLatLng: L.LatLng
  ): number => {
    // Calculate angle between anchor and mouse position
    const dy = mouseLatLng.lat - anchor.lat
    const dx = mouseLatLng.lng - anchor.lng

    // Calculate angle in radians, then convert to degrees
    // atan2 returns angle from -180 to 180, we need 0-360 with 0 = North
    let angleDeg = (Math.atan2(dx, dy) * 180) / Math.PI
    
    // Normalize to 0-360
    return normalizeBearing(angleDeg)
  }

  /**
   * T044: Start mouse rotation
   */
  const startMouseRotation = (anchor: Coordinate): void => {
    if (!map.value) return

    isRotating.value = true
    rotationAnchor.value = anchor

    onRotationStart?.(bearing.value)

    // Listen for mousemove
    map.value.on('mousemove', handleMouseMove)
    map.value.on('mouseup', endMouseRotation)

    // Prevent map interaction during rotation
    map.value.dragging.disable()
  }

  /**
   * T044: Handle mouse move during rotation
   */
  const handleMouseMove = (e: L.LeafletMouseEvent): void => {
    if (!isRotating.value || !rotationAnchor.value || !map.value) return

    // T051: Use RAF for smooth updates (throttle to 30fps minimum)
    if (animationFrameId !== null) return

    animationFrameId = requestAnimationFrame(() => {
      animationFrameId = null

      if (!isRotating.value || !rotationAnchor.value) return

      const newBearing = calculateBearingFromMouse(rotationAnchor.value, e.latlng)
      bearing.value = newBearing

      onRotate?.(newBearing)
    })
  }

  /**
   * End mouse rotation
   */
  const endMouseRotation = (): void => {
    if (!map.value) return

    isRotating.value = false

    // Cancel any pending animation frame
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    // Re-enable map interaction
    map.value.dragging.enable()

    // Remove listeners
    map.value.off('mousemove', handleMouseMove)
    map.value.off('mouseup', endMouseRotation)

    onRotationEnd?.(bearing.value)
  }

  /**
   * Rotate bearing by delta degrees
   */
  const rotateBearing = (deltaDegrees: number): void => {
    const newBearing = normalizeBearing(bearing.value + deltaDegrees)
    bearing.value = newBearing
    onRotate?.(newBearing)
  }

  /**
   * Set bearing to specific value
   */
  const setBearing = (newBearing: number): void => {
    bearing.value = normalizeBearing(newBearing)
  }

  /**
   * Reset bearing to initial value
   */
  const reset = (): void => {
    bearing.value = initialBearing
    isRotating.value = false
    rotationAnchor.value = null
  }

  /**
   * Cleanup rotation state
   */
  const cleanup = (): void => {
    if (map.value) {
      map.value.off('mousemove', handleMouseMove)
      map.value.off('mouseup', endMouseRotation)
      map.value.dragging.enable()
    }

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    reset()
  }

  return {
    // State
    bearing,
    isRotating,
    rotationAnchor,

    // Methods
    startMouseRotation,
    endMouseRotation,
    rotateBearing,
    setBearing,
    reset,
    cleanup,
  }
}
