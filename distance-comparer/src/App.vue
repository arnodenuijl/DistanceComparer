<script setup lang="ts">
// T036: Create App.vue with MapContainer usage
import { ref } from 'vue'
import MapContainer from './components/MapContainer.vue'
import MapPanel from './components/MapPanel.vue'
import type { Coordinate, Bounds } from './types/map.types'

// T037-T038: Configure both maps with world view
const leftMapConfig = {
  id: 'left-map',
  initialCenter: { lat: 0, lng: 0 } as Coordinate,
  initialZoom: 2,
}

const rightMapConfig = {
  id: 'right-map',
  initialCenter: { lat: 0, lng: 0 } as Coordinate,
  initialZoom: 2,
}

const handleLayoutChange = (event: any) => {
  console.log('Layout changed:', event)
}

// T063-T065: Event logging for navigation testing
const lastEvent = ref<string>('Waiting for interaction...')

const handleCenterChanged = (event: { mapId: string; center: Coordinate }) => {
  lastEvent.value = `${event.mapId}: Center → ${event.center.lat.toFixed(4)}, ${event.center.lng.toFixed(4)}`
  console.log('Center changed:', event)
}

const handleZoomChanged = (event: { mapId: string; zoom: number }) => {
  lastEvent.value = `${event.mapId}: Zoom → ${event.zoom}`
  console.log('Zoom changed:', event)
}

const handleBoundsChanged = (event: { mapId: string; bounds: Bounds }) => {
  console.log('Bounds changed:', event)
}

const handleLoadingStart = (event: { mapId: string }) => {
  console.log('Loading start:', event)
}

const handleLoadingEnd = (event: { mapId: string; success: boolean }) => {
  console.log('Loading end:', event)
}

const handleError = (event: any) => {
  lastEvent.value = `${event.mapId}: ERROR - ${event.error.message}`
  console.error('Map error:', event)
}
</script>

<template>
  <div class="app">
    <!-- T039: App header -->
    <header class="app-header">
      <h1>Distance Comparer</h1>
      <p class="app-subtitle">Compare locations with dual interactive maps</p>
      <div class="event-log">{{ lastEvent }}</div>
    </header>

    <!-- T036: MapContainer with configured maps -->
    <main class="app-main">
      <MapContainer
        :left-map-config="leftMapConfig"
        :right-map-config="rightMapConfig"
        @layout-changed="handleLayoutChange"
      >
        <template #left>
          <MapPanel
            v-bind="leftMapConfig"
            @center-changed="handleCenterChanged"
            @zoom-changed="handleZoomChanged"
            @bounds-changed="handleBoundsChanged"
            @loading-start="handleLoadingStart"
            @loading-end="handleLoadingEnd"
            @error="handleError"
          />
        </template>
        
        <template #right>
          <MapPanel
            v-bind="rightMapConfig"
            @center-changed="handleCenterChanged"
            @zoom-changed="handleZoomChanged"
            @bounds-changed="handleBoundsChanged"
            @loading-start="handleLoadingStart"
            @loading-end="handleLoadingEnd"
            @error="handleError"
          />
        </template>

        <template #header="{ layout }">
          <div class="layout-indicator">
            Current layout: <strong>{{ layout }}</strong>
            <span class="hint">→ Try panning and zooming each map independently</span>
          </div>
        </template>
      </MapContainer>
    </main>
  </div>
</template>

<style scoped>
/* T040: Global app styles */
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.app-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.app-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.event-log {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  min-height: 32px;
}

.app-main {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.layout-indicator {
  font-size: 14px;
  color: #666;
}

.layout-indicator strong {
  color: #333;
  text-transform: capitalize;
}

.hint {
  margin-left: 12px;
  font-size: 12px;
  color: #999;
  font-style: italic;
}
</style>
