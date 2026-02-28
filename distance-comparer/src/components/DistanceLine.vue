<template>
  <!-- T014: DistanceLine component integrating composables -->
  <!-- T053: ARIA labels for accessibility -->
  <div 
    class="distance-line"
    role="application"
    :aria-label="`Distance measurement tool for ${props.side} map`"
  >
    <!-- T054: Screen reader announcements for distance changes -->
    <div 
      class="sr-only" 
      role="status" 
      aria-live="polite" 
      aria-atomic="true"
    >
      {{ screenReaderText }}
    </div>

    <!-- Slot for custom distance label display -->
    <slot
      :line="line"
      :distance-display="distanceDisplay"
      :is-creating="lineCreation.isActive.value"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Distance Line Component
 * T014: Component integration
 * T016: Event emission
 * T020: Map event listeners
 * T021: Cleanup on unmount
 * T026-T028: Drag event emissions
 * T032: Draggable prop control
 * T046: Rotation support
 * T048: Rotation event emission
 * T050: Keyboard rotation listeners
 * T053-T054: Accessibility (ARIA, screen reader)
 */
import { watch, onMounted, onUnmounted, toRef, ref } from 'vue'
import type L from 'leaflet'
import type { DistanceLine as DistanceLineType, Coordinate } from '../types/map.types'
import { useDistanceLine } from '../composables/useDistanceLine'
import { useLineCreation } from '../composables/useLineCreation'
import { useLineDrag } from '../composables/useLineDrag'
import { useLineRotation } from '../composables/useLineRotation'

// T014: Component props
interface Props {
  /** Leaflet map instance */
  map: L.Map | null
  /** Which map side (left or right) */
  side: 'left' | 'right'
  /** Whether creation mode is active */
  creationMode?: boolean
  /** T032: Whether endpoints are draggable */
  draggable?: boolean
  /** T052: Whether line is rotatable (right map only) */
  rotatable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  creationMode: false,
  draggable: true,
  rotatable: false,
})

// T016: Event emissions
const emit = defineEmits<{
  'line-created': [payload: {
    line: DistanceLineType
    timestamp: number
  }]
  'distance-changed': [payload: {
    distanceMeters: number
    distanceDisplay: string
    startPoint: { lat: number; lng: number }
    endPoint: { lat: number; lng: number }
    timestamp: number
  }]
  // T026: Drag start event
  'endpoint-drag-start': [payload: {
    endpoint: 'start' | 'end'
    position: Coordinate
    timestamp: number
  }]
  // T027: Drag event (debounced)
  'endpoint-drag': [payload: {
    endpoint: 'start' | 'end'
    position: Coordinate
    timestamp: number
  }]
  // T028: Drag end event
  'endpoint-drag-end': [payload: {
    endpoint: 'start' | 'end'
    position: Coordinate
    timestamp: number
  }]  // T048: Rotation event
  'line-rotated': [payload: {
    bearing: number
    timestamp: number
  }]}>()

// T014: Create reactive ref for map
const mapRef = toRef(props, 'map')

// T014: Initialize composables
const distanceLine = useDistanceLine({
  map: mapRef as any,
  side: props.side,
})

// T023-T025: Initialize line drag composable
const lineDrag = useLineDrag({
  map: mapRef as any,
  // T026: Drag start callback
  onDragStart: (endpoint, position) => {
    emit('endpoint-drag-start', {
      endpoint,
      position,
      timestamp: Date.now(),
    })
  },
  // T027: Drag callback (debounced 16ms)
  onDrag: (endpoint, position) => {
    // Update line endpoint in real-time
    distanceLine.updateEndpoint(endpoint, position)

    emit('endpoint-drag', {
      endpoint,
      position,
      timestamp: Date.now(),
    })
  },
  // T028: Drag end callback
  onDragEnd: (endpoint, position) => {
    // T029: Update endpoint and recalculate distance
    distanceLine.updateEndpoint(endpoint, position)

    emit('endpoint-drag-end', {
      endpoint,
      position,
      timestamp: Date.now(),
    })

    // Re-enable drag on new markers after render
    if (props.draggable && distanceLine.startMarker.value && distanceLine.endMarker.value) {
      lineDrag.enableDrag(
        distanceLine.startMarker.value,
        distanceLine.endMarker.value
      )
    }

    // T031: Emit distance-changed event after drag (left map)
    // For right map, emit rotation event instead since distance is locked
    const currentLine = distanceLine.line.value
    if (currentLine) {
      if (props.side === 'left') {
        emit('distance-changed', {
          distanceMeters: currentLine.distanceMeters,
          distanceDisplay: distanceLine.distanceDisplay.value,
          startPoint: currentLine.startPoint,
          endPoint: currentLine.endPoint,
          timestamp: Date.now(),
        })
      } else if (props.side === 'right' && currentLine.bearing !== undefined) {
        // Right map: emit rotation event since we're changing bearing, not distance
        emit('line-rotated', {
          bearing: currentLine.bearing,
          timestamp: Date.now(),
        })
      }
    }
  },
  debounceMs: 16, // 60fps
})

