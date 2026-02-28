# Component Contract: DistanceLine

**Version**: 1.0.0  
**Status**: Draft  
**Date**: February 28, 2026

---

## Purpose

The DistanceLine component renders an interactive distance line overlay on a Leaflet map. It provides draggable endpoints for the left map and rotatable line for the right map, with real-time distance calculations and visual feedback.

**Interface Design**: This contract defines the `DistanceLine` interface (5 attributes) as the component's public API. The full internal state is documented as `DistanceLineState` (9 attributes) in [data-model.md](../data-model.md). The component interface is intentionally simplified to expose only what parent components need.\n\n---

## Component Signature

```typescript
interface DistanceLineProps {
  /** Leaflet map instance to render line on */
  map: L.Map;
  
  /** Which map side this line belongs to */
  side: 'left' | 'right';
  
  /** Current line state (managed by parent) */
  line: DistanceLine | null;
  
  /** Whether line is in creation mode */
  creationMode?: boolean;
  
  /** Styling overrides */
  style?: Partial<LineStyle>;
  
  /** Whether endpoints are draggable (default: true for left, false for right) */
  draggable?: boolean;
  
  /** Whether line can be rotated (default: false for left, true for right) */
  rotatable?: boolean;
  
  /** Distance unit for display */
  unit?: 'meters' | 'kilometers' | 'miles' | 'feet';
}

interface LineStyle {
  color: string;
  weight: number;
  opacity: number;
  dashArray?: string;
  endpointRadius: number;
  endpointFillColor: string;
  endpointBorderColor: string;
  endpointBorderWeight: number;
}

interface DistanceLine {
  id: string;
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  distanceMeters: number;
  bearing?: number; // Right map only
}
```

---

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `map` | `L.Map` | Leaflet map instance where line will be rendered. Component listens to map events for click detection. |
| `side` | `'left' \| 'right'` | Identifies which map panel this line belongs to. Affects behavior: left is source of distance, right is synchronized. |
| `line` | `DistanceLine \| null` | Current line state. `null` means no line exists. Parent manages this state. |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `creationMode` | `boolean` | `false` | When `true`, component enters line creation mode. User clicks twice to define endpoints. |
| `style` | `Partial<LineStyle>` | See defaults | Visual styling overrides. Merges with default styles. |
| `draggable` | `boolean` | `true` (left)<br>`false` (right) | Whether endpoints can be dragged. Auto-defaults based on `side`. |
| `rotatable` | `boolean` | `false` (left)<br>`true` (right) | Whether line can be rotated. Auto-defaults based on `side`. |
| `unit` | `'meters' \| 'kilometers' \| 'miles' \| 'feet'` | `'kilometers'` | Distance unit for display in tooltips and events. |

### Default Styles

```typescript
const DEFAULT_STYLE: LineStyle = {
  color: '#FF0000',
  weight: 3,
  opacity: 0.8,
  dashArray: undefined, // Solid line
  endpointRadius: 8,
  endpointFillColor: '#FF0000',
  endpointBorderColor: '#FFFFFF',
  endpointBorderWeight: 2
};
```

---

## Events

### line-created

Emitted when user completes line creation (second click).

**Payload**:
```typescript
{
  line: DistanceLine; // Newly created line
  timestamp: number;  // Creation timestamp (ms)
}
```

**Example**:
```vue
<DistanceLine @line-created="handleLineCreated" />
```

---

### endpoint-drag-start

Emitted when user begins dragging an endpoint.

**Payload**:
```typescript
{
  endpointType: 'start' | 'end';
  position: { lat: number; lng: number };
  timestamp: number;
}
```

---

### endpoint-drag

Emitted continuously during endpoint drag (debounced to 16ms).

**Payload**:
```typescript
{
  endpointType: 'start' | 'end';
  position: { lat: number; lng: number }; // New position
  distanceMeters: number; // Updated distance
  timestamp: number;
}
```

---

### endpoint-drag-end

Emitted when user releases dragged endpoint.

