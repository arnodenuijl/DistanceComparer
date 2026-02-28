# Research: Distance Line Tool

**Feature**: Distance Line Tool  
**Date**: February 28, 2026  
**Purpose**: Research technical decisions for implementing distance lines with geodesic calculations and real-time synchronization

---

## Research Areas

### 1. Geodesic Distance Calculation

**Decision**: Manual Haversine formula implementation  
**Rationale**: Sufficient accuracy (<1% error for most Earth distances), zero dependencies, aligns with Principle VII (Simplicity)

**Alternatives Considered**:

| Option | Bundle Size | Accuracy | Pros | Cons |
|--------|------------|----------|------|------|
| Manual Haversine | 0 KB (inline) | ±0.5% up to 20,000km | No dependencies, fast (<1ms) | Assumes spherical Earth |
| @turf/distance | ~15 KB | ±0.01% (ellipsoidal) | High accuracy, battle-tested | Adds dependency |
| @turf/turf (full) | ~100 KB | ±0.01% | Comprehensive library | Massive for single function |
| Leaflet's distance() | 0 KB (built-in) | ±0.5% (spherical) | Already available | Less explicit control |

**Selected Approach**: **Manual Haversine + Leaflet verification**

```typescript
// Haversine formula for geodesic distance
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance in meters
}
```

**Accuracy Validation**: SC-003 requires 99.5% accuracy. Haversine achieves this for distances <20,000km. For polar regions or extreme precision, can upgrade to Vincenty formula or @turf/distance in future.

---

### 2. Leaflet Polyline with Draggable Endpoints

**Decision**: Leaflet Polyline + Custom CircleMarker endpoints with Leaflet.Draggable

**Implementation Pattern**:

```typescript
// Create polyline
const polyline = L.polyline([startLatLng, endLatLng], {
  color: '#FF0000',
  weight: 3,
  opacity: 0.8
}).addTo(map);

// Create draggable endpoint markers
const startMarker = L.circleMarker(startLatLng, {
  radius: 8,
  fillColor: '#FF0000',
  fillOpacity: 1,
  weight: 2,
  color: '#FFFFFF',
  draggable: true // Requires Leaflet.Draggable or leaflet-editable plugin
});

// Alternative: Use L.Marker with custom icon
const endMarker = L.marker(endLatLng, {
  icon: createEndpointIcon(),
  draggable: true
}).addTo(map);

// Update polyline on drag
startMarker.on('drag', (e) => {
  const newLatLng = e.target.getLatLng();
  polyline.setLatLngs([newLatLng, endLatLng]);
  // Trigger distance recalculation and sync to right map
});
```

**Leaflet.Draggable API**:
- Built into Leaflet core, no plugin required for L.Marker
- For custom shapes (CircleMarker), need to instantiate L.Draggable manually
- Events: `dragstart`, `drag`, `dragend`
- Performance: Native browser drag events, no performance concerns

**Alternative Considered**: leaflet-editable plugin
- Provides automatic polyline editing with draggable vertices
- **Rejected**: Adds 20KB dependency, overkill for single line with 2 endpoints
- Manual implementation gives more control over UX (custom markers, visual feedback)

---

### 3. Line Synchronization Between Maps

**Decision**: Reactive composable with Vue watch + Leaflet event bridge

**Architecture**:

```typescript
// useLineSync.ts
export function useLineSync(leftMap, rightMap) {
  const leftLine = ref<DistanceLine | null>(null);
  const rightLine = ref<DistanceLine | null>(null);
  const distance = ref(0); // In meters

  // Watch left line changes → update distance → update right line
  watch(() => leftLine.value, (newLine) => {
    if (!newLine) {
      rightLine.value = null;
      return;
    }
    
    // Calculate distance
    distance.value = calculateDistance(
      newLine.start.lat, newLine.start.lng,
      newLine.end.lat, newLine.end.lng
    );
    
    // Update right line with same distance
    updateRightLineLength(distance.value);
  }, { deep: true });

  function updateRightLineLength(distanceMeters: number) {
    if (!rightLine.value) return;
    
    // Calculate new endpoint based on current orientation and distance
    const bearing = rightLine.value.bearing; // Preserved from last rotation
    const newEnd = calculateDestinationPoint(
      rightLine.value.start,
      distanceMeters,
      bearing
    );
    
    rightLine.value.end = newEnd;
    // Update Leaflet polyline
  }
}
```

