# Quickstart Guide: Dual Map View

**Feature**: Dual Map View  
**Date**: 2026-02-28  
**Audience**: Developers implementing the feature

---

## Overview

This guide provides a step-by-step walkthrough for implementing the dual map view feature. Follow these steps in order to build a working prototype that displays two independently navigable maps side by side.

**Estimated Time**: 4-6 hours for basic implementation

---

## Prerequisites

Before starting, ensure you have:

- Node.js 20 LTS or later installed
- Basic familiarity with Vue 3 Composition API
- TypeScript knowledge (strict mode will be enabled)
- Understanding of component lifecycle hooks

---

## Step 1: Project Setup (30 minutes)

### 1.1 Initialize Vue Project

```bash
# Create Vue 3 + TypeScript project with Vite
npm create vite@latest distance-comparer -- --template vue-ts

cd distance-comparer
npm install
```

### 1.2 Install Dependencies

```bash
# Install Leaflet and its TypeScript definitions
npm install leaflet
npm install --save-dev @types/leaflet

# Install additional development dependencies
npm install --save-dev @types/node
```

### 1.3 Configure TypeScript

Edit `tsconfig.json` to enable strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    // ... other options
  }
}
```

**Why**: Constitution Principle III mandates strict TypeScript

### 1.4 Import Leaflet CSS

In `src/main.ts`:

```typescript
import 'leaflet/dist/leaflet.css'
```

---

## Step 2: Type Definitions (15 minutes)

### 2.1 Create Type Definitions File

Create `src/types/map.types.ts`:

```typescript
/**
 * Geographic coordinate in decimal degrees
 */
export interface Coordinate {
  lat: number  // -90 to 90
  lng: number  // -180 to 180
}

/**
 * Geographic bounding box
 */
export interface Bounds {
  north: number
  south: number
  east: number
  west: number
}

/**
 * Map view configuration
 */
export interface MapConfig {
  center: Coordinate
  zoom: number
  minZoom: number
  maxZoom: number
}

/**
 * Tile layer configuration
 */
export interface TileLayerConfig {
  urlTemplate: string
  attribution: string
  maxZoom: number
  minZoom: number
}

/**
 * Map panel events
 */
export interface MapPanelEvents {
  'map-ready': [payload: { mapId: string, center: Coordinate, zoom: number }]
  'center-changed': [payload: { mapId: string, center: Coordinate }]
  'zoom-changed': [payload: { mapId: string, zoom: number }]
  'error': [payload: { mapId: string, error: Error }]
}
```

**Why**: Constitution Principle III requires explicit types

---

## Step 3: Core Map Composable (60 minutes)

### 3.1 Create useLeafletMap Composable

Create `src/composables/useLeafletMap.ts`:

```typescript
import { ref, shallowRef, onMounted, onUnmounted, type Ref } from 'vue'
import * as L from 'leaflet'
import type { Coordinate, MapConfig } from '@/types/map.types'

export function useLeafletMap(
  containerRef: Ref<HTMLElement | null>,
  config: MapConfig
) {
  // Use shallowRef to prevent Vue from making Leaflet reactive
  const map = shallowRef<L.Map | null>(null)
  const isReady = ref(false)
  const error = ref<Error | null>(null)

  onMounted(() => {
    if (!containerRef.value) {
      error.value = new Error('Map container not found')
      return
    }

    try {
      // Initialize Leaflet map
      map.value = L.map(containerRef.value, {
        center: [config.center.lat, config.center.lng],
        zoom: config.zoom,
        minZoom: config.minZoom,
        maxZoom: config.maxZoom,
        zoomControl: true,
        attributionControl: true
      })

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map.value)

      isReady.value = true
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Map initialization failed')
    }
  })

  onUnmounted(() => {
    // Clean up to prevent memory leaks
    if (map.value) {
      map.value.remove()
      map.value = null
    }
  })

  // Exposed methods
  function setView(center: Coordinate, zoom: number, animate = true) {
    if (map.value) {
      map.value.setView([center.lat, center.lng], zoom, { animate })
    }
  }

  function getCenter(): Coordinate | null {
    if (!map.value) return null
    const center = map.value.getCenter()
    return { lat: center.lat, lng: center.lng }
  }

  function getZoom(): number | null {
    return map.value?.getZoom() ?? null
  }

  return {
    map,
    isReady,
    error,
    setView,
    getCenter,
    getZoom
  }
}
```

**Key Points**:
- `shallowRef` for map instance (research.md recommendation)
- Lifecycle management in onMounted/onUnmounted
- Error handling for robustness

---

## Step 4: MapPanel Component (90 minutes)

### 4.1 Create MapPanel Component

Create `src/components/MapPanel.vue`:

```vue
<template>
  <div class="map-panel">
    <div 
      ref="mapContainer" 
      class="map-panel__container"
      role="application"
      :aria-label="`Interactive map panel ${id}`"
      tabindex="0"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    
    <div v-if="error" class="map-panel__error">
      <slot name="error" :error="error" :retry="retryInit">
        <div class="map-panel__error-content">
          <p>{{ error.message }}</p>
          <button @click="retryInit">Retry</button>
        </div>
      </slot>
    </div>

    <div v-if="!isReady && !error" class="map-panel__loading">
      <slot name="loading">
        <div class="spinner">Loading map...</div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useLeafletMap } from '@/composables/useLeafletMap'
