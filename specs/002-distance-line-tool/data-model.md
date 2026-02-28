# Data Model: Distance Line Tool

**Feature**: Distance Line Tool  
**Date**: February 28, 2026  
**Source**: Extracted from spec.md requirements and research.md findings

---

## Overview

The distance line tool adds measurement capabilities to the dual map view by managing a single distance line that spans between the two maps. The left map line is geo-anchored with draggable endpoints, while the right map line maintains identical length but allows rotation. This document defines the key entities and their relationships without specifying implementation details.

**Naming Convention**: This document defines `DistanceLineState` (full internal state with 9 attributes). The component contract uses a simplified `DistanceLine` interface (5 attributes) for the public API. Both represent the same conceptual distance line entity but at different abstraction layers.

---

## Core Entities

### DistanceLineState

Represents a straight line measurement between two geographic points with synchronized state across both maps.

**Attributes**:
- **id**: Unique identifier for the line instance (string)
- **startPoint**: LineEndpoint - Starting point of the line
- **endPoint**: LineEndpoint - Ending point of the line
- **distanceMeters**: Real-world geodesic distance in meters (number)
- **distanceDisplay**: Formatted distance string with units (string, e.g., "5.2 km")
- **mapSide**: Which map this line belongs to (enum: 'left' | 'right')
- **visible**: Whether line is currently visible (boolean)
- **style**: Visual styling properties
  - color: Hex color code (string, default: '#FF0000')
  - weight: Line thickness in pixels (number, default: 3)
  - opacity: Line opacity 0-1 (number, default: 0.8)
  - dashArray: Dash pattern (string | null, e.g., '5, 10')

**Validation Rules**:
- startPoint and endPoint must have valid geographic coordinates
- distanceMeters must be >= 0
- distanceMeters must be calculated using geodesic formula (Haversine)
- color must be valid hex color (regex: `^#[0-9A-Fa-f]{6}$`)
- weight must be between 1 and 10 (inclusive)
- opacity must be between 0 and 1 (inclusive)
- Left and right maps must have exactly one DistanceLineState instance each (when active)

**State Transitions**:
```
Creation:
  null → created (on second click) → visible

Modification:
  visible → dragging (endpoint drag start) → visible (drag end)

Deletion:
  visible → null (new line creation replaces existing per FR-011)

Error States:
  N/A (distance calculation always succeeds for valid coordinates)
```

**Relationships**:
- Contains 2 LineEndpoint instances (start and end)
- Left map DistanceLineState synchronizes distanceMeters to right map DistanceLineState
- Right map DistanceLineState preserves bearing during length updates

---

### LineEndpoint

Represents a draggable anchor point (endpoint) of a distance line.

**Attributes**:
- **id**: Unique identifier (string)
- **position**: Geographic coordinates
  - lat: Latitude in decimal degrees (-90 to 90)
  - lng: Longitude in decimal degrees (-180 to 180)
- **isDragging**: Whether endpoint is currently being dragged (boolean)
- **markerStyle**: Visual appearance
  - radius: Circle radius in pixels (number, default: 8)
  - fillColor: Fill color hex (string, default: '#FF0000')
  - borderColor: Border color hex (string, default: '#FFFFFF')
  - borderWeight: Border thickness (number, default: 2)
- **cursorType**: CSS cursor hint (string, default: 'grab' | 'grabbing' when dragging)

**Validation Rules**:
- Latitude must be between -90 and 90 (inclusive)
- Longitude must be between -180 and 180 (inclusive)
- radius must be between 4 and 20 pixels
- Only one endpoint can be dragging at a time per line

**Drag Interaction States**:
```
Idle → MouseDown → Dragging → MouseUp → Idle
      ↓                         ↓
    cursorType: 'grab'     cursorType: 'grabbing'
```

**Events**:
- `dragStart`: Fired when user begins dragging endpoint
- `drag`: Fired continuously during drag (debounced to 16ms)
- `dragEnd`: Fired when user releases endpoint

---

### LineOrientation

Represents the rotational state of the right map's distance line.

**Attributes**:
- **bearing**: Direction in degrees (0-360)
  - 0 = North
  - 90 = East
  - 180 = South
  - 270 = West
