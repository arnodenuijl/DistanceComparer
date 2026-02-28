<template>
  <!-- T026: MapContainer component -->
  <div
    ref="containerRef"
    class="map-container"
    :class="{
      'map-container--side-by-side': currentLayout === 'side-by-side',
      'map-container--stacked': currentLayout === 'stacked',
    }"
  >
    <!-- T032: Header slot -->
    <div v-if="$slots.header" class="map-container__header">
      <slot name="header" :layout="currentLayout"></slot>
    </div>

    <div class="map-container__panels">
      <!-- T032: Left/top panel -->
      <div class="map-container__left">
        <slot name="left">
          <MapPanel
            ref="leftMapRef"
            :id="leftMapConfig?.id || 'left-map'"
            :initial-center="leftMapConfig?.initialCenter"
            :initial-zoom="leftMapConfig?.initialZoom"
            :min-zoom="leftMapConfig?.minZoom"
            :max-zoom="leftMapConfig?.maxZoom"
            @map-ready="handleMapReady('left', $event)"
          />
        </slot>
      </div>

      <!-- T034: Border between panels -->
      <div class="map-container__divider"></div>

      <!-- T032: Right/bottom panel -->
      <div class="map-container__right">
        <slot name="right">
          <MapPanel
            ref="rightMapRef"
            :id="rightMapConfig?.id || 'right-map'"
            :initial-center="rightMapConfig?.initialCenter"
            :initial-zoom="rightMapConfig?.initialZoom"
            :min-zoom="rightMapConfig?.minZoom"
            :max-zoom="rightMapConfig?.maxZoom"
            @map-ready="handleMapReady('right', $event)"
          />
        </slot>
      </div>
    </div>

    <!-- Footer slot -->
    <div v-if="$slots.footer" class="map-container__footer">
      <slot name="footer" :layout="currentLayout"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MapPanel from './MapPanel.vue'
import { BREAKPOINT_WIDTH } from '../config/map.config'
import type { Coordinate, LayoutMode } from '../types/map.types'

// T027: Define props
interface MapPanelConfig {
  id?: string
  initialCenter?: Coordinate
  initialZoom?: number
  minZoom?: number
  maxZoom?: number
}

interface Props {
  breakpointWidth?: number
  gap?: number
  initialLayout?: 'auto' | 'side-by-side' | 'stacked'
  leftMapConfig?: MapPanelConfig
  rightMapConfig?: MapPanelConfig
}

const props = withDefaults(defineProps<Props>(), {
  breakpointWidth: BREAKPOINT_WIDTH,
  gap: 0,
  initialLayout: 'auto',
})

// T031: Define events
const emit = defineEmits<{
  'layout-changed': [payload: { layout: LayoutMode; viewportWidth: number }]
}>()

// State
const leftMapRef = ref<InstanceType<typeof MapPanel> | null>(null)
const rightMapRef = ref<InstanceType<typeof MapPanel> | null>(null)
const viewportWidth = ref(window.innerWidth)

// T029: Responsive layout logic
const currentLayout = computed<LayoutMode>(() => {
  if (props.initialLayout !== 'auto') {
    return props.initialLayout as LayoutMode
  }
  return viewportWidth.value >= props.breakpointWidth ? 'side-by-side' : 'stacked'
})

// T030: Window resize handler
const handleResize = () => {
  const previousLayout = currentLayout.value
  viewportWidth.value = window.innerWidth
  
  if (previousLayout !== currentLayout.value) {
    emit('layout-changed', {
      layout: currentLayout.value,
      viewportWidth: viewportWidth.value,
    })
    
    // Invalidate map sizes after layout change
    setTimeout(() => {
      leftMapRef.value?.invalidateSize()
      rightMapRef.value?.invalidateSize()
    }, 100)
  }
}

// Debounced resize handler
let resizeTimeout: ReturnType<typeof setTimeout>
const debouncedResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(handleResize, 150)
}

// T030: Mount/unmount lifecycle
onMounted(() => {
  window.addEventListener('resize', debouncedResize)
  handleResize() // Initial layout check
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedResize)
  clearTimeout(resizeTimeout)
})

// Event handlers
const handleMapReady = (panel: 'left' | 'right', event: any) => {
  console.log(`${panel} map ready:`, event)
}

// T035: Expose methods
defineExpose({
  getLeftMap: () => leftMapRef.value,
  getRightMap: () => rightMapRef.value,
  getCurrentLayout: () => currentLayout.value,
  forceLayout: (_layout: LayoutMode) => {
    // Would need to implement forced layout state
    console.warn('forceLayout not yet implemented')
  },
  resetLayout: () => {
    handleResize()
  },
})
</script>

<style scoped>
/* T033: MapContainer layout styles */
.map-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.map-container__panels {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* T033: Side-by-side layout */
.map-container--side-by-side .map-container__panels {
  flex-direction: row;
}

.map-container--side-by-side .map-container__left,
.map-container--side-by-side .map-container__right {
  flex: 1;
  height: 100%;
  min-width: 0;
  overflow: hidden;
}

/* T034: Divider in side-by-side mode */
.map-container--side-by-side .map-container__divider {
  width: 1px;
  background-color: #ddd;
  flex-shrink: 0;
}

/* T033: Stacked layout */
.map-container--stacked .map-container__panels {
  flex-direction: column;
}

.map-container--stacked .map-container__left,
.map-container--stacked .map-container__right {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

/* T034: Divider in stacked mode */
.map-container--stacked .map-container__divider {
  height: 1px;
  background-color: #ddd;
  flex-shrink: 0;
}

.map-container__header,
.map-container__footer {
  padding: 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.map-container__footer {
  border-top: 1px solid #ddd;
  border-bottom: none;
}
</style>