**Payload**:
```typescript
{
  endpointType: 'start' | 'end';
  position: { lat: number; lng: number }; // Final position
  distanceMeters: number; // Final distance
  timestamp: number;
}
```

---

### distance-changed

Emitted when line distance changes (after drag completes).

**Payload**:
```typescript
{
  distanceMeters: number;
  distanceDisplay: string; // Formatted: "5.2 km"
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  timestamp: number;
}
```

---

### line-rotated

Emitted when right map line is rotated.

**Payload**:
```typescript
{
  bearing: number; // New bearing (0-360)
  distanceMeters: number; // Distance preserved
  endPoint: { lat: number; lng: number }; // Recalculated endpoint
  timestamp: number;
}
```

---

### line-deleted

Emitted when line is removed (e.g., new line creation replaces old).

**Payload**:
```typescript
{
  lineId: string;
  timestamp: number;
}
```

---

## Slots

### default

Content rendered as overlay controls on the line.

**Slot Props**:
```typescript
{
  line: DistanceLine | null;
  distanceDisplay: string; // Formatted distance
  isCreating: boolean;
  isDragging: boolean;
  isRotating: boolean;
}
```

**Example**:
```vue
<DistanceLine v-slot="{ line, distanceDisplay }">
  <div class="distance-label">
    {{ distanceDisplay }}
  </div>
</DistanceLine>
```

---

### distance-label

Custom distance display label.

**Slot Props**:
```typescript
{
  distanceMeters: number;
  distanceDisplay: string;
  unit: string;
}
```

**Example**:
```vue
<DistanceLine>
  <template #distance-label="{ distanceDisplay }">
    <strong>{{ distanceDisplay }}</strong>
  </template>
</DistanceLine>
```

---

## Exposed Methods

Methods exposed via `defineExpose` for parent components.

### clearLine()

Removes the current line from the map.

**Signature**: `() => void`

**Example**:
```typescript
const distanceLineRef = ref<InstanceType<typeof DistanceLine>>();
distanceLineRef.value?.clearLine();
```

---

### enterCreationMode()

Activates line creation mode programmatically.

**Signature**: `() => void`

**Example**:
```typescript
distanceLineRef.value?.enterCreationMode();
```

---

### exitCreationMode()

Cancels line creation mode.

**Signature**: `() => void`

---

### rotateLine(deltaDegrees: number)

Rotates the line by specified degrees (right map only).

**Signature**: `(deltaDegrees: number) => void`

**Parameters**:
- `deltaDegrees`: Rotation amount. Positive = clockwise, negative = counter-clockwise

**Example**:
```typescript
distanceLineRef.value?.rotateLine(15); // Rotate 15° clockwise
```

---

### updateDistance(distanceMeters: number)

Updates line length to specified distance (right map only, preserves bearing).

**Signature**: `(distanceMeters: number) => void`

**Parameters**:
- `distanceMeters`: New distance in meters

**Usage**: Called by parent to sync right map line with left map line distance.

---

### getLineState()

Returns current line state snapshot.

**Signature**: `() => DistanceLine | null`

**Returns**: Deep copy of current line state, or `null` if no line exists.

---

## Behavior Specifications

### Line Creation Workflow (Left Map)

1. **Activation**: Parent sets `creationMode={true}` or calls `enterCreationMode()`
2. **First Click**: User clicks map → store first point, show preview line
3. **Preview**: Preview line updates as cursor moves (dashed style, 0.5 opacity)
4. **Second Click**: User clicks map → finalize line, emit `line-created` event
5. **Completion**: Exit creation mode automatically, preview line removed

**Visual States**:
- Inactive: No line visible
- Awaiting first click: Crosshair cursor
- Awaiting second click: Preview line follows cursor
- Active: Solid line with draggable endpoints

---

### Endpoint Dragging (Left Map)

1. **Grab**: User mousedown on endpoint → change cursor to 'grabbing'
2. **Drag**: User moves mouse → update endpoint position in real-time
   - Emit `endpoint-drag` event (debounced 16ms)
   - Update line polyline via Leaflet `setLatLngs()`
   - Recalculate distance continuously
