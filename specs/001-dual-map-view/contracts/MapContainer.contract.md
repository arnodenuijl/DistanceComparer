# MapContainer Component Contract

**Version**: 1.0.0  
**Type**: Layout Component  
**Purpose**: Responsive layout wrapper for two MapPanel instances

---

## Component Overview

`MapContainer` manages the responsive layout of two `MapPanel` components. It handles viewport-based layout switching between side-by-side (desktop) and stacked (mobile) arrangements. The container does not manipulate map state; it only controls physical layout.

**Key Characteristics**:
- Responsive: Automatically adjusts layout based on viewport width
- Layout-only: Does not interfere with map panel functionality
- Coordination: Manages focus switching between panels
- Accessible: Ensures keyboard navigation flows correctly between panels

---

## Props

### breakpointWidth

**Type**: `number` (pixels)  
**Default**: `768`  
**Required**: No

Viewport width threshold for switching between layouts.

**Behavior**:
- Width ≥ breakpointWidth: Side-by-side layout (horizontal)
- Width < breakpointWidth: Stacked layout (vertical)

**Validation**:
- Must be positive integer
- Common values: 768px (tablet), 1024px (desktop)

---

### gap

**Type**: `number` (pixels)  
**Default**: `0`  
**Required**: No

Spacing between the two map panels.

**Validation**:
- Must be non-negative

**Notes**:
- In side-by-side mode: horizontal gap
- In stacked mode: vertical gap

---

### initialLayout

**Type**: `'auto' | 'side-by-side' | 'stacked'`  
**Default**: `'auto'`  
**Required**: No

Initial layout mode.

**Values**:
- `'auto'`: Determine based on viewport width and breakpoint
- `'side-by-side'`: Force horizontal layout regardless of viewport
- `'stacked'`: Force vertical layout regardless of viewport

**Use Cases**:
- `'auto'`: Standard responsive behavior (recommended)
- Forced layouts: Testing, specific design requirements

---

### leftMapConfig

**Type**:
```typescript
{
  initialCenter: { lat: number, lng: number },
  initialZoom: number,
  minZoom?: number,
  maxZoom?: number,
  enableKeyboard?: boolean
}
```
**Default**: 
```typescript
{
  initialCenter: { lat: 0, lng: 0 },
  initialZoom: 2
}
```
**Required**: No

Configuration object passed to the left/top MapPanel.

**Notes**:
- All MapPanel props can be specified here
- Provides convenience for declarative configuration

---

### rightMapConfig

**Type**: Same as `leftMapConfig`  
**Default**: Same as `leftMapConfig`  
**Required**: No

Configuration object passed to the right/bottom MapPanel.

---

## Events

### layout-changed

**Payload**: `{ layout: 'side-by-side' | 'stacked', viewportWidth: number }`  
**Timing**: Emitted when layout mode switches

Fired when container switches between layouts due to viewport resize.

**Use Cases**:
- Analytics tracking
- Adjusting other UI elements
- Triggering map resize recalculations

---

### panel-focus-changed

**Payload**: `{ focusedPanel: 'left' | 'right' | null, previousPanel: 'left' | 'right' | null }`  
**Timing**: Emitted when keyboard focus switches between panels

Fired when user tabs between map panels or clicks on a panel.

**Use Cases**:
- Coordinating external controls
- Highlighting active panel
- Analytics

---

## Slots

### left

**Slot Props**: None  
**Purpose**: Custom content for left/top panel area

Replaces default MapPanel with custom content.

**Note**: If you use this slot, you must provide your own MapPanel component.

---

### right

**Slot Props**: None  
**Purpose**: Custom content for right/bottom panel area

Replaces default MapPanel with custom content.

---

### header

**Slot Props**: `{ layout: 'side-by-side' | 'stacked' }`  
**Purpose**: Content above both map panels

Renders header content (title, controls) above the dual map layout.

---

### footer

**Slot Props**: `{ layout: 'side-by-side' | 'stacked' }`  
**Purpose**: Content below both map panels

Renders footer content below the dual map layout.

---

## Exposed Methods

Methods accessible via template ref: `<MapContainer ref="containerRef" />`

### getLeftMap()

**Signature**: `() => MapPanelRef | null`

Get reference to the left/top MapPanel instance.

**Returns**: Template ref to MapPanel, or null if not mounted

**Use Case**: Programmatically control left map via exposed methods

---

### getRightMap()

**Signature**: `() => MapPanelRef | null`

Get reference to the right/bottom MapPanel instance.

---