- **isRotating**: Whether line is currently being rotated (boolean)
- **rotationAnchor**: Point around which rotation occurs (Coordinate)
  - Typically the line's midpoint or start point
- **rotationHandle**: Visual control for rotation (optional)
  - position: Coordinate
  - radius: Circle radius (number, default: 10)
  - visible: boolean

**Validation Rules**:
- bearing must be between 0 and 360 (normalized)
- rotationAnchor must have valid geographic coordinates
- Rotation only applies to right map line (left map line bearing is determined by endpoint positions)

**Rotation Methods** (conceptual, not implementation):
- `setBearing(degrees: number)`: Set absolute bearing
- `rotate(deltaDegrees: number)`: Rotate relative to current bearing
- `snapToCardinal()`: Snap to nearest cardinal direction (N, E, S, W)

---

### LineSynchronization

Coordination state between left and right map lines.

**Attributes**:
- **leftLine**: Reference to left map DistanceLineState
- **rightLine**: Reference to right map DistanceLineState
- **synchronizedDistance**: Distance in meters that both lines must maintain (number)
- **lastSyncTimestamp**: Timestamp of last synchronization (number, milliseconds)
- **syncLatency**: Measured delay between left change and right update (number, milliseconds)
- **autoSync**: Whether synchronization is enabled (boolean, default: true)

**Synchronization Rules**:
- When left line distance changes → update synchronizedDistance → recalculate right line endpoints
- Right line length is always locked to synchronizedDistance (FR-008)
- Right line bearing is preserved during length updates (FR-009)
- Synchronization must occur within 100ms (SC-006)

**Sync Events**:
- `syncStart`: Left line distance changed, sync initiated
- `syncComplete`: Right line updated successfully
- `syncError`: Sync failed (e.g., invalid bearing calculation)

---

### LineCreationState

Tracks the interactive state during line creation (two-click workflow).

**Attributes**:
- **mode**: Current creation mode (enum: 'inactive' | 'awaiting-first-click' | 'awaiting-second-click')
- **firstClick**: Coordinate of first click (Coordinate | null)
- **previewLine**: Temporary line from first click to cursor (DistanceLineState | null)
- **cursorPosition**: Current mouse/touch position (Coordinate | null)

**Creation Workflow**:
```
Step 1: User activates distance line tool
  mode: 'inactive' → 'awaiting-first-click'

Step 2: User clicks first point
  mode: 'awaiting-first-click' → 'awaiting-second-click'
  firstClick: set to click coordinates
  previewLine: created (from firstClick to cursor position)

Step 3: User moves cursor
  previewLine: updates endpoint to cursor position in real-time

Step 4: User clicks second point
  mode: 'awaiting-second-click' → 'inactive'
  previewLine: removed
  DistanceLineState: created with start=firstClick, end=secondClick
```

**Visual Feedback**:
- Preview line rendered with dashed style (`dashArray: '5, 5'`)
- Preview line opacity: 0.5 (lower than final line)
- Cursor changes to crosshair during creation mode

---

### DistanceUnit

Configuration for displaying distance values in different units.

**Attributes**:
- **unit**: Selected unit (enum: 'meters' | 'kilometers' | 'miles' | 'feet')
- **precision**: Number of decimal places (number, default: 1)
- **autoConvert**: Automatically choose unit based on distance magnitude (boolean, default: true)
  - < 1000m → meters
  - >= 1000m → kilometers
  - (or miles equivalent)

**Conversion Functions** (conceptual):
- `toDisplayString(meters: number)`: "5.2 km" or "3.2 mi"
- `toMeters(value: number, unit: DistanceUnit)`: Convert to meters
- `fromMeters(meters: number, unit: DistanceUnit)`: Convert from meters

---

## Entity Relationships

```
MapPanel (left)
  └── DistanceLineState (left)
        ├── LineEndpoint (start)
        ├── LineEndpoint (end)
        └── distanceMeters ──────┐
                                 │
                                 ▼
                        LineSynchronization
                                 │
                                 ▼
MapPanel (right)              synchronizedDistance
  └── DistanceLineState (right)       │
        ├── LineEndpoint (start) │
        ├── LineEndpoint (end) ◄─┘
        └── LineOrientation
              └── bearing (preserved during sync)
              
LineCreationState
  └── previewLine: DistanceLineState (temporary)
        └── updates during cursor movement
```

