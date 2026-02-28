# MapPanel Component Contract

**Version**: 1.0.0  
**Type**: Presentational Component (Controlled)  
**Purpose**: Single interactive map instance with independent navigation

---

## Component Overview

`MapPanel` displays an interactive world map using tile-based rendering. Each instance operates independently with its own viewport, zoom level, and interaction state. The component is designed as a controlled component that accepts configuration via props and communicates state changes via events.

**Key Characteristics**:
- Self-contained: Does not depend on sibling map instances
- Accessible: Full keyboard navigation support with focus management
- Resilient: Graceful error handling for tile loading failures
- Performant: Optimized for smooth pan/zoom interactions

---

## Props

### initialCenter

**Type**: `{ lat: number, lng: number }`  
**Default**: `{ lat: 0, lng: 0 }` (null island, off west Africa)  
**Required**: No

Initial geographic center of the map viewport.

**Validation**:
- `lat` must be between -90 and 90 (inclusive)
- `lng` must be between -180 and 180 (inclusive)

**Notes**:
- Only used during component mount, not reactive
- For programmatic center changes, use exposed methods

---

### initialZoom

**Type**: `number` (integer)  
**Default**: `2` (world view)  
**Required**: No

Initial zoom level of the map.

**Validation**:
- Must be between `minZoom` and `maxZoom` (inclusive)
- Non-integer values are rounded down

**Notes**:
- Zoom 2: World view
- Zoom 10: City view
- Zoom 18: Street view (max for most tile providers)

---

### minZoom

**Type**: `number` (integer)  
**Default**: `2`  
**Required**: No

Minimum allowed zoom level.

**Validation**:
- Must be less than `maxZoom`
- Must be non-negative

---

### maxZoom

**Type**: `number` (integer)  
**Default**: `18`  
**Required**: No

Maximum allowed zoom level.

**Validation**:
- Must be greater than `minZoom`

---

### tileUrl

**Type**: `string`  
**Default**: `"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"`  
**Required**: No

URL template for fetching map tiles.

**Template Variables**:
- `{z}`: Zoom level
- `{x}`: Tile X coordinate
- `{y}`: Tile Y coordinate
- `{s}`: Subdomain (a, b, or c)

**Validation**:
- Must contain `{z}`, `{x}`, and `{y}` placeholders
- Must be a valid HTTP/HTTPS URL

---

### attribution

**Type**: `string`  
**Default**: `"© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"`  
**Required**: No

HTML string for map attribution/copyright notice.

**Requirements**:
- Must comply with tile provider's attribution requirements
- For OpenStreetMap: Must include "© OpenStreetMap contributors" with link
- Displayed at bottom-right corner of map

---

### enableKeyboard

**Type**: `boolean`  
**Default**: `true`  
**Required**: No

Enable keyboard navigation for this map panel.

**Behavior**:
- When `true`: Map can receive focus and respond to arrow keys, +/- keys
- When `false`: Keyboard navigation disabled for this panel

---

### id

**Type**: `string`  
**Default**: Auto-generated unique ID  
**Required**: No

Unique identifier for the map panel.

**Purpose**:
- Used for accessibility (ARIA labels)
- Used for focus management between multiple panels
- Used for debugging and logging

---

## Events

### map-ready

**Payload**: `{ mapId: string, center: { lat: number, lng: number }, zoom: number }`  
**Timing**: Emitted once after map initialization completes

Fired when the map is fully initialized and ready for interaction.

**Use Cases**:
- Parent component needs reference to initialized state
- Coordinating actions across multiple map panels
- Analytics tracking

---

### center-changed

**Payload**: `{ mapId: string, center: { lat: number, lng: number } }`  
**Timing**: Emitted after pan operation completes (debounced)

Fired when map center changes due to user pan or programmatic movement.

**Debouncing**:
- Fires after movement stops (not during continuous drag)
- Minimum 150ms delay after last movement

---

### zoom-changed

**Payload**: `{ mapId: string, zoom: number }`  
**Timing**: Emitted after zoom operation completes (debounced)

Fired when zoom level changes due to user interaction or programmatic zoom.

**Debouncing**:
- Fires after zoom stops (not during continuous zoom)
- Minimum 150ms delay after last zoom change

---

### bounds-changed

**Payload**: `{ mapId: string, bounds: { north: number, south: number, east: number, west: number } }`  
**Timing**: Emitted after viewport bounds change (debounced)

Fired when the geographic bounding box of the viewport changes.

**Use Cases**:
- Determining visible area for overlay data
- Synchronizing external data sources

---

### loading-start

**Payload**: `{ mapId: string }`  
**Timing**: Emitted when tile loading begins

Fired when map starts loading tiles (initial load or after navigation).

**Use Cases**:
- Showing loading indicators
- Disabling actions during load

---

### loading-end

**Payload**: `{ mapId: string, success: boolean }`  
**Timing**: Emitted when tile loading completes

Fired when all visible tiles finish loading (success or failure).

---

### error

