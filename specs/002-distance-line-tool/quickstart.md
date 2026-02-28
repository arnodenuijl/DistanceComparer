# Quickstart Guide: Distance Line Tool

**Feature**: Distance Line Tool  
**Date**: February 28, 2026  
**Estimated Time**: 6-8 hours  
**Prerequisites**: Spec 001 (Dual Map View) fully implemented

---

## Overview

This guide walks through implementing the distance line tool feature step-by-step. Follow steps sequentially for a working prototype, then iterate to add remaining functionality.

**Implementation Strategy**: Build composables → components → integration → polish

---

## Prerequisites Checklist

Before starting, verify the following from spec 001 implementation:

- ✅ Vue 3 + Vite project structure exists
- ✅ TypeScript strict mode enabled in `tsconfig.json`
- ✅ Leaflet (^1.9.4) installed and configured
- ✅ MapPanel.vue component functional with basic pan/zoom
- ✅ MapContainer.vue displaying two side-by-side maps
- ✅ `src/types/map.types.ts` with Coordinate interface
- ✅ `src/composables/useLeafletMap.ts` working

---

## Phase 1: Type Definitions (30 minutes)

### Step 1.1: Extend map.types.ts

Add distance line types to the existing type file.

**File**: `src/types/map.types.ts`

```typescript
// Add to existing file

export interface DistanceLine {
  id: string;
  startPoint: Coordinate;
  endPoint: Coordinate;
  distanceMeters: number;
  distanceDisplay: string;
  bearing?: number; // Right map only
  visible: boolean;
}

export interface LineEndpoint {
  id: string;
  position: Coordinate;
  isDragging: boolean;
}

export interface LineStyle {
  color: string;
  weight: number;
  opacity: number;
  dashArray?: string;
  endpointRadius: number;
  endpointFillColor: string;
  endpointBorderColor: string;
  endpointBorderWeight: number;
}

export interface LineOrientation {
  bearing: number; // 0-360 degrees
  isRotating: boolean;
  rotationAnchor: Coordinate;
}

export type MapSide = 'left' | 'right';
export type DistanceUnit = 'meters' | 'kilometers' | 'miles' | 'feet';
```

**Validation**: TypeScript compiles without errors.

---

## Phase 2: Geodesic Calculations (1 hour)

### Step 2.1: Create useGeodesic Composable

Implement Haversine formula for distance calculations.

**File**: `src/composables/useGeodesic.ts`

```typescript
import type { Coordinate } from '../types/map.types';

const EARTH_RADIUS_METERS = 6371000;

export function useGeodesic() {
  /**
   * Calculate geodesic distance between two points using Haversine formula
   * Accuracy: ±0.5% for distances up to 20,000km
   */
  function calculateDistance(
    start: Coordinate,
    end: Coordinate
  ): number {
    const φ1 = (start.lat * Math.PI) / 180;
    const φ2 = (end.lat * Math.PI) / 180;
    const Δφ = ((end.lat - start.lat) * Math.PI) / 180;
    const Δλ = ((end.lng - start.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_METERS * c; // Distance in meters
  }

  /**
   * Calculate bearing from start to end point
   * Returns: 0-360 degrees (0 = North, 90 = East)
   */
  function calculateBearing(
    start: Coordinate,
    end: Coordinate
  ): number {
    const φ1 = (start.lat * Math.PI) / 180;
    const φ2 = (end.lat * Math.PI) / 180;
    const Δλ = ((end.lng - start.lng) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);
    return ((θ * 180) / Math.PI + 360) % 360;
  }

  /**
   * Calculate destination point given start, distance, and bearing
   * Used for right map line rotation
   */
  function calculateDestinationPoint(
    start: Coordinate,
    distanceMeters: number,
    bearingDegrees: number
  ): Coordinate {
    const φ1 = (start.lat * Math.PI) / 180;
    const λ1 = (start.lng * Math.PI) / 180;
    const θ = (bearingDegrees * Math.PI) / 180;
    const δ = distanceMeters / EARTH_RADIUS_METERS;

    const φ2 = Math.asin(
      Math.sin(φ1) * Math.cos(δ) +
      Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
    );

    const λ2 =
      λ1 +
      Math.atan2(
        Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
        Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
      );

    return {
      lat: (φ2 * 180) / Math.PI,
      lng: (λ2 * 180) / Math.PI,
    };
  }

  /**
   * Format distance for display
   */
  function formatDistance(
    meters: number,
    unit: 'meters' | 'kilometers' | 'miles' | 'feet' = 'kilometers'
  ): string {
    switch (unit) {
      case 'meters':
        return `${meters.toFixed(1)} m`;
      case 'kilometers':
        return `${(meters / 1000).toFixed(2)} km`;
      case 'miles':
        return `${(meters / 1609.34).toFixed(2)} mi`;
      case 'feet':
        return `${(meters * 3.28084).toFixed(1)} ft`;
    }
  }

  return {
    calculateDistance,
    calculateBearing,
    calculateDestinationPoint,
    formatDistance,
  };
}
```