### getCurrentLayout()

**Signature**: `() => 'side-by-side' | 'stacked'`

Get current layout mode.

---

### forceLayout(layout)

**Signature**: `(layout: 'side-by-side' | 'stacked') => void`

Programmatically override automatic layout switching.

**Parameters**:
- `layout`: Desired layout mode

**Notes**:
- Overrides responsive behavior until next resize
- Use sparingly; prefer responsive auto mode

---

### resetLayout()

**Signature**: `() => void`

Reset to automatic responsive layout mode.

Clears any forced layout and re-evaluates based on viewport.

---

## Accessibility

### ARIA Attributes

- `role="region"`: Container is a landmark region
- `aria-label="Dual map comparison view"`: Descriptive label
- Each panel has `aria-labelledby` referencing descriptive text

### Focus Management

- Tab order flows: header → left panel → right panel → footer
- Focus visible on active panel (outline/border)
- Escape key removes focus from active panel

### Screen Reader Support

- Announces layout changes: "Layout changed to side-by-side view"
- Announces panel count: "Region containing 2 interactive maps"

---

## CSS Classes

The component applies these CSS classes for styling:

- `.map-container`: Root container
- `.map-container--side-by-side`: Applied in horizontal layout
- `.map-container--stacked`: Applied in vertical layout
- `.map-container__left`: Left/top panel wrapper
- `.map-container__right`: Right/bottom panel wrapper
- `.map-container__header`: Header slot wrapper
- `.map-container__footer`: Footer slot wrapper

---

## Usage Examples

### Basic Usage (Declarative)

```vue
<MapContainer
  :left-map-config="{
    initialCenter: { lat: 40.7128, lng: -74.0060 },
    initialZoom: 12
  }"
  :right-map-config="{
    initialCenter: { lat: 51.5074, lng: -0.1278 },
    initialZoom: 12
  }"
/>
```

---

### With Custom Breakpoint and Gap

```vue
<MapContainer
  :breakpoint-width="1024"
  :gap="16"
  @layout-changed="onLayoutChange"
/>
```

---

### With Slots (Custom Panels)

```vue
<MapContainer>
  <template #left>
    <MapPanel
      ref="leftMapRef"
      :initial-center="leftCenter"
      @map-ready="onLeftReady"
    />
  </template>

  <template #right>
    <MapPanel
      ref="rightMapRef"
      :initial-center="rightCenter"
      @map-ready="onRightReady"
    />
  </template>

  <template #header="{ layout }">
    <h1>Compare Locations</h1>
    <p>Current layout: {{ layout }}</p>
  </template>
</MapContainer>
```

---

### With Exposed Methods

```vue
<template>
  <MapContainer ref="containerRef" />
  <button @click="syncZoom">Sync Zoom Levels</button>
</template>

<script setup>
import { ref } from 'vue'

const containerRef = ref(null)

function syncZoom() {
  const leftMap = containerRef.value?.getLeftMap()
  const rightMap = containerRef.value?.getRightMap()
  
  if (leftMap && rightMap) {
    const leftZoom = leftMap.getZoom()
    rightMap.setView(rightMap.getCenter(), leftZoom)
  }
}
</script>
```

---

### Responsive Layout Handling

```vue
<template>
  <MapContainer @layout-changed="handleLayoutChange">
    <template #footer="{ layout }">
      <div v-if="layout === 'stacked'" class="mobile-hint">
        Swipe to navigate each map
      </div>
      <div v-else class="desktop-hint">
        Click and drag to navigate each map
      </div>
    </template>
  </MapContainer>
</template>

<script setup>
function handleLayoutChange({ layout, viewportWidth }) {
  console.log(`Layout changed to ${layout} at ${viewportWidth}px`)
  
  // Optionally trigger map resize
  // (MapPanel should handle this automatically)
}
</script>
```

---

## Implementation Notes

**Responsive Behavior Implementation**:
- Use ResizeObserver or window resize events to detect viewport changes
- Debounce resize handlers (minimum 150ms)
- Trigger map `invalidateSize()` after layout change
- Maintain panel state across layout transitions

**Focus Management Implementation**:
- Track focused panel in container state
- Intercept Tab key to enforce correct focus order
- Emit focus change events for parent coordination

**Performance Considerations**:
- Avoid re-rendering maps during resize (only adjust CSS)
- Use CSS Grid or Flexbox for layout (avoid JavaScript positioning)
- Ensure map tiles cache across layout changes

---

## Contract Version History

- **1.0.0** (2026-02-28): Initial contract specification