3. **Release**: User mouseup → finalize position
   - Emit `endpoint-drag-end` event
   - Emit `distance-changed` event
   - Change cursor back to 'grab'

**Constraints**:
- Only one endpoint draggable at a time
- Coordinates clamped to valid lat/lng ranges
- Drag blocked when `draggable={false}`

---

### Line Rotation (Right Map)

**Method 1: Mouse Drag**
1. User clicks and drags line midpoint in circular motion
2. Calculate angle from line center to cursor position
3. Update bearing, recalculate endpoint using destination point formula
4. Emit `line-rotated` event on release

**Method 2: Keyboard**
- `←`: Rotate -5°
- `→`: Rotate +5°
- `Shift + ←`: Rotate -15°
- `Shift + →`: Rotate +15°

**Constraints**:
- Distance (length) remains locked during rotation
- Start point remains fixed, end point moves
- Rotation blocked when `rotatable={false}`

---

### Distance Synchronization

**Left → Right Direction** (via parent component):

```vue
<template>
  <!-- Left map: Source of distance -->
  <DistanceLine
    :map="leftMap"
    side="left"
    :line="leftLine"
    @distance-changed="syncToRightMap"
  />
  
  <!-- Right map: Slave to distance -->
  <DistanceLine
    ref="rightLineRef"
    :map="rightMap"
    side="right"
    :line="rightLine"
    :rotatable="true"
  />
</template>

<script setup>
function syncToRightMap(event) {
  // Update right line length while preserving bearing
  rightLineRef.value?.updateDistance(event.distanceMeters);
}
</script>
```

**Timing**: Synchronization must complete within 100ms (SC-006).

---

## Accessibility

### Keyboard Navigation

| Key | Action | Context |
|-----|--------|---------|
| `Tab` | Focus next endpoint | Line exists, endpoints visible |
| `Arrow keys` | Move focused endpoint | Endpoint focused (1px ≈ 100m) |
| `Shift + Arrow` | Move endpoint (large step) | Endpoint focused (10px ≈ 1km) |
| `Enter` | Confirm endpoint position | During drag |
| `Escape` | Cancel creation/drag | Creation mode or dragging |
| `Delete` | Remove line | Line focused |
| `← / →` | Rotate line | Right map, line focused |

### ARIA Attributes

```html
<div
  role="application"
  aria-label="Distance measurement tool"
  aria-describedby="distance-line-instructions"
>
  <div id="distance-line-instructions" class="sr-only">
    Click two points to measure distance. Drag endpoints to adjust. 
    Use arrow keys to move endpoints. Press Delete to remove line.
  </div>
  
  <!-- Line polyline (purely visual) -->
  <svg role="img" aria-label="Distance line">
    <line ... />
  </svg>
  
  <!-- Endpoint markers -->
  <div
    role="button"
    tabindex="0"
    aria-label="Line start point at latitude 40.71, longitude -74.00"
    aria-grabbed="false"
  >
    <!-- Start endpoint circle -->
  </div>
  
  <!-- Live region for distance updates -->
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="sr-only"
  >
    {{ distanceAnnouncement }}
  </div>
</div>
```

### Screen Reader Announcements

- Line created: "Distance line created. Length: 5.2 kilometers."
- Endpoint dragged: "Distance updated: 3.8 miles." (on `dragend` only)
- Line rotated: "Line rotated to bearing 45 degrees."
- Line deleted: "Distance line removed."

**Debouncing**: Announcements during drag limited to 1 per second to avoid overwhelming screen reader users.

---

## Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Line creation | <100ms | Time from second click to line visible |
| Endpoint drag update | <16ms | Per-frame update during drag (60fps) |
| Distance calculation | <10ms | Haversine formula execution time |
| Rotation update | <16ms | Per-frame update during rotation (60fps) |
| Synchronization latency | <100ms | Left distance change → right line update |

