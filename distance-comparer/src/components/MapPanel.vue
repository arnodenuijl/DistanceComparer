<template>
  <!-- T018: MapPanel component with template ref -->
  <!-- T074-T075: Add keyboard focus support -->
  <div
    ref="containerRef"
    class="map-panel"
    :class="{ 'map-panel--focused': isFocused }"
    tabindex="0"
    role="application"
    :aria-label="`Interactive map panel ${id}. Use arrow keys to pan, plus and minus to zoom, Escape to blur.`"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- T022: Loading state UI -->
    <div v-if="loadingState === 'loading'" class="map-panel__loading">
      <slot name="loading">
        <div class="map-panel__spinner">Loading map...</div>
      </slot>
    </div>

    <!-- T022: Error state UI -->
    <div v-if="loadingState === 'error' && error" class="map-panel__error">
      <slot name="error" :error="error" :retry="handleRetry">
        <div class="map-panel__error-content">
          <p>{{ error.message }}</p>
          <button @click="handleRetry" class="map-panel__retry-button">
            Retry
          </button>
        </div>
      </slot>
    </div>

    <!-- T018: Default slot for custom controls -->
    <div v-if="isReady" class="map-panel__controls">
      <slot></slot>
    </div>

    <!-- T083-T086: ARIA live region for screen reader announcements -->
    <div
      class="map-panel__sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ srAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLeafletMap } from '../composables/useLeafletMap'
import { useMapEvents } from '../composables/useMapEvents'
import { useMapNavigation } from '../composables/useMapNavigation'
import { useMapKeyboard } from '../composables/useMapKeyboard'
import { DEFAULT_MAP_CONFIG, DEFAULT_TILE_CONFIG } from '../config/map.config'
import type { Coordinate, Bounds, MapError } from '../types/map.types'

// T019: Define props
interface Props {
  id?: string
  initialCenter?: Coordinate
  initialZoom?: number
  minZoom?: number
  maxZoom?: number
  tileUrl?: string
  attribution?: string
  enableKeyboard?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  id: () => `map-panel-${Math.random().toString(36).substr(2, 9)}`,
  initialCenter: () => DEFAULT_MAP_CONFIG.center,
  initialZoom: () => DEFAULT_MAP_CONFIG.zoom,
  minZoom: () => DEFAULT_MAP_CONFIG.minZoom,
  maxZoom: () => DEFAULT_MAP_CONFIG.maxZoom,
  tileUrl: () => DEFAULT_TILE_CONFIG.urlTemplate,
  attribution: () => DEFAULT_TILE_CONFIG.attribution,
  enableKeyboard: true,
})

// T021: Define events
const emit = defineEmits<{
  'map-ready': [payload: { mapId: string; center: Coordinate; zoom: number }]
  'center-changed': [payload: { mapId: string; center: Coordinate }]
  'zoom-changed': [payload: { mapId: string; zoom: number }]
  'bounds-changed': [payload: { mapId: string; bounds: Bounds }]
  'loading-start': [payload: { mapId: string }]
  'loading-end': [payload: { mapId: string; success: boolean }]
  'error': [payload: { mapId: string; error: MapError }]
  'focus-gained': [payload: { mapId: string }]
  'focus-lost': [payload: { mapId: string }]
}>()

// T020: Integrate useLeafletMap
const containerRef = ref<HTMLElement | null>(null)

const mapConfig = computed(() => ({
  center: props.initialCenter,
  zoom: props.initialZoom,
  minZoom: props.minZoom,
  maxZoom: props.maxZoom,
}))

const tileConfig = computed(() => ({
  ...DEFAULT_TILE_CONFIG,
  urlTemplate: props.tileUrl,
  attribution: props.attribution,
}))

const {
  map,
  isReady,
  loadingState,
  error,
  getCenter: getMapCenter,
  getZoom: getMapZoom,
  invalidateSize,
} = useLeafletMap({
  container: containerRef,
  config: mapConfig.value,
  tileConfig: tileConfig.value,
})

// T056-T057: Integrate useMapNavigation
const navigation = useMapNavigation({ map })

// T052: Integrate useMapEvents
const tileLoadRetryCount = ref(0)
const maxRetryAttempts = tileConfig.value.retryAttempts || 3

// T083-T086: Screen reader announcement state
const srAnnouncement = ref<string>('')