import type { Coordinate } from '@/types/map.types'

// Props
interface Props {
  id?: string
  initialCenter?: Coordinate
  initialZoom?: number
  minZoom?: number
  maxZoom?: number
  enableKeyboard?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  id: () => `map-${Math.random().toString(36).substr(2, 9)}`,
  initialCenter: () => ({ lat: 0, lng: 0 }),
  initialZoom: 2,
  minZoom: 2,
  maxZoom: 18,
  enableKeyboard: true
})

// Events
const emit = defineEmits<{
  'map-ready': [payload: { mapId: string, center: Coordinate, zoom: number }]
  'center-changed': [payload: { mapId: string, center: Coordinate }]
  'zoom-changed': [payload: { mapId: string, zoom: number }]
  'focus-gained': [payload: { mapId: string }]
  'focus-lost': [payload: { mapId: string }]
  'error': [payload: { mapId: string, error: Error }]
}>()

// Local state
const mapContainer = ref<HTMLElement | null>(null)
const isFocused = ref(false)

// Initialize map
const { map, isReady, error, setView, getCenter, getZoom } = useLeafletMap(
  mapContainer,
  {
    center: props.initialCenter,
    zoom: props.initialZoom,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom
  }
)

// Watch for map ready
watch(isReady, (ready) => {
  if (ready && map.value) {
    const center = getCenter()
    const zoom = getZoom()
    if (center && zoom !== null) {
      emit('map-ready', { mapId: props.id, center, zoom })
    }
  }
})

// Watch for errors
watch(error, (err) => {
  if (err) {
    emit('error', { mapId: props.id, error: err })
  }
})

// Focus handling
function handleFocus() {
  isFocused.value = true
  emit('focus-gained', { mapId: props.id })
}

function handleBlur() {
  isFocused.value = false
  emit('focus-lost', { mapId: props.id })
}

// Retry initialization
function retryInit() {
  // Reload the page for now (proper retry logic would reinitialize the map)
  window.location.reload()
}

// Expose methods for template refs
defineExpose({
  setView,
  getCenter,
  getZoom,
  map
})
</script>