**Performance Considerations**:
- Use `watchDebounced` for drag events (debounce: 16ms for 60fps)
- Cache distance calculation result to avoid redundant trigonometry
- Only update right line when distance changes (not on every drag pixel)

**Event Flow**:
```
Left Map: User drags endpoint
  ↓ (Leaflet 'drag' event)
Composable: Update leftLine.value.end
  ↓ (Vue watch)
Composable: Calculate new distance
  ↓ (watch continues)
Composable: Update rightLine.value.end (preserve bearing)
  ↓ (Computed)
Right Map: Leaflet polyline updates via setLatLngs()
```

---

### 4. Right Map Line Rotation

**Decision**: Bearing-based endpoint calculation with mouse drag or keyboard rotation

**Rotation Implementation**:

```typescript
// Calculate destination point given start, distance, and bearing
function calculateDestinationPoint(
  start: Coordinate,
  distanceMeters: number,
  bearingDegrees: number
): Coordinate {
  const R = 6371000; // Earth radius
  const φ1 = start.lat * Math.PI / 180;
  const λ1 = start.lng * Math.PI / 180;
  const θ = bearingDegrees * Math.PI / 180;
  const δ = distanceMeters / R; // Angular distance

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) +
    Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );

  const λ2 = λ1 + Math.atan2(
    Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
    Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
  );

  return {
    lat: φ2 * 180 / Math.PI,
    lng: λ2 * 180 / Math.PI
  };
}

// Calculate bearing from start to end
function calculateBearing(start: Coordinate, end: Coordinate): number {
  const φ1 = start.lat * Math.PI / 180;
  const φ2 = end.lat * Math.PI / 180;
  const Δλ = (end.lng - start.lng) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return (θ * 180 / Math.PI + 360) % 360; // Normalize to 0-360
}
```

**User Interaction Patterns**:

1. **Mouse Drag Rotation**: Click and drag line midpoint in circular motion
   - Calculate angle from line center to mouse position
   - Update bearing, recalculate endpoint using `calculateDestinationPoint`
   - Visual feedback: rotate line in real-time during drag

2. **Keyboard Rotation** (Accessibility):
   - Arrow Left/Right: Rotate ±5 degrees
   - Shift + Arrow: Rotate ±15 degrees
   - Screen reader announces: "Line rotated to bearing 45 degrees"

3. **Touch Rotation**: Two-finger twist gesture (mobile)
   - Use touch rotation angle to update bearing
   - Pinch-to-zoom blocked to prevent accidental rotation

**State Management**:
```typescript
const rightLineBearing = ref(0); // 0-360 degrees, 0 = North

// On rotation
function rotateLine(deltaDegrees: number) {
  rightLineBearing.value = (rightLineBearing.value + deltaDegrees + 360) % 360;
  
  // Recalculate endpoint
  const newEnd = calculateDestinationPoint(
    rightLine.value.start,
    distance.value, // Locked to left line distance
    rightLineBearing.value
  );
  
  rightLine.value.end = newEnd;
  updateLeafletPolyline();
}
```

---

### 5. Performance Optimization for Real-Time Drag

**Decision**: Debounced updates + RAF scheduling + cached calculations

**Performance Strategies**:

1. **Debounce Distance Calculations**:
   ```typescript
   import { useDebounceFn } from '@vueuse/core';
   
   const updateDistance = useDebounceFn((start, end) => {
     distance.value = calculateDistance(start.lat, start.lng, end.lat, end.lng);
   }, 16); // 60fps = 16ms
   ```

2. **RequestAnimationFrame for Visual Updates**:
   ```typescript
   let rafId: number | null = null;
   
   function schedulePolylineUpdate() {
     if (rafId) return; // Already scheduled
     
     rafId = requestAnimationFrame(() => {
       polyline.value?.setLatLngs([start.value, end.value]);
       rafId = null;
     });
   }
   ```

