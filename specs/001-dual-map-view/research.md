# Research: Leaflet + Vue 3 Integration Best Practices

**Feature**: Dual Map View  
**Date**: 2026-02-28  
**Scope**: Integration patterns, architecture, performance, and TypeScript considerations for Leaflet in Vue 3

---

## 1. Vue + Leaflet Integration Patterns

### Decision: Use Direct Leaflet API with Vue 3 Composition API

**Rationale**:
- **Full control**: Direct integration provides complete access to Leaflet's API without abstraction layers
- **Lifecycle management**: Vue 3's `onMounted` and `onUnmounted` hooks map cleanly to Leaflet's imperative initialization/cleanup
- **Maintenance**: No dependency on third-party wrapper maintenance cycles or breaking changes
- **Performance**: Eliminates wrapper overhead and potential reactivity conflicts
- **TypeScript support**: First-class TypeScript definitions from `@types/leaflet` without wrapper type gymnastics
- **Composition API patterns**: Easy to create custom composables that encapsulate Leaflet logic while preserving reactivity boundaries

**Alternatives Considered**:

#### vue3-leaflet (vue-leaflet v10+)
- **Pros**: Declarative component syntax, automatic lifecycle management, community support
- **Cons**: 
  - Adds abstraction layer that can obscure Leaflet's imperative API
  - May lag behind Leaflet updates
  - Limited flexibility for advanced use cases (custom layers, complex interactions)
  - Additional bundle size (~15-20KB)
  - Type definitions may not cover all Leaflet features
  - Harder to debug when wrapper behavior differs from Leaflet docs
- **Verdict**: Not recommended for projects requiring fine-grained control or multiple map instances with custom behavior

#### @vue-leaflet/vue-leaflet
- **Pros**: Active fork with Vue 3 support, component-based approach
- **Cons**: 
  - Still an abstraction layer with similar drawbacks to vue3-leaflet
  - Smaller community than direct Leaflet usage
  - May introduce reactivity issues when mixing declarative components with imperative Leaflet code
- **Verdict**: Rejected for same reasons as vue3-leaflet

#### Vue 2 Legacy Wrappers (vue2-leaflet)
- **Pros**: Mature ecosystem (historical)
- **Cons**: 
  - Not compatible with Vue 3
  - No Composition API support
  - End of life approaching
- **Verdict**: Not applicable for Vue 3 projects

---

### Best Practices for Component Lifecycle Management

#### Initialization Pattern

```text
RECOMMENDED APPROACH:

1. Create template ref for map container div
2. Initialize Leaflet map in onMounted hook
3. Store map instance in non-reactive ref (shallowRef)
4. Clean up in onUnmounted hook
5. Expose necessary methods via composable or component methods
```

**Key Principles**:
- **Never make Leaflet map instances reactive**: Use `shallowRef` or `markRaw` to prevent Vue from observing Leaflet's internal object graph
- **Initialize once**: Create map instance only in `onMounted` after DOM is ready
- **Clean up resources**: Always call `map.remove()` in `onUnmounted` to prevent memory leaks
- **Avoid watchers on map instance**: Watch props/state and imperatively update the map, don't watch the map itself
- **Separate concerns**: Keep Leaflet imperative code in composables, component templates should be minimal

#### Handling Leaflet's Imperative API in Vue's Reactive System

**Decision**: Use "Reactive Props → Imperative Updates" Pattern

**Rationale**:
- Vue's reactivity is declarative; Leaflet's API is imperative
- Mixing these paradigms requires clear boundaries
- Props/refs should represent desired state; watchers/effects apply state to Leaflet
- This pattern is testable, predictable, and aligns with Vue 3's reactive philosophy

**Implementation Strategy**:
```text
1. Define reactive props/state for map configuration (center, zoom, bounds)
2. Use watch() or watchEffect() to observe configuration changes
3. In watcher callbacks, call Leaflet imperative methods (setView, fitBounds, etc.)
4. Use debouncing/throttling for frequent updates
5. Avoid two-way binding - use events for Leaflet → Vue communication
```