**Validation**: Create test file `tests/unit/useGeodesic.spec.ts` (optional but recommended):

```typescript
import { describe, it, expect } from 'vitest';
import { useGeodesic } from '@/composables/useGeodesic';

describe('useGeodesic', () => {
  const { calculateDistance, calculateBearing } = useGeodesic();

  it('calculates distance: NYC to LA', () => {
    const nyc = { lat: 40.7128, lng: -74.0060 };
    const la = { lat: 34.0522, lng: -118.2437 };
    const distance = calculateDistance(nyc, la);
    
    // Expected: ~3936 km
    expect(distance).toBeGreaterThan(3900000);
    expect(distance).toBeLessThan(4000000);
  });

  it('calculates bearing: North', () => {
    const start = { lat: 0, lng: 0 };
    const end = { lat: 10, lng: 0 };
    const bearing = calculateBearing(start, end);
    
    expect(bearing).toBeCloseTo(0, 1); // 0° = North
  });
});
```

Run: `npm run test` (if Vitest configured)

---

## Phase 3: Line State Management (1.5 hours)

### Step 3.1: Create useDistanceLine Composable

Manages line state and coordinates.

**File**: `src/composables/useDistanceLine.ts`

```typescript
import { ref, computed, shallowRef } from 'vue';
import type { Ref } from 'vue';
import L from 'leaflet';
import type {
  DistanceLine,
  Coordinate,
  LineStyle,
  MapSide,
} from '../types/map.types';
import { useGeodesic } from './useGeodesic';

export interface UseDistanceLineOptions {
  map: Ref<L.Map | null>;
  side: MapSide;
  style?: Partial<LineStyle>;
}

export function useDistanceLine(options: UseDistanceLineOptions) {
  const { map, side, style: customStyle } = options;
  const { calculateDistance, calculateBearing, formatDistance } = useGeodesic();

  // Line state
  const line = ref<DistanceLine | null>(null);
  
  // Leaflet objects (shallowRef to avoid reactivity)
  const polyline = shallowRef<L.Polyline | null>(null);
  const startMarker = shallowRef<L.CircleMarker | null>(null);
  const endMarker = shallowRef<L.CircleMarker | null>(null);

  // Default styling
  const defaultStyle: LineStyle = {
    color: '#FF0000',
    weight: 3,
    opacity: 0.8,
    endpointRadius: 8,
    endpointFillColor: '#FF0000',
    endpointBorderColor: '#FFFFFF',
    endpointBorderWeight: 2,
    ...customStyle,
  };

  // Computed properties
  const isVisible = computed(() => line.value?.visible ?? false);
  const distanceMeters = computed(() => line.value?.distanceMeters ?? 0);

  /**
   * Create new line from two points
   */
  function createLine(start: Coordinate, end: Coordinate): DistanceLine {
    const distance = calculateDistance(start, end);
    const bearing = side === 'right' ? calculateBearing(start, end) : undefined;

    const newLine: DistanceLine = {
      id: `line-${side}-${Date.now()}`,
      startPoint: start,
      endPoint: end,
      distanceMeters: distance,
      distanceDisplay: formatDistance(distance),
      bearing,
      visible: true,
    };

    line.value = newLine;
    renderLine();

    return newLine;
  }

  /**
   * Update line endpoint
   */
  function updateEndpoint(
    endpointType: 'start' | 'end',
    newPosition: Coordinate
  ): void {
    if (!line.value) return;

    if (endpointType === 'start') {
      line.value.startPoint = newPosition;
    } else {
      line.value.endPoint = newPosition;
    }

    // Recalculate distance
    line.value.distanceMeters = calculateDistance(
      line.value.startPoint,
      line.value.endPoint
    );
    line.value.distanceDisplay = formatDistance(line.value.distanceMeters);

    // Update bearing (right map)
    if (side === 'right') {
      line.value.bearing = calculateBearing(
        line.value.startPoint,
        line.value.endPoint
      );
    }

    renderLine();
  }

  /**
   * Render line on Leaflet map
   */
  function renderLine(): void {
    if (!map.value || !line.value) return;

    const { startPoint, endPoint } = line.value;

    // Remove existing line
    if (polyline.value) {
      map.value.removeLayer(polyline.value);
    }
    if (startMarker.value) {
      map.value.removeLayer(startMarker.value);
    }
    if (endMarker.value) {
      map.value.removeLayer(endMarker.value);
    }

    // Create polyline
    polyline.value = L.polyline(
      [
        [startPoint.lat, startPoint.lng],
        [endPoint.lat, endPoint.lng],
      ],
      {
        color: defaultStyle.color,
        weight: defaultStyle.weight,
        opacity: defaultStyle.opacity,
        dashArray: defaultStyle.dashArray,
      }
    ).addTo(map.value);

    // Create endpoint markers
    startMarker.value = L.circleMarker([startPoint.lat, startPoint.lng], {
      radius: defaultStyle.endpointRadius,
      fillColor: defaultStyle.endpointFillColor,
      fillOpacity: 1,
      color: defaultStyle.endpointBorderColor,
      weight: defaultStyle.endpointBorderWeight,
    }).addTo(map.value);

    endMarker.value = L.circleMarker([endPoint.lat, endPoint.lng], {
      radius: defaultStyle.endpointRadius,
      fillColor: defaultStyle.endpointFillColor,
      fillOpacity: 1,
      color: defaultStyle.endpointBorderColor,
      weight: defaultStyle.endpointBorderWeight,
    }).addTo(map.value);
  }

  /**
   * Clear line from map
   */
  function clearLine(): void {
    if (!map.value) return;

    if (polyline.value) {
      map.value.removeLayer(polyline.value);
      polyline.value = null;
    }
    if (startMarker.value) {
      map.value.removeLayer(startMarker.value);
      startMarker.value = null;
    }
    if (endMarker.value) {
      map.value.removeLayer(endMarker.value);
      endMarker.value = null;
    }

    line.value = null;
  }

  return {
    line,
    polyline,
    startMarker,
    endMarker,
    isVisible,
    distanceMeters,
    createLine,
    updateEndpoint,
    clearLine,
    renderLine,
  };
}
```