// T043-T046, T052: Initialize line rotation composable (right map only)
const lineRotation = useLineRotation({
  map: mapRef as any,
  initialBearing: 0, // T040: Default bearing 0° (North)
  onRotationStart: (bearing) => {
    console.log('Rotation started:', bearing)
  },
  onRotate: (bearing) => {
    // T046-T047: Update line bearing and recalculate endpoint
    if (props.side === 'right') {
      distanceLine.setBearing(bearing)
      
      const currentLine = distanceLine.line.value
      if (currentLine) {
        // Update distance while preserving new bearing
        distanceLine.updateDistance(currentLine.distanceMeters)
      }
    }
  },
  onRotationEnd: (bearing) => {
    // T048: Emit line-rotated event
    emit('line-rotated', {
      bearing,
      timestamp: Date.now(),
    })
  },
  enableKeyboard: props.rotatable, // T050: Enable keyboard only if rotatable
  isRotationActive: () => {
    // T057: Only rotate if line exists and is not zero-length
    return !!distanceLine.line.value && !distanceLine.isZeroLength.value
  },
})

const lineCreation = useLineCreation({
  map: mapRef as any,
  onLineCreated: (start, end) => {
    // Create line
    const newLine = distanceLine.createLine(start, end)

    // T032: Enable drag if draggable prop is true
    if (props.draggable && distanceLine.startMarker.value && distanceLine.endMarker.value) {
      lineDrag.enableDrag(
        distanceLine.startMarker.value,
        distanceLine.endMarker.value
      )
    }

    // T016: Emit line-created event
    emit('line-created', {
      line: newLine,
      timestamp: Date.now(),
    })

    // T016: Emit distance-changed event
    emit('distance-changed', {
      distanceMeters: newLine.distanceMeters,
      distanceDisplay: distanceLine.distanceDisplay.value,
      startPoint: newLine.startPoint,
      endPoint: newLine.endPoint,
      timestamp: Date.now(),
    })
  },
})

// T054: Screen reader text for accessibility announcements
const screenReaderText = ref('')

// T054: Update screen reader text when distance changes
watch(
  () => distanceLine.distanceDisplay.value,
  (newDisplay) => {
    if (newDisplay) {
      const action = props.side === 'left' ? 'Measurement updated' : 'Synchronized distance'
      screenReaderText.value = `${action}: ${newDisplay}`
    }
  }
)

// T046: Method to rotate line (updates bearing and endpoint)
const rotateLine = (newBearing: number): void => {
  if (props.side !== 'right') return

  // Update bearing in both rotation state and line state
  lineRotation.setBearing(newBearing)
  distanceLine.setBearing(newBearing) // T047: Preserve bearing in line state
  
  const currentLine = distanceLine.line.value
  if (currentLine) {
    // Update distance to recalculate endpoint with new bearing
    distanceLine.updateDistance(currentLine.distanceMeters)
  }

  // T048: Emit rotation event
  emit('line-rotated', {
    bearing: newBearing,
    timestamp: Date.now(),
  })
}

// Expose methods for parent component access
defineExpose({
  clearLine: distanceLine.clearLine,
  enterCreationMode: lineCreation.activate,
  exitCreationMode: lineCreation.deactivate,
  updateDistance: distanceLine.updateDistance,
  rotateLine, // T046: Expose rotation method
  getLineState: () => distanceLine.line.value,
})