**Optimization Strategies**:
- Debounce drag events to 16ms (RAF-scheduled)
- Cache distance calculations for identical coordinates
- Use `shallowRef` for Leaflet objects to avoid Vue reactivity overhead
- Throttle screen reader announcements to 1/sec during drag

---

## Error Handling

### Invalid Coordinates

**Scenario**: Dragged endpoint exceeds valid lat/lng range.

**Behavior**:
- Clamp coordinates to bounds (lat: -90 to 90, lng: -180 to 180)
- Log warning: `[DistanceLine] Coordinate clamped to valid range`
- Continue operation normally (no user-facing error)

### Map Not Initialized

**Scenario**: `map` prop is `null` or undefined.

**Behavior**:
- Log error: `[DistanceLine] Map instance required`
- Render placeholder: "Map not ready"
- Disable all interactions until map becomes available

### Zero-Length Line

**Scenario**: Both endpoints at identical coordinates.

**Behavior**:
- Allow creation (valid state, distance = 0m)
- Display: "0 m"
- Disable rotation on right map (bearing undefined for zero-length)
- Show tooltip: "Line has zero length. Drag an endpoint to measure."

---

## Testing Contract

### Unit Tests (Recommended)

**File**: `tests/unit/DistanceLine.spec.ts`

- ✅ Distance calculation accuracy (known distances)
- ✅ Endpoint drag updates line state
- ✅ Rotation preserves distance (right map)
- ✅ Coordinate clamping for invalid values
- ✅ Event emission timing (drag, dragend, distance-changed)

### Component Tests (Optional)

- ✅ Line creation workflow (two clicks)
- ✅ Visual rendering (polyline + endpoints)
- ✅ Keyboard navigation (arrow keys, delete)
- ✅ Accessibility (ARIA labels, screen reader announcements)

### Integration Tests (Optional)

- ✅ Left-right synchronization via parent component
- ✅ Line replacement (FR-011: single line at a time)
- ✅ Performance: Drag latency <100ms

---

## Dependencies

### External Libraries

- **leaflet** (^1.9.4): Map rendering, polyline drawing, marker dragging
- **Vue 3** (^3.4.0): Component framework, reactivity

### Internal Dependencies

- **useGeodesic** composable: Distance and bearing calculations
- **useLineDrag** composable: Drag interaction state management
- **useLineSync** composable: Left-right synchronization logic
- **map.types.ts**: Shared TypeScript interfaces

---

## Migration Notes

### From No Distance Tool (Initial Implementation)

**Breaking Changes**: None (new feature)

**Integration Steps**:
1. Add `<DistanceLine>` component inside `<MapPanel>` default slot
2. Create parent state to manage left/right line synchronization
3. Wire up event handlers for `distance-changed` and `line-rotated`

**Example Integration**:
```vue
<MapPanel ref="leftMapRef" :id="'left-map'" :config="leftMapConfig">
  <DistanceLine
    v-if="distanceToolActive"
    :map="leftMapRef?.mapInstance"
    side="left"
    :line="leftLine"
    :creation-mode="isCreatingLine"
    @line-created="handleLineCreated"
    @distance-changed="syncDistance"
  />
</MapPanel>
```

---

## Future Enhancements (Out of Scope for v1.0.0)

- Multiple lines simultaneously (requires data structure refactor)
- Line persistence (save/load from storage)
- Line snapping to roads or paths
- Curved lines (geodesic arcs instead of straight lines)
- Elevation profile along line
- Export line coordinates (GPX, GeoJSON)

---

## References

- Data Model: [../data-model.md](../data-model.md)
- Research: [../research.md](../research.md)
- Feature Spec: [../spec.md](../spec.md)
- MapPanel Contract: [../../001-dual-map-view/contracts/MapPanel.contract.md](../../001-dual-map-view/contracts/MapPanel.contract.md)

---

**Contract Version**: 1.0.0  
**Date**: February 28, 2026  
**Status**: Draft (finalized after implementation review)