**Validation**: Import in a test component and verify `createLine()` renders correctly.

---

## Phase 4: Line Creation UI (2 hours)

### Step 4.1: Implement Two-Click Creation

Add click handling for line creation mode.

**File**: `src/composables/useLineCreation.ts`

```typescript
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import L from 'leaflet';
import type { Coordinate } from '../types/map.types';

export interface UseLineCreationOptions {
  map: Ref<L.Map | null>;
  onLineCreated: (start: Coordinate, end: Coordinate) => void;
}

export function useLineCreation(options: UseLineCreationOptions) {
  const { map, onLineCreated } = options;

  const isActive = ref(false);
  const firstClick = ref<Coordinate | null>(null);
  const previewLine = ref<L.Polyline | null>(null);

  const isAwaitingSecondClick = computed(
    () => isActive.value && firstClick.value !== null
  );

  /**
   * Activate line creation mode
   */
  function activate(): void {
    isActive.value = true;
    firstClick.value = null;
    
    if (map.value) {
      map.value.getContainer().style.cursor = 'crosshair';
    }
  }

  /**
   * Deactivate line creation mode
   */
  function deactivate(): void {
    isActive.value = false;
    firstClick.value = null;
    removePreviewLine();
    
    if (map.value) {
      map.value.getContainer().style.cursor = '';
    }
  }

  /**
   * Handle map click during creation mode
   */
  function handleMapClick(e: L.LeafletMouseEvent): void {
    if (!isActive.value) return;

    const clickCoord: Coordinate = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    };

    if (!firstClick.value) {
      // First click: Set start point
      firstClick.value = clickCoord;
      createPreviewLine(clickCoord);
    } else {
      // Second click: Complete line
      removePreviewLine();
      onLineCreated(firstClick.value, clickCoord);
      deactivate();
    }
  }

  /**
   * Handle mouse move to update preview line
   */
  function handleMouseMove(e: L.LeafletMouseEvent): void {
    if (!isAwaitingSecondClick.value || !map.value) return;

    const currentCoord: Coordinate = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    };

    updatePreviewLine(currentCoord);
  }

  /**
   * Create preview line from first click
   */
  function createPreviewLine(start: Coordinate): void {
    if (!map.value) return;

    previewLine.value = L.polyline(
      [
        [start.lat, start.lng],
        [start.lat, start.lng], // Will update on mousemove
      ],
      {
        color: '#FF0000',
        weight: 2,
        opacity: 0.5,
        dashArray: '5, 5',
      }
    ).addTo(map.value);
  }

  /**
   * Update preview line endpoint
   */
  function updatePreviewLine(end: Coordinate): void {
    if (!previewLine.value || !firstClick.value) return;

    previewLine.value.setLatLngs([
      [firstClick.value.lat, firstClick.value.lng],
      [end.lat, end.lng],
    ]);
  }

  /**
   * Remove preview line from map
   */
  function removePreviewLine(): void {
    if (previewLine.value && map.value) {
      map.value.removeLayer(previewLine.value);
      previewLine.value = null;
    }
  }

  return {
    isActive,
    isAwaitingSecondClick,
    activate,
    deactivate,
    handleMapClick,
    handleMouseMove,
  };
}
```