**Payload**: `{ mapId: string, error: { code: string, message: string, recoverable: boolean } }`  
**Timing**: Emitted when an error occurs

Fired when map encounters an error (tile loading failure, initialization error).

**Error Codes**:
- `INIT_FAILED`: Map initialization failed
- `TILE_LOAD_FAILED`: One or more tiles failed to load
- `NETWORK_ERROR`: Network connectivity issue
- `INVALID_CONFIG`: Invalid prop configuration

---

### focus-gained

**Payload**: `{ mapId: string }`  
**Timing**: Emitted when map panel receives keyboard focus

Fired when user tabs to this map or clicks on it.

---

### focus-lost

**Payload**: `{ mapId: string }`  
**Timing**: Emitted when map panel loses keyboard focus

Fired when focus moves to another element.

---

## Slots

### default

**Slot Props**: None  
**Purpose**: Custom controls or overlays

Renders content above the map (e.g., zoom controls, custom buttons).

**Example Usage**:
```vue
<MapPanel>
  <button @click="resetView">Reset View</button>
</MapPanel>
```

---

### error

**Slot Props**: `{ error: { code: string, message: string }, retry: () => void }`  
**Purpose**: Custom error display

Renders when map encounters an error. If not provided, default error UI is shown.

**Example Usage**:
```vue
<MapPanel>
  <template #error="{ error, retry }">
    <div class="error-panel">
      {{ error.message }}
      <button @click="retry">Retry</button>
    </div>
  </template>
</MapPanel>
```

---

### loading

**Slot Props**: None  
**Purpose**: Custom loading indicator

Renders during tile loading. If not provided, default spinner is shown.

---

## Exposed Methods

Methods accessible via template ref: `<MapPanel ref="mapRef" />`

### setView(center, zoom, options?)

**Signature**: `(center: { lat: number, lng: number }, zoom: number, options?: { animate: boolean, duration: number }) => void`

Programmatically set map center and zoom.

**Parameters**:
- `center`: Target geographic coordinates
- `zoom`: Target zoom level
- `options.animate`: Enable smooth transition (default: true)
- `options.duration`: Animation duration in milliseconds (default: 300)

---

### panTo(center, options?)

**Signature**: `(center: { lat: number, lng: number }, options?: { animate: boolean }) => void`

Pan map to new center without changing zoom.

---

### zoomIn()

**Signature**: `() => void`

Zoom in by one level.

---

### zoomOut()

**Signature**: `() => void`

Zoom out by one level.

---

### fitBounds(bounds, options?)

**Signature**: `(bounds: { north: number, south: number, east: number, west: number }, options?: { padding: number, animate: boolean }) => void`

Adjust viewport to show specified geographic bounds.

**Parameters**:
- `bounds`: Geographic bounding box
- `options.padding`: Padding in pixels (default: 0)
- `options.animate`: Enable smooth transition (default: true)

---

### invalidateSize()

**Signature**: `() => void`

Recalculate map size after container dimensions change.

**Use Case**:
- Call after resizing map container
- Call after showing/hiding parent elements

---

### getCenter()

**Signature**: `() => { lat: number, lng: number }`

Get current map center coordinates.

---

### getZoom()

**Signature**: `() => number`

Get current zoom level.

---

### getBounds()

**Signature**: `() => { north: number, south: number, east: number, west: number }`

Get current viewport bounds.

---

## Accessibility

### ARIA Attributes

- `role="application"`: Map is an interactive application region
- `aria-label`: Descriptive label (e.g., "Interactive map panel 1")
- `aria-live="polite"`: Announces zoom/center changes to screen readers
- `tabindex="0"`: Makes map focusable

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move focus to/from map |
| Arrow Up | Pan north |
| Arrow Down | Pan south |
| Arrow Left | Pan west |
| Arrow Right | Pan east |
| + or = | Zoom in |
| - or _ | Zoom out |
| Escape | Remove focus from map |

### Screen Reader Announcements

- On focus: "Interactive map. Use arrow keys to pan, plus and minus to zoom"
- On zoom change: "Zoom level {level}"
- On center change: "Map centered at {lat}, {lng}"
- On error: "{error message}. Press retry button to try again"

---

## Usage Examples

### Basic Usage

```vue
<MapPanel
  :initial-center="{ lat: 40.7128, lng: -74.0060 }"
  :initial-zoom="12"
  @map-ready="onMapReady"
/>
```

---

### With Custom Error Handling

```vue
<MapPanel
  @error="handleMapError"
>
  <template #error="{ error, retry }">
    <ErrorPanel :message="error.message" @retry="retry" />
  </template>
</MapPanel>
```

---

### With Exposed Methods

```vue
<template>
  <MapPanel ref="mapRef" />
  <button @click="resetToWorldView">Reset View</button>
</template>

<script setup>
import { ref } from 'vue'

const mapRef = ref(null)

function resetToWorldView() {
  mapRef.value?.setView({ lat: 0, lng: 0 }, 2, { animate: true })
}
</script>
```

---

## Contract Version History

- **1.0.0** (2026-02-28): Initial contract specification