3. **Cache Trigonometric Results**:
   ```typescript
   const distanceCache = new Map<string, number>();
   
   function getCachedDistance(start: Coordinate, end: Coordinate): number {
     const key = `${start.lat},${start.lng}-${end.lat},${end.lng}`;
     
     if (!distanceCache.has(key)) {
       distanceCache.set(key, calculateDistance(start.lat, start.lng, end.lat, end.lng));
     }
     
     return distanceCache.get(key)!;
   }
   ```

4. **Lazy Update Right Map**:
   - Only update right map on `dragend`, not during `drag`
   - OR: Update right map every N milliseconds (throttle: 100ms)
   - Balance: Immediate feedback vs performance

5. **Avoid Reactivity Overhead**:
   - Use `shallowRef` for Leaflet objects (already established pattern from spec 001)
   - Mark large objects as `markRaw()` if they don't need reactivity
   - Batch multiple property updates in single computed or watch

**Measured Performance Targets** (from spec SC-004, SC-006):
- Endpoint drag: <100ms perceived latency → Use debounce 16ms + RAF
- Synchronization: <100ms left→right → Use throttle 50ms for sync updates
- Rotation: 30fps minimum → Use RAF for smooth animation

**Memory Management**:
- Clear distance cache when line deleted (avoid memory leak)
- Remove Leaflet event listeners on component unmount
- Dispose of Draggable instances properly

---

## Key Implementation Decisions Summary

| Decision | Rationale | Alternatives Rejected |
|----------|-----------|----------------------|
| Manual Haversine | Zero dependencies, sufficient accuracy | @turf (overkill), Vincenty (complex) |
| L.Marker draggable | Built-in, no plugin | leaflet-editable (20KB overhead) |
| Vue watch + Leaflet bridge | Fits existing architecture | Global event bus (anti-pattern) |
| Bearing + destination point | Geodesically correct rotation | Simple x/y transforms (incorrect at scale) |
| Debounce + RAF | 60fps smooth, <100ms sync | Immediate updates (janky), heavy throttle (laggy) |

---

## Anti-Patterns to Avoid

1. **Don't wrap Leaflet objects in Vue reactive proxies**
   - Use `shallowRef` for map, polyline, markers
   - Extract coordinates into reactive refs, not entire Leaflet objects

2. **Don't calculate distance on every pixel drag**
   - Debounce to 16ms (60fps) or use dragend event
   - Cache results when possible

3. **Don't use global state for line data**
   - Pass line state via composables, not Vuex/Pinia
   - Each map instance should own its line state

4. **Don't use simple linear interpolation for rotation**
   - Distance lines represent geodesic paths on sphere
   - Must use bearing + destination point calculation

5. **Don't forget to clean up Leaflet event listeners**
   - Remove drag listeners on component unmount
   - Clear polylines from map when line deleted

---

## Testing Recommendations

### Unit Tests (Recommended)

- **useGeodesic.spec.ts**:
  - Test Haversine accuracy against known distances (NYC→LA, London→Tokyo)
  - Test bearing calculation for cardinal directions (N, E, S, W)
  - Test destination point calculation for various bearings
  - Edge cases: Antipodal points, equator crossing, prime meridian crossing

### Component Tests (Optional)

- **DistanceLine.spec.ts**:
  - Test line creation with two clicks
  - Test endpoint drag updates polyline
  - Test line removal on new line creation (FR-011)
  - Test keyboard navigation for rotation

### E2E Tests (Optional)

- Full user workflow: Create line → drag endpoint → verify right map updates
- Performance regression: Measure drag latency (should be <100ms)
- Accessibility: Screen reader announcements, keyboard navigation

---

## References

- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula) - Great circle distance
- [Bearing Calculation](https://www.movable-type.co.uk/scripts/latlong.html) - Forward/reverse bearing
- [Leaflet Draggable API](https://leafletjs.com/reference.html#draggable) - Built-in drag functionality
- [Vue watch API](https://vuejs.org/api/reactivity-core.html#watch) - Reactivity patterns
- Existing research from spec 001: [001-dual-map-view/research.md](../001-dual-map-view/research.md)

---

**Research Version**: 1.0.0  
**Date**: February 28, 2026  
**Next Phase**: Phase 1 - Design artifacts (data-model.md, contracts/, quickstart.md)