**Validation**: Call `activate()` and click map twice to verify line creation.

---

## Phase 5: Basic Component (1.5 hours)

### Step 5.1: Create DistanceLine Component

Minimal component to integrate composables.

**File**: `src/components/DistanceLine.vue`

```vue
<template>
  <div class="distance-line">
    <!-- Slot for custom UI overlays -->
    <slot
      :line="line"
      :distance-display="line?.distanceDisplay ?? ''"
      :is-creating="lineCreation.isActive.value"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, toRef } from 'vue';
import type L from 'leaflet';
import type { DistanceLine as DistanceLineType, MapSide } from '../types/map.types';
import { useDistanceLine } from '../composables/useDistanceLine';
import { useLineCreation } from '../composables/useLineCreation';

// Props
interface Props {
  map: L.Map | null;
  side: MapSide;
  creationMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  creationMode: false,
});

// Events
const emit = defineEmits<{
  'line-created': [line: DistanceLineType];
  'distance-changed': [event: {
    distanceMeters: number;
    distanceDisplay: string;
    startPoint: { lat: number; lng: number };
    endPoint: { lat: number; lng: number };
  }];
}>();

// State
const mapRef = toRef(props, 'map');

// Composables
const distanceLine = useDistanceLine({
  map: mapRef as any,
  side: props.side,
});

const lineCreation = useLineCreation({
  map: mapRef as any,
  onLineCreated: (start, end) => {
    const newLine = distanceLine.createLine(start, end);
    emit('line-created', newLine);
    emit('distance-changed', {
      distanceMeters: newLine.distanceMeters,
      distanceDisplay: newLine.distanceDisplay,
      startPoint: newLine.startPoint,
      endPoint: newLine.endPoint,
    });
  },
});

// Expose methods for parent
defineExpose({
  clearLine: distanceLine.clearLine,
  enterCreationMode: lineCreation.activate,
  exitCreationMode: lineCreation.deactivate,
});

// Watch creation mode prop
watch(
  () => props.creationMode,
  (newValue) => {
    if (newValue) {
      lineCreation.activate();
    } else {
      lineCreation.deactivate();
    }
  }
);

// Setup map event listeners
onMounted(() => {
  if (!props.map) return;

  props.map.on('click', lineCreation.handleMapClick);
  props.map.on('mousemove', lineCreation.handleMouseMove);
});

onUnmounted(() => {
  if (!props.map) return;

  props.map.off('click', lineCreation.handleMapClick);
  props.map.off('mousemove', lineCreation.handleMouseMove);
  
  distanceLine.clearLine();
});

// Expose line for parent access
const { line } = distanceLine;
</script>

<style scoped>
.distance-line {
  position: relative;
  pointer-events: none;
}
</style>
```

**Validation**: Integrate into MapPanel and test line creation.

---

## Phase 6: Integration with MapPanel (1 hour)

### Step 6.1: Add DistanceLine to MapPanel

Extend MapPanel to include distance line tool.

**File**: `src/components/MapPanel.vue` (modify existing)

Add to `<script setup>`:

```typescript
// Add import
import DistanceLine from './DistanceLine.vue';

// Add props
interface Props {
  // ... existing props
  showDistanceLine?: boolean;
  lineCreationMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  // ... existing defaults
  showDistanceLine: false,
  lineCreationMode: false,
});

// Add events
const emit = defineEmits<{
  // ... existing events
  'distance-changed': [event: any];
  'line-created': [line: any];
}>();
```

Add to template:

```vue
<template>
  <div ref="containerRef" class="map-panel">
    <!-- ... existing content -->
    
    <!-- Distance Line Overlay -->
    <DistanceLine
      v-if="showDistanceLine && mapInstance"
      :map="mapInstance"
      :side="id.includes('left') ? 'left' : 'right'"
      :creation-mode="lineCreationMode"
      @line-created="emit('line-created', $event)"
      @distance-changed="emit('distance-changed', $event)"
    />
  </div>
</template>
```

---

## Phase 7: Left-Right Synchronization (1 hour)

### Step 7.1: Implement Sync in Parent Component

Wire up left and right maps to synchronize distance.

**File**: `src/App.vue` or parent container

```vue
<script setup lang="ts">
import { ref } from 'vue';
import MapContainer from './components/MapContainer.vue';
import MapPanel from './components/MapPanel.vue';

const leftLineDistance = ref(0);
const rightLineRef = ref<InstanceType<typeof DistanceLine>>();

const showDistanceTool = ref(false);
const isCreatingLine = ref(false);

function handleLeftDistanceChanged(event: any) {
  leftLineDistance.value = event.distanceMeters;
  
  // Update right map line (will implement updateDistance method next)
  // rightLineRef.value?.updateDistance(event.distanceMeters);
}

function handleLineCreated() {
  isCreatingLine.value = false;
}

function activateDistanceTool() {
  showDistanceTool.value = true;
  isCreatingLine.value = true;
}
</script>

<template>
  <div class="app">
    <button @click="activateDistanceTool">
      Measure Distance
    </button>
    
    <MapContainer>
      <template #left>
        <MapPanel
          id="left-map"
          :show-distance-line="showDistanceTool"
          :line-creation-mode="isCreatingLine"
          @distance-changed="handleLeftDistanceChanged"
          @line-created="handleLineCreated"
        />
      </template>
      
      <template #right>
        <MapPanel
          id="right-map"
          :show-distance-line="showDistanceTool"
          :line-creation-mode="false"
        />
        <!-- Right map line auto-syncs via useLineSync composable (Phase 8) -->
      </template>
    </MapContainer>
  </div>
</template>
```

---

## Phase 8: Testing & Polish (1 hour)

### Step 8.1: Manual Testing Checklist

- [ ] Click two points on left map → line appears
- [ ] Line endpoints remain fixed when zooming/panning
- [ ] Distance calculation displays correctly (check with known locations)
- [ ] Right map shows line with same length
- [ ] Preview line visible between clicks
- [ ] Crosshair cursor during creation mode
- [ ] Only one line exists at a time (new creation replaces old)

### Step 8.2: Accessibility Check

- [ ] Distance announced to screen reader on creation
- [ ] ARIA labels present on interactive elements
- [ ] Keyboard navigation functional (Tab to endpoints)

### Step 8.3: Performance Validation

Test with browser DevTools:
- Line creation: Should be <100ms
- Map interactions remain smooth (60fps)
- No memory leaks (check with repeated line creation/deletion)

---

## Next Steps (Future Enhancements)

After completing the quickstart:

1. **Add Drag Functionality**: Implement useLineDrag composable for endpoint dragging
2. **Add Rotation**: Implement right map line rotation (keyboard and mouse)
3. **Add unit tests**: Test geodesic calculations and line state management
4. **Improve UI**: Add distance label tooltip, endpoint hover effects
5. **Add keyboard shortcuts**: Space to activate tool, Escape to cancel

Refer to:
- [data-model.md](data-model.md) for complete entity specifications
- [contracts/DistanceLine.contract.md](contracts/DistanceLine.contract.md) for full API
- [research.md](research.md) for implementation details and anti-patterns

---

## Troubleshooting

### Line not visible after creation

**Cause**: Map instance not properly passed to DistanceLine component

**Fix**: Verify `mapInstance` ref is correctly extracted from useLeafletMap composable and passed via prop

### Distance calculation incorrect

**Cause**: Haversine formula may have coordinate order reversed

**Fix**: Verify latitude comes before longitude in calculations: `[lat, lng]` not `[lng, lat]`

### Preview line not updating

**Cause**: Mouse move events not registered

**Fix**: Ensure `map.on('mousemove', handler)` called on component mount

### TypeScript errors with Leaflet types

**Cause**: @types/leaflet version mismatch

**Fix**: `npm install --save-dev @types/leaflet@^1.9.8`

---

**Quickstart Version**: 1.0.0  
**Date**: February 28, 2026  
**Estimated Completion**: 6-8 hours for working prototype  
**Next Command**: `/speckit.tasks` to generate detailed task breakdown