useMapEvents(
  { map },
  {
    // T053: Wire up center-changed event
    onCenterChanged: (center) => {
      emit('center-changed', { mapId: props.id, center })
      // T085: Announce center changes to screen readers
      if (isFocused.value && props.enableKeyboard) {
        srAnnouncement.value = `Map center moved to ${center.lat.toFixed(2)} degrees latitude, ${center.lng.toFixed(2)} degrees longitude`
      }
    },
    // T054: Wire up zoom-changed event
    onZoomChanged: (zoom) => {
      emit('zoom-changed', { mapId: props.id, zoom })
      // T084: Announce zoom changes to screen readers
      if (isFocused.value && props.enableKeyboard) {
        srAnnouncement.value = `Zoom level ${zoom}`
      }
    },
    // T055: Wire up bounds-changed event
    onBoundsChanged: (bounds) => {
      emit('bounds-changed', { mapId: props.id, bounds })
    },
    // T058: Wire up loading-start event
    onLoadingStart: () => {
      emit('loading-start', { mapId: props.id })
    },
    // T059: Wire up loading-end event
    onLoadingEnd: (success) => {
      emit('loading-end', { mapId: props.id, success })
      if (success) {
        tileLoadRetryCount.value = 0
      }
    },
    // T060-T061: Wire up error event with tile error handling
    onError: (errorData) => {
      const mapError: MapError = {
        code: errorData.code as MapError['code'],
        message: errorData.message,
        recoverable: tileLoadRetryCount.value < maxRetryAttempts,
      }
      emit('error', { mapId: props.id, error: mapError })
      
      // T061b: Automatic retry with exponential backoff
      if (mapError.recoverable && errorData.code === 'TILE_LOAD_FAILED') {
        tileLoadRetryCount.value++
        const delay = (tileConfig.value.retryDelay || 1000) * Math.pow(2, tileLoadRetryCount.value - 1)
        
        setTimeout(() => {
          if (map.value) {
            map.value.invalidateSize()
          }
        }, delay)
      }
    },
  }
)

// T021: Emit map-ready event
watch(isReady, (ready) => {
  if (ready) {
    const center = getMapCenter()
    const zoom = getMapZoom()
    if (center && zoom !== null) {
      emit('map-ready', {
        mapId: props.id,
        center,
        zoom,
      })
    }
  }
})

// T022, T061c: Handle retry - reset error state and reload
const handleRetry = () => {
  tileLoadRetryCount.value = 0
  if (map.value) {
    map.value.invalidateSize()
    // Force tile reload
    map.value.eachLayer((layer: any) => {
      if (layer.redraw) {
        layer.redraw()
      }
    })
  }
}

// T074: Integrate useMapKeyboard composable
const keyboard = props.enableKeyboard
  ? useMapKeyboard(map, containerRef, {})
  : { isFocused: ref(false), handleFocus: () => {}, handleBlur: () => {} }

const isFocused = keyboard.isFocused

// T076-T078: Focus handling with event emissions
const handleFocus = () => {
  if (props.enableKeyboard) {
    keyboard.handleFocus()
  }
  emit('focus-gained', { mapId: props.id })
}

const handleBlur = () => {
  if (props.enableKeyboard) {
    keyboard.handleBlur()
  }
  emit('focus-lost', { mapId: props.id })
}

// T025, T057: Expose methods via defineExpose
defineExpose({
  setView: navigation.setView,
  panTo: navigation.panTo,
  panBy: navigation.panBy,
  zoomIn: navigation.zoomIn,
  zoomOut: navigation.zoomOut,
  setZoom: navigation.setZoom,
  fitBounds: navigation.fitBounds,
  invalidateSize,
  getCenter: navigation.getCenter,
  getZoom: navigation.getZoom,
  getBounds: navigation.getBounds,
  map,
})
</script>

<style scoped>
/* T023: MapPanel scoped styles */
.map-panel {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  overflow: hidden;
}

/* T079: Focus indicator styling */
.map-panel:focus {
  outline: none;
}

.map-panel:focus-visible,
.map-panel--focused {
  box-shadow: inset 0 0 0 2px #646cff;
}

.map-panel__loading,
.map-panel__error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

.map-panel__spinner {
  font-size: 16px;
  color: #646cff;
}

.map-panel__error-content {
  text-align: center;
  padding: 20px;
}

.map-panel__error-content p {
  margin-bottom: 16px;
  color: #d32f2f;
}

.map-panel__retry-button {
  padding: 8px 16px;
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.map-panel__retry-button:hover {
  background-color: #535bf2;
}

.map-panel__controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

/* T083: Screen reader only - visually hidden but accessible */
.map-panel__sr-only {
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
</style>