---

## State Management Patterns

### Left Map Line (Source of Truth for Distance)

```
User drags endpoint
  ↓
Update LineEndpoint.position
  ↓
Recalculate DistanceLineState.distanceMeters (Haversine)
  ↓
Update LineSynchronization.synchronizedDistance
  ↓
Trigger right map update
```

### Right Map Line (Slave to Distance, Master of Bearing)

```
Receive synchronizedDistance update
  ↓
Preserve current LineOrientation.bearing
  ↓
Calculate new endPoint using:
  - startPoint (fixed)
  - synchronizedDistance (from left)
  - bearing (preserved)
  ↓
Update DistanceLineState.endPoint
  ↓
Render updated polyline
```

### Rotation (Right Map Only)

```
User rotates line (drag or keyboard)
  ↓
Update LineOrientation.bearing
  ↓
Calculate new endPoint using:
  - startPoint (fixed)
  - distanceMeters (locked from left)
  - new bearing
  ↓
Update LineEndpoint.position
  ↓
Render rotated line
```

---

## Validation & Constraints

### Geographic Constraints

- All coordinates must be within valid lat/lng bounds
- Distance calculations account for Earth's curvature (geodesic, not Euclidean)
- Antipodal points (opposite sides of Earth) may have multiple valid bearings → use shortest path

### Performance Constraints

- Distance calculation must complete in <10ms (research.md target)
- Drag updates must not block main thread (use RAF scheduling)
- Cache distance results for identical coordinates (avoid redundant calculations)

### Concurrency Constraints

- Only one line creation in progress at a time
- Only one endpoint dragging at a time per line
- Left→right synchronization is unidirectional (no feedback loops)

---

## Error Handling

### Invalid Coordinates

**Scenario**: User drags endpoint outside valid lat/lng range (e.g., lat > 90)

**Response**:
- Clamp coordinates to valid bounds
- Log warning to console
- Do not crash or show error modal

### Zero-Length Line

**Scenario**: User places both endpoints at identical coordinates

**Response**:
- Allow creation (distance = 0m)
- Display distance as "0 m"
- Disable rotation on right map (no bearing when distance = 0)
- Show tooltip: "Line has zero length. Drag an endpoint to measure distance."

### Extreme Distances

**Scenario**: User creates line spanning >20,000km (half Earth circumference)

**Response**:
- Allow creation
- Haversine accuracy degrades slightly (but still within SC-003 tolerance)
- Consider showing warning tooltip for distances >15,000km

### Map Not Initialized

**Scenario**: Attempt to create line before Leaflet map is ready

**Response**:
- Queue line creation until map is ready
- Show loading state if delay > 500ms
- Timeout after 5 seconds with error message

---

## Accessibility Considerations

### Screen Reader Announcements

- Line created: "Distance line created. Length: 5.2 kilometers."
- Endpoint dragged: "Distance updated: 3.8 miles." (announce on dragend, not during drag)
- Line rotated: "Line rotated to bearing 45 degrees."
- Line deleted: "Distance line removed."

### Keyboard Navigation

- Tab to focus line endpoints
- Arrow keys to move endpoint (1px = ~100m depending on zoom)
- Shift+Arrow for larger movements
- Enter to confirm endpoint position
- Delete to remove line

### Visual Indicators

- High contrast colors (WCAG AA compliant)
- Minimum line weight: 3px (touch target)
- Focus rings on endpoints when keyboard-focused
- Distinct cursor states (grab, grabbing, crosshair)

---

## References

- Feature Specification: [spec.md](spec.md)
- Research Findings: [research.md](research.md)
- Existing Data Model: [../001-dual-map-view/data-model.md](../001-dual-map-view/data-model.md)
- Constitution: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)

---

**Data Model Version**: 1.0.0  
**Date**: February 28, 2026  
**Next Artifact**: Component contracts (contracts/DistanceLine.contract.md)
