<script setup lang="ts">
// T036: Create App.vue with MapContainer usage
import { ref } from 'vue'
import MapContainer from './components/MapContainer.vue'
import MapPanel from './components/MapPanel.vue'
import DistanceLine from './components/DistanceLine.vue'
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

// Event handlers - console logging only (debug UI removed per US3)
const handleCenterChanged = (event: { mapId: string; center: Coordinate }) => {
  console.log('Center changed:', event)
}

const handleZoomChanged = (event: { mapId: string; zoom: number }) => {
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
  console.error('Map error:', event)
}

// Distance Line Tool State - Auto-activated per US1
const showDistanceTool = ref(true)  // T001: Auto-activate on load
const isCreatingLine = ref(true)    // T002: Ready for clicks immediately
const currentDistance = ref<string>('')

// T038: Ref to right map DistanceLine component for synchronization
const rightDistanceLine = ref<InstanceType<typeof DistanceLine> | null>(null)

// US2: Reset functionality - clears lines and returns to creation mode
const resetDistanceLine = () => {
  isCreatingLine.value = true
  currentDistance.value = ''
  // Toggle showDistanceTool to remount components and clear lines
  showDistanceTool.value = false
  setTimeout(() => {
    showDistanceTool.value = true
  }, 0)
}

const handleLineCreated = (event: any) => {
  isCreatingLine.value = false
  console.log('Line created:', event)

  // T040-T041: Create initial line on right map when left line is created
  // The right line will be positioned at the center of the right map with 0° bearing
  if (rightDistanceLine.value && event.line) {
    rightDistanceLine.value.updateDistance(event.line.distanceMeters)
  }
}

// T037-T038: Handle distance changes and sync to right map
const handleDistanceChanged = (event: any) => {
  currentDistance.value = event.distanceDisplay
  console.log('Distance changed:', event)

  // T038: Update right map line distance (synchronized)
  if (rightDistanceLine.value && event.distanceMeters) {
    const startTime = performance.now()
    rightDistanceLine.value.updateDistance(event.distanceMeters)
    const syncTime = performance.now() - startTime
    
    // T042: Log sync latency (should be < 100ms)
    console.log(`Sync latency: ${syncTime.toFixed(2)}ms`)
  }
}

</script>

<template>
  <div class="app">
    <!-- T039: App header -->
    <header class="app-header">
      <div class="header-top">
        <div class="header-left">
          <h1>Distance Comparer</h1>
          <p class="app-subtitle">Compare locations with dual interactive maps</p>
        </div>
        
        <!-- US1: Usage instructions for first-time users -->
        <div class="usage-instructions">
          <ol>
            <li>Click two points on the left map to measure distance</li>
            <li>Drag and rotate the line on the right map to compare</li>
            <li>Click Reset to start a new measurement</li>
          </ol>
        </div>
      </div>
      
      <div class="header-controls">
        <span class="distance-display" :class="{ hidden: !currentDistance }">
          Distance: {{ currentDistance || '0' }}m
        </span>
        <button 
          @click="resetDistanceLine" 
          class="reset-button"
          :class="{ hidden: !currentDistance }"
          type="button"
          :disabled="!currentDistance"
        >
          Reset
        </button>
      </div>
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
            @line-created="handleLineCreated"
            @distance-changed="handleDistanceChanged"
          >
            <template #distance-line="{ map }">
              <DistanceLine
                v-if="showDistanceTool"
                :map="map"
                side="left"
                :creation-mode="isCreatingLine"
                @line-created="handleLineCreated"
                @distance-changed="handleDistanceChanged"
              />
            </template>
          </MapPanel>
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
          >
            <!-- T040-T041: Right map distance line (synchronized, independent position) -->
            <template #distance-line="{ map }">
              <DistanceLine
                v-if="showDistanceTool"
                ref="rightDistanceLine"
                :map="map"
                side="right"
                :creation-mode="false"
                :draggable="true"
                :rotatable="true"
              />
            </template>
          </MapPanel>
        </template>

        <template #header>
          <!-- US3: Layout indicator removed for cleaner interface -->
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

.header-top {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 32px;
}

.header-left {
  flex: 0 0 auto;
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

/* US1: Usage instructions styling */
.usage-instructions {
  flex: 0 0 auto;
  padding: 8px 16px 8px 12px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  line-height: 1.4;
}

.usage-instructions ol {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  opacity: 0.95;
  color: white;
}

.usage-instructions li {
  margin: 3px 0;
}

.usage-instructions li::marker {
  font-weight: 600;
}

.header-controls {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 40px;
}

/* Hidden state for controls - preserves layout space */
.header-controls .hidden {
  opacity: 0;
  pointer-events: none;
}

/* US2: Reset button styling */
.reset-button {
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease, background-color 0.2s ease;
}

.reset-button:not(.hidden):hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.reset-button:focus {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.reset-button:disabled {
  cursor: default;
}

.distance-display {
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.95);
  color: #667eea;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  transition: opacity 0.2s ease;
}

.app-main {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
</style>
