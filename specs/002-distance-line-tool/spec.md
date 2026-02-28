# Feature Specification: Distance Line Tool

**Feature Branch**: `002-distance-line-tool`  
**Created**: February 28, 2026  
**Status**: Draft  
**Input**: User description: "On the left map the user can add a distance line to the map. This is a single straight line. The line is fixed on the map, so if you eg. draw a line between new york and new jersey, when you zoom in or out the endpoints stay on new york and new jersey. The user is able to modify both ends of the line and change the size and direction of the line. On the right map this results in a line with the same length (on earth scale). The line on the right side can be on a different place dependend on where the right map is focussed. The line on the right can be modified in orientation, but the length is fixed on the length of the line on the left map."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Distance Line on Left Map (Priority: P1)

A user wants to measure the distance between two locations on the left map. They add a distance line by specifying two points (e.g., New York and New Jersey). The line appears as a straight line between these points and remains anchored to these geographic locations when zooming or panning.

**Why this priority**: This is the core functionality that enables the primary use case of distance measurement. Without this, no distance comparison can occur.

**Independent Test**: Can be fully tested by clicking to place two points on the left map and verifying that a line appears connecting them. Delivers immediate value by visualizing the distance between two locations.

**Acceptance Scenarios**:

1. **Given** the left map is displayed, **When** the user activates the distance line tool and clicks two points, **Then** a straight line appears connecting those two points
2. **Given** a distance line exists on the left map, **When** the user zooms in or out, **Then** the line endpoints remain fixed to their original geographic coordinates
3. **Given** a distance line exists on the left map, **When** the user pans the map, **Then** the line endpoints remain anchored to their original locations

---

### User Story 2 - Modify Left Map Line Endpoints (Priority: P2)

A user has drawn a distance line but wants to adjust it. They can drag either endpoint to a new location, changing the line's length and direction. The line updates in real-time as they drag.

**Why this priority**: Enables iterative refinement of measurements without needing to delete and redraw. This significantly improves user experience and efficiency.

**Independent Test**: Can be tested by creating a line, then dragging one endpoint to a new location and verifying the line updates. Delivers value by allowing measurement adjustments.

**Acceptance Scenarios**:

1. **Given** a distance line exists on the left map, **When** the user drags one endpoint, **Then** the line updates in real-time to reflect the new position
2. **Given** a distance line exists on the left map, **When** the user drags the other endpoint, **Then** both the length and direction of the line change accordingly
3. **Given** the user is dragging an endpoint, **When** they release the mouse, **Then** the endpoint locks to the new geographic location

---

### User Story 3 - View Synchronized Line on Right Map (Priority: P3)

When a distance line exists on the left map, a corresponding line appears on the right map with the same real-world length. The right map line can be positioned anywhere on the map (independent of the left map's view) but always maintains the same physical distance.

**Why this priority**: This is the key comparison feature that allows users to understand scale differences across locations. Essential for the dual-map comparison concept.

**Independent Test**: Can be tested by drawing a line on the left map and verifying a line with identical real-world length appears on the right map. Delivers value by enabling scale comparison across different geographic areas.

**Acceptance Scenarios**:

1. **Given** a distance line exists on the left map, **When** the right map is displayed, **Then** a line with the same real-world length appears on the right map
2. **Given** the left map line length changes, **When** the user modifies an endpoint, **Then** the right map line length updates to match
3. **Given** both maps are visible, **When** the user pans the right map to a different location, **Then** the right map line remains visible with the same length

---

### User Story 4 - Rotate Right Map Line (Priority: P4)

A user wants to compare the distance at different orientations on the right map. They can rotate the right map line to any angle while its length remains locked to the left map line's length. This helps visualize how the same distance fits in different directions.

**Why this priority**: Adds flexibility for advanced comparisons but is not essential for basic functionality. Users can still understand scale without rotation.

**Independent Test**: Can be tested by rotating the right map line and verifying its length remains constant. Delivers value by enabling directional scale comparisons.

**Acceptance Scenarios**:

1. **Given** a line exists on the right map, **When** the user rotates it, **Then** the line orientation changes while length remains constant
2. **Given** the user is rotating the right map line, **When** they release, **Then** the line locks to the new orientation
3. **Given** the right map line is rotated, **When** the left map line length changes, **Then** the right map line updates its length while maintaining its orientation

---

### Edge Cases

- What happens when the user tries to place both endpoints at the same location (zero-length line)?
- What happens when the distance line extends beyond the visible map bounds?
- What happens when the right map is zoomed to a level where the line length exceeds the viewport size?
- How does the system handle extremely short distances (e.g., 1 meter) versus extremely long distances (e.g., across continents)?
- What happens when the user switches the right map to a location near the poles where map distortion is significant?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to add a single straight distance line on the left map by clicking two points
- **FR-002**: Line endpoints MUST remain fixed to their geographic coordinates (latitude/longitude) when users zoom or pan the map
- **FR-003**: Users MUST be able to drag either endpoint of the left map line to a new geographic location
- **FR-004**: System MUST calculate the real-world distance (in kilometers or miles) between the two endpoints using geodesic calculation
- **FR-005**: System MUST display a corresponding line on the right map with identical real-world length to the left map line
- **FR-006**: Right map line MUST be independently positionable - it can appear anywhere on the right map regardless of the left map's view location
- **FR-007**: Users MUST be able to rotate the right map line to any orientation
- **FR-008**: Right map line length MUST remain locked and synchronized with the left map line length at all times
- **FR-009**: When the left map line length changes (via endpoint dragging), the right map line MUST automatically update to match the new length
- **FR-010**: System MUST visually distinguish the distance line from other map elements (e.g., through color, thickness, or style)
- **FR-011**: System MUST support only one distance line at a time (adding a new line will replace the existing one)
- **FR-012**: Line endpoints MUST be visually distinct and indicate they are draggable
- **FR-013**: System MUST provide real-time visual feedback while dragging line endpoints or rotating the right line

### Key Entities

- **Distance Line**: Represents a straight line measurement between two geographic points, with properties including start point coordinates, end point coordinates, and real-world length in standard units
- **Map Point**: Represents a geographic location with latitude and longitude coordinates that serve as anchors for line endpoints
- **Line Orientation**: Represents the angle/direction of the right map line, independent of the left map line's orientation but constrained by the synchronized length

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a distance line on the left map in 2 clicks (one for each endpoint)
- **SC-002**: Line endpoints remain accurately anchored to geographic coordinates across all zoom levels (1-20) with zero coordinate drift
- **SC-003**: Right map line length matches left map line length with 99.5% accuracy or better (accounting for geodesic calculation precision)
- **SC-004**: Users can drag line endpoints and see real-time updates with less than 100ms latency
- **SC-005**: Users can rotate the right map line smoothly (minimum 30fps) without visual stuttering or lag
- **SC-006**: 100% of line length changes on the left map trigger corresponding updates on the right map within 100ms
- **SC-007**: Users can successfully complete a distance comparison task (draw line, modify endpoints, observe right map) in under 30 seconds
- **SC-008**: The distance line remains visible and functional when panning or zooming to any standard map location worldwide