// Watch creation mode prop changes
watch(
  () => props.creationMode,
  (newValue) => {
    if (newValue) {
      lineCreation.activate()
    } else {
      lineCreation.deactivate()
    }
  },
  { immediate: true }
)

// T032: Watch draggable prop changes
watch(
  () => props.draggable,
  (newValue) => {
    if (!distanceLine.startMarker.value || !distanceLine.endMarker.value) {
      return
    }

    if (newValue) {
      lineDrag.enableDrag(
        distanceLine.startMarker.value,
        distanceLine.endMarker.value
      )
    } else {
      lineDrag.disableDrag()
    }
  }
)

// Watch for new line creation to enable drag
watch(
  () => distanceLine.line.value,
  (newLine, oldLine) => {
    if (newLine && !oldLine && props.draggable) {
      // Line was just created, enable drag if markers exist
      setTimeout(() => {
        if (distanceLine.startMarker.value && distanceLine.endMarker.value) {
          lineDrag.enableDrag(
            distanceLine.startMarker.value,
            distanceLine.endMarker.value
          )
        }
      }, 50) // Small delay to ensure markers are fully rendered
    }
  }
)

// Watch for marker recreation (when renderLine() is called due to synchronization)
watch(
  [() => distanceLine.startMarker.value, () => distanceLine.endMarker.value],
  ([newStart, newEnd]) => {
    if (newStart && newEnd && props.draggable && distanceLine.line.value) {
      // Markers were recreated, re-enable drag
      setTimeout(() => {
        if (distanceLine.startMarker.value && distanceLine.endMarker.value) {
          lineDrag.enableDrag(
            distanceLine.startMarker.value,
            distanceLine.endMarker.value
          )
        }
      }, 50) // Small delay to ensure markers are fully rendered
    }
  }
)

// T020: Wire up map click and mousemove events on mount
onMounted(() => {
  if (!props.map) return

  props.map.on('click', lineCreation.handleMapClick)
  props.map.on('mousemove', lineCreation.handleMouseMove)

  // T050: Wire up keyboard event listeners for rotation (only if rotatable)
  // Use capture phase to intercept before Leaflet's keyboard handler
  if (props.rotatable && props.side === 'right') {
    window.addEventListener('keydown', lineRotation.handleKeyboardRotation, { capture: true })
  }
})

// T021: Cleanup Leaflet layers on unmount
onUnmounted(() => {
  if (!props.map) return

  // Remove event listeners
  props.map.off('click', lineCreation.handleMapClick)
  props.map.off('mousemove', lineCreation.handleMouseMove)

  // Remove keyboard listeners
  if (props.rotatable && props.side === 'right') {
    window.removeEventListener('keydown', lineRotation.handleKeyboardRotation, { capture: true })
  }

  // Cleanup drag functionality
  lineDrag.cleanup()

  // Cleanup rotation functionality
  lineRotation.cleanup()

  // Clear line from map
  distanceLine.clearLine()
})

// Expose reactive properties for slot
const { line, distanceDisplay } = distanceLine
</script>

<style scoped>
.distance-line {
  position: relative;
  pointer-events: none;
  z-index: 1000;
}

/* T054: Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* T030: Cursor styles for draggable endpoints */
:deep(.leaflet-marker-icon) {
  cursor: grab;
  user-select: none;
  transition: transform 0.1s ease;
}

:deep(.leaflet-marker-icon:active) {
  cursor: grabbing;
}

:deep(.leaflet-marker-icon.dragging) {
  cursor: grabbing;
}

/* T056: Focus indicators for keyboard navigation */
:deep(.leaflet-marker-icon:focus) {
  outline: 3px solid #667eea;
  outline-offset: 2px;
  border-radius: 50%;
}

:deep(.leaflet-marker-icon:focus-visible) {
  outline: 3px solid #667eea;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
}

/* Arrow marker focus */
:deep(.arrow-marker:focus) {
  outline: 3px solid #667eea;
  outline-offset: 2px;
}
</style>