<style scoped>
.map-panel {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-panel__container {
  width: 100%;
  height: 100%;
}

.map-panel__container:focus {
  outline: 2px solid #0078d4;
  outline-offset: -2px;
}

.map-panel__error,
.map-panel__loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.map-panel__error-content {
  text-align: center;
}

.map-panel__error-content button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.map-panel__error-content button:hover {
  background: #005a9e;
}

.spinner {
  padding: 2rem;
  color: #666;
}
</style>
```

**Key Points**:
- Follows contract from MapPanel.contract.md
- Accessibility attributes (role, aria-label, tabindex)
- Error and loading states
- Exposes methods via defineExpose

---

## Step 5: MapContainer Component (60 minutes)

### 5.1 Create MapContainer Component

Create `src/components/MapContainer.vue`:

```vue
<template>
  <div 
    class="map-container"
    :class="containerClass"
    role="region"
    aria-label="Dual map comparison view"
  >
    <div v-if="$slots.header" class="map-container__header">
      <slot name="header" :layout="currentLayout" />
    </div>

    <div class="map-container__panels">
      <div class="map-container__left">
        <slot name="left">
          <MapPanel
            ref="leftMapRef"
            v-bind="leftMapConfig"
            @map-ready="onLeftMapReady"
          />
        </slot>
      </div>

      <div class="map-container__right">
        <slot name="right">
          <MapPanel
            ref="rightMapRef"
            v-bind="rightMapConfig"
            @map-ready="onRightMapReady"
          />
        </slot>
      </div>
    </div>

    <div v-if="$slots.footer" class="map-container__footer">
      <slot name="footer" :layout="currentLayout" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MapPanel from './MapPanel.vue'
import type { Coordinate } from '@/types/map.types'

// Props
interface Props {
  breakpointWidth?: number
  gap?: number
  initialLayout?: 'auto' | 'side-by-side' | 'stacked'
  leftMapConfig?: {
    initialCenter?: Coordinate
    initialZoom?: number
  }
  rightMapConfig?: {
    initialCenter?: Coordinate
    initialZoom?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  breakpointWidth: 768,
  gap: 0,
  initialLayout: 'auto'
})

// Events
const emit = defineEmits<{
  'layout-changed': [payload: { layout: 'side-by-side' | 'stacked', viewportWidth: number }]
}>()

// Refs
const leftMapRef = ref<InstanceType<typeof MapPanel> | null>(null)
const rightMapRef = ref<InstanceType<typeof MapPanel> | null>(null)
const viewportWidth = ref(window.innerWidth)

// Computed
const currentLayout = computed<'side-by-side' | 'stacked'>(() => {
  if (props.initialLayout !== 'auto') {
    return props.initialLayout
  }
  return viewportWidth.value >= props.breakpointWidth ? 'side-by-side' : 'stacked'
})

const containerClass = computed(() => ({
  'map-container--side-by-side': currentLayout.value === 'side-by-side',
  'map-container--stacked': currentLayout.value === 'stacked'
}))

// Resize handling
function handleResize() {
  const newWidth = window.innerWidth
  const oldLayout = currentLayout.value
  
  viewportWidth.value = newWidth
  
  if (oldLayout !== currentLayout.value) {
    emit('layout-changed', {
      layout: currentLayout.value,
      viewportWidth: newWidth
    })
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Event handlers
function onLeftMapReady(payload: any) {
  console.log('Left map ready:', payload)
}

function onRightMapReady(payload: any) {
  console.log('Right map ready:', payload)
}

// Expose methods
defineExpose({
  getLeftMap: () => leftMapRef.value,
  getRightMap: () => rightMapRef.value,
  getCurrentLayout: () => currentLayout.value
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.map-container__panels {
  flex: 1;
  display: flex;
  min-height: 0;
}

.map-container--side-by-side .map-container__panels {
  flex-direction: row;
}

.map-container--stacked .map-container__panels {
  flex-direction: column;
}

.map-container__left,
.map-container__right {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.map-container--side-by-side .map-container__left {
  border-right: 1px solid #ccc;
}

.map-container--stacked .map-container__left {
  border-bottom: 1px solid #ccc;
}
</style>
```

---

## Step 6: Main Application (15 minutes)

### 6.1 Update App.vue

Replace `src/App.vue`:

```vue
<template>
  <MapContainer
    :left-map-config="{
      initialCenter: { lat: 40.7128, lng: -74.0060 },
      initialZoom: 10
    }"
    :right-map-config="{
      initialCenter: { lat: 51.5074, lng: -0.1278 },
      initialZoom: 10
    }"
  >
    <template #header="{ layout }">
      <header class="app-header">
        <h1>Distance Comparer</h1>
        <p>Current layout: {{ layout }}</p>
      </header>
    </template>
  </MapContainer>
</template>

<script setup lang="ts">
import MapContainer from './components/MapContainer.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.app-header {
  background: #0078d4;
  color: white;
  padding: 1rem;
  text-align: center;
}

.app-header h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.app-header p {
  font-size: 0.875rem;
  opacity: 0.9;
}
</style>
```

---

## Step 7: Run and Test (15 minutes)

### 7.1 Start Development Server

```bash
npm run dev
```

Navigate to `http://localhost:5173`

### 7.2 Verify Functionality

**Test Checklist**:
- [ ] Two maps display side by side on desktop
- [ ] Each map loads OpenStreetMap tiles
- [ ] Left map shows New York City (initialCenter)
- [ ] Right map shows London (initialCenter)
- [ ] Dragging one map does not affect the other
- [ ] Zooming one map does not affect the other
- [ ] Resizing browser below 768px stacks maps vertically
- [ ] Tab key switches focus between maps (visible outline)
- [ ] Attribution appears at bottom-right of each map

---

## Next Steps

After completing this quickstart:

1. **Add Keyboard Navigation** (1-2 hours)
   - Implement arrow key handling in MapPanel
   - Add +/- key zoom controls
   - Review research.md for debouncing patterns

2. **Enhance Error Handling** (1 hour)
   - Add retry logic
   - Handle network errors gracefully
   - Add loading indicators during tile fetch

3. **Add Tests** (2-3 hours)
   - Unit tests for composables
   - Component tests for MapPanel/MapContainer
   - Integration tests for user scenarios

4. **Performance Optimization** (1-2 hours)
   - Implement event debouncing (research.md patterns)
   - Add tile caching strategy
   - Optimize resize handling

---

## Common Issues

### Issue: Map tiles not loading

**Cause**: CORS or network issues  
**Solution**: Check browser console for errors. Ensure internet connectivity. Try alternative tile provider.

### Issue: "Cannot create proxy" error

**Cause**: Leaflet object made reactive  
**Solution**: Always use `shallowRef` or `markRaw` for Leaflet instances (see research.md)

### Issue: Maps not resizing correctly

**Cause**: Leaflet doesn't know about container size changes  
**Solution**: Call `map.invalidateSize()` after layout changes

### Issue: Focus outline not visible

**Cause**: CSS override or missing styles  
**Solution**: Add `:focus` styles to `.map-panel__container`

---

## Resources

- **Feature Spec**: [spec.md](spec.md)
- **Research**: [research.md](research.md)
- **Data Model**: [data-model.md](data-model.md)
- **Contracts**: [contracts/](contracts/)
- **Leaflet Docs**: https://leafletjs.com/reference.html
- **Vue 3 Docs**: https://vuejs.org/guide/introduction.html
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

## Quickstart Complete!

You now have a working dual map view implementation. The prototype demonstrates:

✅ Side-by-side map display  
✅ Independent navigation per map  
✅ Responsive layout  
✅ TypeScript strict mode  
✅ Accessibility foundations  
✅ Error handling

Continue to tasks.md for detailed implementation tasks to reach production quality.