**Anti-patterns to Avoid**:
- Making Leaflet objects reactive (causes performance issues and proxy errors)
- Directly mutating reactive state from Leaflet event handlers (breaks Vue's reactivity guarantees)
- Using computed properties that access Leaflet instance methods (causes unnecessary recalculation)

---

### When to Use refs vs reactive for Map Instances

**Decision Matrix**:

| Data Type | Recommended Approach | Reasoning |
|-----------|---------------------|-----------|
| Map instance | `shallowRef()` or non-reactive variable | Leaflet objects should never be deeply reactive |
| Layer instances | `shallowRef()` or `markRaw()` | Same as map instance - prevent Vue proxy wrapping |
| Map configuration (center, zoom) | `reactive()` or `ref()` | Simple values that drive map updates |
| User interaction state (dragging, zoomed) | `ref()` | Boolean/primitive values for UI state |
| Layer collections | `shallowReactive()` or array of markRaw items | Reactive array, non-reactive items |
| Tile URLs, attribution | `ref()` or `reactive()` | Configuration that may change |

**Detailed Guidance**:

**Use `shallowRef` for**:
- Leaflet map instances (`L.Map`)
- Layer objects (`L.TileLayer`, `L.Marker`, etc.)
- Layer groups
- Any Leaflet object that maintains internal state

**Example**:
```text
const map = shallowRef<L.Map | null>(null)
const tileLayer = shallowRef<L.TileLayer | null>(null)
```

**Use `markRaw` when**:
- Creating objects that will be stored in reactive collections
- You need to store Leaflet objects but want to prevent deep reactivity

**Example (conceptual)**:
```text
const layers = reactive<L.Layer[]>([])
layers.push(markRaw(new L.Marker([lat, lng])))
```

**Use `ref()` or `reactive()` for**:
- Primitives and plain objects that represent map state
- Configuration that triggers map updates
- UI state flags

**Example**:
```text
const mapConfig = reactive({
  center: { lat: 0, lng: 0 },
  zoom: 2,
  minZoom: 2,
  maxZoom: 18
})
```

**Never use `reactive()` directly on**:
- Leaflet instances (will cause "Cannot create proxy" errors or severe performance degradation)

---

## 2. Component Architecture

### Decision: Composable-First Architecture with Single-File Components

**Rationale**:
- **Reusability**: Composables encapsulate Leaflet logic and can be reused across components
- **Testability**: Composables are pure functions that can be tested in isolation
- **Separation of concerns**: Business logic separate from presentation
- **TypeScript-friendly**: Composables have explicit return types
- **Composition over inheritance**: Aligns with Vue 3 and Composition API philosophy

**Recommended Structure**:

```text
src/
├── components/
│   ├── MapPanel.vue              # Main map component
│   ├── MapContainer.vue          # Layout wrapper for dual maps
│   └── MapErrorBoundary.vue      # Error handling wrapper
├── composables/
│   ├── useLeafletMap.ts          # Core map initialization/cleanup
│   ├── useMapNavigation.ts       # Pan/zoom state management
│   ├── useMapTileLayer.ts        # Tile layer management
│   ├── useMapEvents.ts           # Leaflet event handling
│   └── useMapKeyboard.ts         # Keyboard navigation logic
├── types/
│   └── map.types.ts              # Shared TypeScript definitions
└── config/
    └── map.config.ts             # Default map configuration
```

---

### Component Design: MapPanel

**Decision**: MapPanel as a controlled component with event emissions

**Interface Design**:
```text
Props:
- initialCenter: { lat: number, lng: number }
- initialZoom: number
- minZoom: number
- maxZoom: number
- tileUrl: string
- attribution: string
- enableKeyboard: boolean
- id: string (for accessibility)

Events:
- map-ready: (map: L.Map) => void
- zoom-changed: (zoom: number) => void
- center-changed: (center: { lat: number, lng: number }) => void
- loading-start: () => void
- loading-end: () => void
- error: (error: Error) => void

Slots:
- default: For custom controls or overlays
- error: Custom error display
```

**Rationale**:
- Props control initial state and configuration (one-way data flow)
- Events communicate state changes to parent (unidirectional)
- No v-model for map state (too complex for bidirectional sync)
- Slots provide extension points without tight coupling

---

### Prop Drilling vs Provide/Inject for Map Configuration

**Decision**: Use Props for MapPanel, Provide/Inject for Deep Hierarchies (if needed)

**Rationale**:
- **Explicit is better than implicit**: Props make data flow visible and traceable
- **Single map component**: MapPanel has direct child relationship with MapContainer
- **Limited depth**: No deep component trees in dual map scenario
- **Provide/Inject reserved for**: Cross-cutting concerns (theme, global config) not per-instance state

**When to Use Provide/Inject**:
- Global map configuration (default tile provider, attribution format)
- Application-wide settings (language for controls, distance units)
- Shared services (error logging, analytics)

**Anti-pattern to Avoid**:
- Using provide/inject to share map instances between sibling MapPanel components
- Providing reactive map state that creates implicit dependencies

**Recommended Approach for Dual Maps**:
```text
<MapContainer>
  <MapPanel
    :initial-center="leftMapConfig.center"
    :initial-zoom="leftMapConfig.zoom"
    @map-ready="onLeftMapReady"
  />
  <MapPanel
    :initial-center="rightMapConfig.center"
    :initial-zoom="rightMapConfig.zoom"
    @map-ready="onRightMapReady"
  />
</MapContainer>
```

Each map owns its state; parent coordinates when necessary.

---

### Event Handling Patterns Between Leaflet and Vue

**Decision**: Event Adapter Pattern with Typed Event Emitters

**Rationale**:
- Leaflet uses DOM-style event system; Vue uses component events
- Need translation layer to convert Leaflet events to Vue events
- TypeScript can enforce event payload types at component boundaries
- Debouncing/throttling should happen in the adapter, not in parent components

**Pattern Implementation**:

```text
INSIDE COMPOSABLE (useMapEvents.ts):

1. Attach Leaflet event listeners in onMounted
2. Convert Leaflet event data to plain objects (not Leaflet types)
3. Call Vue component's emit function with typed payload
4. Apply debouncing/throttling at this layer
5. Clean up listeners in onUnmounted

LEAFLET EVENT → ADAPTER → VUE EVENT

Example flow:
- Leaflet 'moveend' event → useMapEvents composable → emit('center-changed', { lat, lng })
- Leaflet 'zoomend' event → useMapEvents composable → emit('zoom-changed', zoomLevel)
```

**Key Principles**:
- **Unidirectional flow**: Leaflet events flow up as Vue events, never directly modify parent state
- **Serialize event data**: Don't pass Leaflet objects through events (pass plain data)
- **Debounce at source**: Apply throttling in the composable, not in every parent component
- **Type safety**: Use TypeScript's typed emit for compile-time safety

**Events to Wrap**:
- `moveend` → `center-changed`
- `zoomend` → `zoom-changed`
- `load` → `map-ready`
- `loading` → `loading-start`
- `click` → `map-click` (if needed)
- `error` → `error`

**Performance Consideration**:
- Don't emit events on `move` (fires constantly during pan) - use `moveend` instead
- Don't emit on `zoom` - use `zoomend`
- For live feedback (like displaying current coordinates), use internal component state, not events

---

## 3. Performance Considerations

### Lazy Loading Map Tiles

**Decision**: Use Leaflet's Built-in Lazy Loading with Strategic Configuration

**Rationale**:
- Leaflet automatically lazy loads tiles based on viewport (built-in behavior)
- No need for custom implementation
- Focus on optimizing Leaflet's tile loading configuration

**Recommended Configuration**:
```text
L.tileLayer(url, {
  maxZoom: 18,
  minZoom: 2,
  keepBuffer: 2,        // Keep 2 tile rows/cols outside viewport (default: 2)
  updateWhenZooming: false,  // Don't load tiles during zoom animation
  updateWhenIdle: true,      // Load tiles after pan/zoom completes
  bounds: [[-90, -180], [90, 180]],  // World bounds
  noWrap: false,             // Allow horizontal wrapping
  className: 'leaflet-tiles' // For CSS optimization
})
```

**Optimization Strategies**:

1. **Defer initial tile load until map is visible**:
   - Use Intersection Observer to detect when map container is in viewport
   - Initialize map only when visible (for below-the-fold maps)

2. **Preload critical tiles**:
   - Initial world view tiles should load first (lower zoom levels)
   - Leaflet handles this automatically with its tile queue

3. **Tile caching**:
   - Leaflet caches tiles in memory automatically
   - Browser HTTP cache handles network-level caching
   - No custom cache needed for MVP

4. **CDN for tile server**:
   - Use CDN-backed tile providers (OpenStreetMap tiles are CDN-served)
   - Reduces latency for tile loading

**Alternative Considered**:
- **Progressive tile loading (blur-up)**: Load low-res tile, then replace with high-res
  - **Verdict**: Not built into Leaflet, requires custom implementation, deferred to future optimization

---

### Debouncing/Throttling Pan and Zoom Events

**Decision**: Throttle Emit Events, Not Leaflet Event Handlers

**Rationale**:
- Leaflet's internal event handlers must run without throttling (for smooth animation)
- Throttle only the Vue event emissions and external side effects
- Use `moveend`/`zoomend` instead of `move`/`zoom` when possible (fire once per interaction)
- Apply throttling in composable layer, transparent to component consumers

**Implementation Strategy**:

```text
PATTERN 1: Use terminal events (recommended for most cases)
- Listen to 'moveend' instead of 'move'
- Listen to 'zoomend' instead of 'zoom'
- These fire once when interaction completes
- No throttling needed

PATTERN 2: Throttle continuous events (for live feedback)
- If you need live updates during pan (e.g., showing coordinates while dragging)
- Use lodash-es debounce or native throttle
- Apply to the event emitter function, not the Leaflet listener
- Typical throttle: 150-300ms for UI updates

PATTERN 3: Rate-limit API calls
- If pan/zoom triggers data fetching (not needed for basic maps)
- Use debounce with trailing edge: wait until user stops interacting
- Typical debounce: 500ms for API calls
```

**Recommended Throttle/Debounce Values**:
| Event Type | Strategy | Timing | Use Case |
|------------|----------|--------|----------|
| moveend | None | N/A | Fires once per pan |
| zoomend | None | N/A | Fires once per zoom |
| move (continuous) | Throttle | 200ms | Live coordinate display |
| zoom (continuous) | Throttle | 200ms | Live zoom level display |
| Tile loading state | Debounce | 300ms | Show/hide loading spinner |
| External API call | Debounce | 500ms | Fetch POIs after movement |

**Library Recommendation**:
- Use `lodash-es/throttle` and `lodash-es/debounce` for tree-shaking
- Alternative: Native implementation with `requestAnimationFrame` for visual updates

---

### Memory Management with Multiple Map Instances

**Decision**: Explicit Cleanup with Ref Tracking and onUnmounted Guards

**Rationale**:
- Two map instances double memory footprint
- Leaflet doesn't auto-cleanup; requires explicit `map.remove()`
- Tile layers cache images in memory; must remove layers before map
- Event listeners on map instances can create memory leaks if not removed

**Memory Management Checklist**:

**1. Component Unmount Cleanup**:
```text
In onUnmounted hook:
✓ Remove all event listeners
✓ Remove all layers from map (map.eachLayer(layer => map.removeLayer(layer)))
✓ Call map.remove() to destroy map instance
✓ Set map ref to null
✓ Clear any tile layer refs
```

**2. Tile Layer Management**:
```text
✓ Store tile layer reference when created
✓ Remove tile layer before removing map: tileLayer.remove()
✓ Don't create new tile layers on every re-render (cache in ref)
✓ Use 'loading' and 'load' events to track tile loading state
```

**3. Event Listener Cleanup**:
```text
✓ Use map.off() to remove listeners in onUnmounted
✓ If using named functions, store references for cleanup
✓ Remove DOM event listeners (window resize, keyboard events)
```

**4. Avoid Unnecessary Re-initialization**:
```text
✓ Initialize map only once in onMounted
✓ Use watchers to update existing map, not recreate it
✓ Check if map exists before initializing (guard against double-mount in dev mode)
```

**Pattern for Safe Cleanup**:
```text
const map = shallowRef<L.Map | null>(null)
const tileLayer = shallowRef<L.TileLayer | null>(null)

onUnmounted(() => {
  if (tileLayer.value) {
    tileLayer.value.remove()
    tileLayer.value = null
  }
  
  if (map.value) {
    map.value.off()  // Remove all event listeners
    map.value.remove()  // Destroy map instance
    map.value = null
  }
})
```

**Testing Memory Management**:
- Use Chrome DevTools Memory Profiler
- Take heap snapshot before mounting dual maps
- Take heap snapshot after unmounting
- Compare retained size - should return to baseline
- Look for detached DOM nodes (indicates leak)

**Alternative Considered**:
- **Shared map instance with viewport switching**: Not viable - each map needs independent state
- **Object pooling**: Over-engineering for two instances; explicit cleanup is sufficient

---

### Preventing Unnecessary Re-renders

**Decision**: ShallowRef for Map Instances + Computed for Derived State

**Rationale**:
- Vue 3's reactivity system triggers re-renders when reactive data changes
- Leaflet map instances should never trigger re-renders (they're imperative)
- Component should re-render only when props or UI state changes
- Use `shallowRef` to prevent Vue from creating deep proxies of Leaflet objects

**Re-render Optimization Strategies**:

**1. Non-reactive Map References**:
```text
✓ Use shallowRef for map instance
✓ Use markRaw for Leaflet layers and controls
✓ Never pass map instance through props/events
✓ Store map in module scope variable if not needed in template
```

**2. Separate Reactive State from Imperative API**:
```text
✓ Keep map configuration in reactive object
✓ Watch configuration and imperatively update map
✓ Don't make Leaflet state reactive (Vue shouldn't track it)
```

**3. Memoization for Computed Values**:
```text
✓ Use computed() for derived state (e.g., map bounds as string)
✓ Avoid accessing map instance in computed properties
✓ Cache expensive calculations (coordinate transformations)
```

**4. V-If vs V-Show for Map Visibility**:
```text
✓ Use v-show for toggling map visibility (preserves instance)
✓ Use v-if only when you want to destroy/recreate map
✓ For responsive layout (mobile/desktop), use CSS not v-if
```

**5. Avoid Reactive Props for Large Data**:
```text
✓ Don't pass large GeoJSON through props (if added in future)
✓ Load data imperatively after map initialization
✓ Use shallowReactive for arrays of markers/features
```

**6. Component Key Management**:
```text
✓ Don't use dynamic :key on MapPanel unless you want to force remount
✓ Static keys or no key for dual maps (they're stable)
```

**Anti-patterns That Cause Re-renders**:
- Storing map instance in reactive()
- Using computed() that accesses map methods
- Passing map instance through props
- Mutating props from child components
- Creating new object references in template expressions

---

## 4. TypeScript Integration

### Decision: Strict TypeScript with Custom Type Guards

**Rationale**:
- TypeScript strict mode catches errors at compile time
- Leaflet has comprehensive type definitions via `@types/leaflet`
- Custom type guards improve developer experience and catch runtime issues
- Explicit typing for composables provides auto-completion and refactoring safety

**TypeScript Configuration**:
```text
tsconfig.json requirements:
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "moduleResolution": "bundler",
    "types": ["@types/leaflet", "vite/client"]
  }
}
```

---

### Type Definitions for Leaflet in TypeScript

**Decision**: Use @types/leaflet + Custom Type Extensions

**Installation**:
```text
npm install leaflet
npm install --save-dev @types/leaflet
```

**Import Pattern**:
```text
import L from 'leaflet'
import type { Map, TileLayer, LatLngExpression } from 'leaflet'
```

**Key Types to Use**:
| Leaflet Type | Usage | Notes |
|--------------|-------|-------|
| `L.Map` | Map instance type | Return type from L.map() |
| `L.TileLayer` | Tile layer type | Return type from L.tileLayer() |
| `LatLngExpression` | Coordinate inputs | Union of formats Leaflet accepts |
| `LatLng` | Coordinate objects | Leaflet's coordinate class |
| `LatLngBounds` | Bounding box | For map.fitBounds() |
| `LeafletEvent` | Base event type | For event handler typing |
| `LeafletMouseEvent` | Click events | Has latlng property |
| `ZoomAnimEvent` | Zoom events | Has center and zoom |

**Custom Type Extensions**:
```text
Create types/map.types.ts:

export interface MapConfig {
  center: { lat: number; lng: number }
  zoom: number
  minZoom: number
  maxZoom: number
}

export interface TileLayerConfig {
  url: string
  attribution: string
  maxZoom: number
  minZoom: number
}

export interface MapEventPayloads {
  'map-ready': L.Map
  'center-changed': { lat: number; lng: number }
  'zoom-changed': number
  'loading-start': void
  'loading-end': void
  'error': Error
}
```

**Handling DOM Types**:
```text
For map container refs:
const mapContainer = ref<HTMLDivElement | null>(null)

For map initialization:
if (!mapContainer.value) return
const map = L.map(mapContainer.value, { ... })
```

---

### Typing Vue Composables That Wrap Leaflet Functionality

**Decision**: Explicit Return Types with Generics Where Appropriate

**Rationale**:
- Return types enable auto-completion in IDE
- Generic types provide flexibility without sacrificing type safety
- Explicitly typed composables serve as contract documentation

**Composable Typing Patterns**:

**Pattern 1: Simple Composable** (no generics needed)
```text
// useLeafletMap.ts
export function useLeafletMap(
  container: Ref<HTMLDivElement | null>,
  config: MapConfig
): {
  map: ShallowRef<L.Map | null>
  initMap: () => void
  destroyMap: () => void
  isReady: Ref<boolean>
} {
  const map = shallowRef<L.Map | null>(null)
  const isReady = ref(false)
  
  const initMap = () => { ... }
  const destroyMap = () => { ... }
  
  return { map, initMap, destroyMap, isReady }
}
```

**Pattern 2: Composable with Event Emitter**
```text
// useMapEvents.ts
export function useMapEvents(
  map: ShallowRef<L.Map | null>,
  emit: (event: string, ...args: any[]) => void
): {
  attachListeners: () => void
  detachListeners: () => void
} {
  // Implementation
  return { attachListeners, detachListeners }
}
```

**Pattern 3: Generic Composable** (if needed for custom layers)
```text
// useMapLayer.ts
export function useMapLayer<T extends L.Layer>(
  map: ShallowRef<L.Map | null>,
  layerFactory: () => T
): {
  layer: ShallowRef<T | null>
  addLayer: () => void
  removeLayer: () => void
} {
  const layer = shallowRef<T | null>(null)
  // Implementation
  return { layer, addLayer, removeLayer }
}
```

**Type Guards for Runtime Safety**:
```text
export function isMapReady(map: L.Map | null): map is L.Map {
  return map !== null && map instanceof L.Map
}

export function isValidLatLng(value: unknown): value is { lat: number; lng: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'lat' in value &&
    'lng' in value &&
    typeof (value as any).lat === 'number' &&
    typeof (value as any).lng === 'number'
  )
}
```

---

### Common Type Pitfalls When Mixing Leaflet and Vue

**Pitfall 1: Reactive Proxies on Leaflet Objects**
```text
WRONG:
const map = reactive<L.Map>(L.map(div))  // Causes runtime errors

CORRECT:
const map = shallowRef<L.Map | null>(null)
map.value = L.map(div)
```

**Pitfall 2: LatLng Type Confusion**
```text
PROBLEM: Leaflet accepts multiple formats for coordinates

Leaflet's LatLngExpression union:
- [number, number]  // [lat, lng]
- { lat: number, lng: number }
- { lat: number, lon: number }
- L.LatLng

SOLUTION: Normalize to one format in your app
const center = ref<{ lat: number; lng: number }>({ lat: 0, lng: 0 })

Convert when passing to Leaflet:
map.setView([center.value.lat, center.value.lng], zoom)
```

**Pitfall 3: Null Checks on Map Instance**
```text
PROBLEM: Map is null before initialization

WRONG:
const map = shallowRef<L.Map>(null)  // Type error: null not assignable to L.Map

CORRECT:
const map = shallowRef<L.Map | null>(null)

// Always check before use:
if (!map.value) return
map.value.setView(...)
```

**Pitfall 4: Event Handler Typing**
```text
PROBLEM: Leaflet event types don't match Vue event emitters

SOLUTION: Define event payload types separately

type MapEventPayloads = {
  'zoom-changed': number
  'center-changed': { lat: number; lng: number }
}

In component:
defineEmits<{
  (event: 'zoom-changed', value: number): void
  (event: 'center-changed', value: { lat: number; lng: number }): void
}>()
```

**Pitfall 5: Module Import Issues**
```text
PROBLEM: Leaflet's CSS and default marker images not loading

SOLUTION: 
1. Import CSS in main.ts:
   import 'leaflet/dist/leaflet.css'

2. Fix marker icon paths:
   import L from 'leaflet'
   import icon from 'leaflet/dist/images/marker-icon.png'
   import iconShadow from 'leaflet/dist/images/marker-shadow.png'
   
   L.Icon.Default.prototype.options.iconUrl = icon
   L.Icon.Default.prototype.options.shadowUrl = iconShadow
```

**Pitfall 6: Ref Unwrapping in Template**
```text
PROBLEM: Confusion about when to use .value

IN SCRIPT:
map.value.setView(...)  // Need .value

IN TEMPLATE:
{{ map.getZoom() }}  // Auto-unwrapped, but will fail if map is shallowRef

SOLUTION: Don't access map methods in template; expose computed values:
const currentZoom = ref(2)
// Update in watcher
{{ currentZoom }}  // In template
```

---

## 5. OpenStreetMap Tile Configuration

### Decision: Use Official OSM Tile Servers with Fallback Strategy

**Rationale**:
- Official OSM tiles are free and reliable
- Well-documented attribution requirements
- Wide CDN coverage for performance
- Multiple tile server URLs available for redundancy
- Established rate limiting and usage policies

---

### Best Practices for OSM Tile URL Configuration

**Decision**: Use Tile Server Array with Automatic Failover

**Primary Configuration**:
```text
Tile URL pattern: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

Subdomains: a, b, c (for parallel requests)
MaxZoom: 19
MinZoom: 0
```

**Configuration in Code**:
```text
const tileLayerConfig = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
  minZoom: 0,
  subdomains: ['a', 'b', 'c'],
  errorTileUrl: '' // Or custom error tile image
}
```

**Subdomain Benefits**:
- Browser connection limits: Modern browsers allow 6-8 connections per domain
- `{s}` rotates through subdomains (a, b, c) to parallelize tile requests
- Improves initial load time when multiple tiles needed

**Rationale for This URL**:
- Official OSM-hosted tiles (most reliable)
- HTTPS for secure content (required by modern browsers)
- Standard format supported by Leaflet
- No API key required

---

### Attribution Requirements

**Decision**: Implement Legally Compliant Attribution with Custom Styling

**Legal Requirements** (OSM License):
- MUST credit OpenStreetMap contributors
- MUST link to https://www.openstreetmap.org/copyright
- Attribution must be visible to end users
- Cannot remove or hide attribution

**Recommended Attribution String**:
```text
FULL:
'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

MOBILE (shortened):
'© <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
```

**Placement Options**:

**Option 1: Leaflet Built-in** (recommended)
- Appears in bottom-right corner of map
- Automatically styled and positioned
- Can customize CSS via `.leaflet-control-attribution` class

**Option 2: Custom Footer**
- Below map component in DOM
- More visible than default position
- Useful for accessibility (not hidden by map controls)
- Choose this if design requires attribution outside map canvas

**Option 3: Collapsed Control** (for space-constrained views)
- Attribution text appears on hover
- Still compliant (available on interaction)
- Use for mobile views

**Custom Styling**:
```text
CSS customization:
.leaflet-control-attribution {
  background-color: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  padding: 2px 5px;
}
```

**Accessibility Consideration**:
- Attribution links must be keyboard accessible
- Default Leaflet attribution is accessible
- If using custom footer, ensure link focusability

---

### Rate Limiting Considerations

**Decision**: Implement Client-Side Throttling + User Education

**OSM Tile Usage Policy**:
- Official tile servers are provided for browsing OSM
- Heavy use discouraged - tile caching layers recommended for high-traffic sites
- No explicit rate limit documented, but abuse leads to blocking
- Fair use expected: typical user browsing is acceptable

**Guidelines for Compliance**:

**1. Technical Limits**:
- No more than 2 tile requests per second per client (conservative)
- Use Leaflet's built-in tile loading queue (handled automatically)
- Don't preload tiles beyond viewport (Leaflet default behavior is compliant)
- Cache tiles in browser (HTTP caching automatic)

**2. Implementation Strategy**:
```text
✓ Set updateWhenIdle: true (load tiles after zoom/pan completes)
✓ Set updateWhenZooming: false (don't load during animation)
✓ Use keepBuffer: 2 (Leaflet default, reasonable preloading)
✓ Don't programmatically auto-zoom or auto-pan (user-initiated only)
✓ Respect HTTP cache headers from tile server
```

**3. When to Use Alternative Tile Provider**:
Consider switching if:
- Application has > 1,000 daily active users
- Users perform frequent pan/zoom actions
- Application is commercially deployed
- Usage analytics show high tile request volume

**4. Monitoring**:
- Track tile request errors (429, 503 status codes)
- Implement exponential backoff on tile load failures
- Display user-friendly message if tile server is unreachable

**Alternatives for High-Traffic Applications**:
- Self-host tile server (requires infrastructure)
- Use commercial tile provider (Mapbox, Maptiler)
- Set up tile caching proxy (CDN layer)

**For Dual Map View Specifically**:
- Two maps double tile requests
- This is acceptable for low-traffic personal/demo sites
- Consider alternative providers if deploying commercially
- Document tile source in application footer

---

### Alternative Tile Providers for Redundancy

**Decision**: Configure Secondary Provider with Fallback Logic

**Rationale**:
- OSM tile servers occasionally have outages
- Fallback improves reliability and user experience
- Secondary provider should have similar license terms
- Implementation should be transparent to user

**Recommended Secondary Providers**:

**Option 1: Wikimedia Tiles** (recommended)
```text
URL: https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png
Attribution: 'Wikimedia maps | Map data © OpenStreetMap contributors'
Max Zoom: 19
License: Same as OSM (ODbL)
Pros: Reliable, OSM-based, good CDN
Cons: May have different styling than standard OSM
```

**Option 2: Humanitarian OSM** (HOT)
```text
URL: https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png
Attribution: 'Tiles by HOT | Map data © OpenStreetMap contributors'
Max Zoom: 19
License: OSM-compatible
Pros: Focused on accessibility, distinct visual style
Cons: Different appearance (may confuse users if switched)
```

**Option 3: OpenTopoMap** (if terrain useful)
```text
URL: https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png
Attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap'
Max Zoom: 17
Pros: Topographical features, different use case
Cons: Not identical to standard street map
```

**Fallback Implementation Strategy**:

**Pattern 1: Error Event Handler** (recommended)
```text
1. Initialize with primary tile layer (OSM standard)
2. Listen to 'tileerror' event on tile layer
3. After N consecutive errors (e.g., 5), switch to secondary provider
4. Display notification to user: "Switched to backup map provider"
5. Log error for monitoring
```

**Pattern 2: Pre-configured Secondary Layer** (immediate fallback)
```text
1. Create both primary and secondary tile layers
2. Add primary to map initially
3. On primary 'tileerror', remove primary and add secondary
4. Add timeout to retry primary after 5 minutes
```

**Pattern 3: User-Selectable Provider** (advanced)
```text
1. Provide dropdown or settings menu
2. Allow user to choose tile provider
3. Persist choice in localStorage
4. Use for both maps in dual view
```

**Recommended for Dual Map View**:
- Use Pattern 1 (error-based fallback)
- Apply same fallback logic to both map instances
- Keep fallback provider synchronized (both maps use same source)
- Document tile sources in about/help section

**Configuration Management**:
```text
Create config/tile-providers.ts:

export const tileProviders = {
  primary: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  },
  secondary: {
    name: 'Wikimedia',
    url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
    attribution: 'Wikimedia maps | Map data © OSM contributors',
    maxZoom: 19
  }
}
```

**Fallback Testing**:
- Manually test by blocking primary tile domain in DevTools
- Verify secondary tiles load correctly
- Verify attribution updates
- Test on both map instances simultaneously

---

## Summary of Key Decisions

### Integration Approach
- **Direct Leaflet API** with Vue 3 Composition API (no wrappers)
- **ShallowRef** for map instances (prevent deep reactivity)
- **Composable-first architecture** for reusability

### Component Architecture
- **MapPanel** as controlled component with event emissions
- **Props for configuration**, events for state changes
- **Provide/Inject** only for global config, not map instances

### Performance
- **Use terminal events** (moveend, zoomend) instead of continuous events
- **Explicit cleanup** in onUnmounted hook
- **Throttle emissions**, not Leaflet handlers

### TypeScript
- **@types/leaflet** with custom type extensions
- **Explicit return types** for composables
- **Type guards** for runtime safety

### Tile Configuration
- **Official OSM tiles** as primary source
- **Wikimedia tiles** as secondary fallback
- **Compliant attribution** with visible links
- **Client-side throttling** via Leaflet config

---

## Next Steps

1. Create composables (useLeafletMap, useMapNavigation, useMapTileLayer)
2. Implement MapPanel component with TypeScript
3. Implement MapContainer with responsive layout
4. Configure tile providers with fallback logic
5. Add keyboard navigation (useMapKeyboard composable)
6. Implement error handling and loading states
7. Add accessibility features (ARIA labels, focus management)
8. Performance testing with Chrome DevTools
9. Memory leak testing with repeated mount/unmount cycles

---

## References & Resources

**Official Documentation**:
- Leaflet API: https://leafletjs.com/reference.html
- Vue 3 Composition API: https://vuejs.org/api/composition-api.html
- OpenStreetMap Tile Usage Policy: https://operations.osmfoundation.org/policies/tiles/

**TypeScript**:
- @types/leaflet on DefinitelyTyped
- Vue 3 TypeScript Guide: https://vuejs.org/guide/typescript/overview.html

**Performance**:
- Leaflet Performance Tips: https://leafletjs.com/examples/performance/
- Web.dev Map Performance: https://web.dev/optimizing-web-maps/

**Accessibility**:
- W3C Map Accessibility: https://www.w3.org/WAI/tutorials/maps/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/

---

*End of Research Document*
