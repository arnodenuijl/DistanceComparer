# Data Model: Dual Map View

**Feature**: Dual Map View  
**Date**: 2026-02-28  
**Source**: Extracted from spec.md requirements and research findings

---

## Overview

The dual map view feature manages two independent map instances with their own state. This document defines the key entities and their relationships without specifying implementation details.

---

## Core Entities

### MapPanel

Represents a single interactive map instance with independent viewport state.

**Attributes**:
- **id**: Unique identifier for the map panel (string)
- **center**: Geographic center point
  - lat: Latitude in decimal degrees (-90 to 90)
  - lng: Longitude in decimal degrees (-180 to 180)
- **zoom**: Current zoom level (integer, provider-specific range)
- **viewportDimensions**: Display area
  - width: Width in pixels (integer)
  - height: Height in pixels (integer)
- **bounds**: Geographic bounding box of current view
  - northEast: { lat, lng }
  - southWest: { lat, lng }
- **focusState**: Keyboard focus indicator (boolean)
- **loadingState**: Tile loading status (enum: idle | loading | error)
- **errorMessage**: Optional error description (string | null)

**Validation Rules**:
- Latitude must be between -90 and 90 (inclusive)
- Longitude must be between -180 and 180 (inclusive)
- Zoom must be within provider's min/max zoom range
- Viewport dimensions must be positive integers
- Focus state is mutually exclusive between map panels

**State Transitions**:
```
Initial Load:
  idle → loading → (success: idle | failure: error)

User Interaction:
  idle → loading (during tile fetch) → idle

Focus Change:
  focused ↔ unfocused (triggered by Tab key or click)

Error Recovery:
  error → loading (on retry) → (idle | error)
```

---

### MapContainer

Parent container managing layout and coordination of two MapPanel instances.

**Attributes**:
- **layoutMode**: Display arrangement (enum: side-by-side | stacked)
- **breakpointWidth**: Threshold for layout mode switch (integer, pixels)
- **leftPanel**: Reference to left/top MapPanel
- **rightPanel**: Reference to right/bottom MapPanel

**Layout Rules**:
- **side-by-side mode**: Active when viewport width ≥ breakpointWidth (768px)
  - Both panels have equal width (50% each)
  - Vertical height fills available space
  
- **stacked mode**: Active when viewport width < breakpointWidth
  - Both panels span full width
  - Each panel has equal height (50% each vertically)

**Relationships**:
- Contains exactly 2 MapPanel instances
- Does not share state between panels (each panel maintains independence)
- Observes viewport resize to switch layout modes

---

### TileLayer

Configuration for map tile source and display.

**Attributes**:
- **tileUrlTemplate**: URL pattern for fetching tiles (string)
  - Contains placeholders: {z} (zoom), {x} (tile x), {y} (tile y)
- **attribution**: Copyright/attribution text (string)
- **maxZoom**: Maximum allowed zoom level (integer)
- **minZoom**: Minimum allowed zoom level (integer)
- **subdomains**: Optional tile server subdomains (array of strings)
- **retryAttempts**: Number of retry attempts for failed tiles (integer)
- **retryDelay**: Delay between retries in milliseconds (integer)

**Default Values**:
- tileUrlTemplate: OpenStreetMap standard tile server
- minZoom: 2 (world view)
- maxZoom: 18 (street level)
- retryAttempts: 3
- retryDelay: 1000ms

**Attribution Requirements** (per OpenStreetMap license):
- Must display: "© OpenStreetMap contributors"
- Must be visible at all times
- Must link to https://www.openstreetmap.org/copyright

---

### MapInteraction

Captures user interaction state during navigation.

**Attributes**:
- **isDragging**: Pan operation in progress (boolean)
- **isZooming**: Zoom operation in progress (boolean)
- **dragStartPoint**: Initial cursor position for drag
  - x: Pixel coordinate (integer)
  - y: Pixel coordinate (integer)
- **dragOffset**: Current drag displacement
  - deltaX: Horizontal offset in pixels (integer)
  - deltaY: Vertical offset in pixels (integer)
- **inputMode**: Current interaction method (enum: mouse | touch | keyboard)

**Interaction Rules**:
- Only one map panel can be in active interaction state at a time
- Dragging locks to the map panel where the gesture started
- Drag ends when cursor leaves map boundary or mouse/touch is released
- Keyboard navigation requires explicit focus on a map panel

---

### KeyboardNavigationState

Manages keyboard control state for accessibility.

**Attributes**:
- **focusedPanelId**: ID of currently focused map panel (string | null)
- **panStepSize**: Distance to pan per arrow key press (integer, pixels)
- **zoomStepSize**: Zoom levels to change per +/- key (integer)
- **navigationMode**: Keyboard navigation state (enum: pan | zoom | idle)

**Keyboard Mappings**:
- Arrow keys: Pan in direction (up/down/left/right)
- Plus (+) / Equals (=): Zoom in
- Minus (-) / Underscore (_): Zoom out
- Tab: Move focus to next map panel
- Shift + Tab: Move focus to previous map panel
- Escape: Remove focus from current panel

**Focus Rules**:
- Only one panel can have focus at a time
- Focus indicated by visual border/outline
- Focus required for keyboard navigation to function
- Click on map panel also sets focus

---

## Derived Values

### Geographic Distance (Future Enhancement)

Not implemented in initial MVP but planned for future iteration.

**Purpose**: Calculate distance between two points on different maps

**Attributes**:
- **point1**: { lat, lng, mapPanelId }
- **point2**: { lat, lng, mapPanelId }
- **distanceKm**: Great circle distance in kilometers (float)
- **distanceMi**: Great circle distance in miles (float)

---

## State Management Approach

**Principles**:
- Each MapPanel maintains its own state independently
- MapContainer does not synchronize state between panels
- Parent application can observe panel state via events but should not directly mutate it
- All state changes flow through well-defined transitions

**State Ownership**:
- MapPanel owns: center, zoom, bounds, focus, loading state
- MapContainer owns: layout mode, viewport dimensions
- TileLayer owns: tile source configuration (immutable after creation)
- MapInteraction owned by: individual MapPanel during interaction

**State Persistence**:
- State is ephemeral (not persisted across page reloads in MVP)
- Future enhancement may add URL state serialization or localStorage

---

## Validation Summary

| Entity | Critical Validations |
|--------|---------------------|
| MapPanel | Lat/lng bounds, zoom range, viewport positivity |
| MapContainer | Exactly 2 panels, valid breakpoint |
| TileLayer | Valid URL template, min < max zoom |
| MapInteraction | Drag coordinates within viewport |
| KeyboardNavigation | Valid focused panel ID, positive step sizes |

---

## Entity Relationships Diagram

```
MapContainer (1)
  │
  ├── contains ──> MapPanel (1) "left/top"
  │                  │
  │                  ├── uses ──> TileLayer (1)
  │                  ├── maintains ──> MapInteraction (0..1)
  │                  └── maintains ──> KeyboardNavigationState (0..1)
  │
  └── contains ──> MapPanel (1) "right/bottom"
                     │
                     ├── uses ──> TileLayer (1)
                     ├── maintains ──> MapInteraction (0..1)
                     └── maintains ──> KeyboardNavigationState (0..1)
```

**Notes**:
- Each MapPanel has its own TileLayer configuration (though initially identical)
- MapInteraction exists only during active user interaction (gesture in progress)
- KeyboardNavigationState exists only when panel has keyboard focus
- No direct relationships between sibling MapPanel instances (independence maintained)
