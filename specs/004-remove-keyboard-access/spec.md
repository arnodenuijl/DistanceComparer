# Feature Specification: Remove Keyboard Accessibility

**Feature Branch**: `004-remove-keyboard-access`  
**Created**: February 28, 2026  
**Status**: Draft  
**Input**: User description: "remove all Keyboard Accessible features"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mouse-Only Map Navigation (Priority: P1)

Users interact with maps exclusively using mouse or touch gestures, without keyboard support.

**Why this priority**: Core navigation must work after keyboard support removal. This is the primary interaction method once keyboard features are removed.

**Independent Test**: Can be fully tested by attempting to navigate maps using only mouse/touch (click-drag for pan, scroll wheel for zoom, click for focus) and verifying keyboard inputs (Tab, arrow keys, +/-, Escape) have no effect on map behavior.

**Acceptance Scenarios**:

1. **Given** the application is loaded, **When** user presses Tab key, **Then** no visual focus indicator appears on maps
2. **Given** a map is clicked, **When** user presses arrow keys, **Then** the map does not pan
3. **Given** a map is visible, **When** user presses + or - keys, **Then** the map zoom level does not change
4. **Given** a map was clicked, **When** user presses Escape key, **Then** no focus behavior changes occur
5. **Given** user is navigating with mouse, **When** dragging or scrolling the map, **Then** all navigation functions work normally

---

### User Story 2 - Mouse-Only Distance Line Manipulation (Priority: P2)

Users manipulate distance lines exclusively using mouse drag operations, without keyboard rotation controls.

**Why this priority**: Distance line tool must remain functional for core measurement tasks after keyboard rotation is removed.

**Independent Test**: Can be fully tested by creating distance lines and attempting to rotate them using keyboard (Arrow Left/Right, Shift+Arrow) and verifying these inputs have no effect, while mouse dragging endpoints works normally.

**Acceptance Scenarios**:

1. **Given** a distance line exists on the right map, **When** user presses Arrow Left or Arrow Right keys, **Then** the line does not rotate
2. **Given** a distance line exists on the right map, **When** user presses Shift + Arrow keys, **Then** the line does not rotate
3. **Given** a distance line exists, **When** user drags the end point with mouse, **Then** the line rotates around the start point normally

---

### User Story 3 - No Screen Reader Announcements (Priority: P3)

Application provides no audio announcements or ARIA live region updates for screen reader users.

**Why this priority**: Removes assistive technology support to simplify the application for sighted mouse/touch users only.

**Independent Test**: Can be fully tested by using a screen reader (NVDA, JAWS, VoiceOver) to navigate the application and verifying no announcements occur for zoom changes, position changes, or distance updates.

**Acceptance Scenarios**:

1. **Given** a screen reader is active, **When** user zooms a map, **Then** no zoom level announcement is made
2. **Given** a screen reader is active, **When** user pans a map, **Then** no position change announcement is made
3. **Given** a screen reader is active, **When** user creates or modifies a distance line, **Then** no distance measurement announcement is made
4. **Given** a screen reader is active, **When** user navigates to a map element, **Then** no ARIA label is read

---

### Edge Cases

- What happens when a user with keyboard-only access (no mouse) attempts to use the application? (Answer: Application becomes unusable - acceptable trade-off)
- How does the application behave if a user tries keyboard shortcuts that previously worked? (Answer: No response or action occurs)
- What happens if user documentation still references keyboard shortcuts? (Answer: Documentation must be updated separately)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST NOT respond to Tab key presses for map focus changes
- **FR-002**: System MUST NOT respond to arrow key presses for map panning
- **FR-003**: System MUST NOT respond to + or - key presses for map zooming
- **FR-004**: System MUST NOT respond to Escape key presses for focus removal
- **FR-005**: System MUST NOT respond to Arrow Left/Right key presses for distance line rotation
- **FR-006**: System MUST NOT respond to Shift + Arrow key combinations for distance line rotation
- **FR-007**: System MUST NOT display visual focus indicators (blue borders) on maps when clicked
- **FR-008**: System MUST NOT include ARIA labels on map elements
- **FR-009**: System MUST NOT include ARIA live regions for announcing zoom, position, or distance changes
- **FR-010**: System MUST NOT announce any state changes to screen readers
- **FR-011**: System MUST continue to support mouse click, drag, and scroll interactions
- **FR-012**: System MUST continue to support touch gestures (pinch, drag) on mobile devices
- **FR-013**: System MUST continue to support distance line endpoint dragging via mouse

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete all core tasks (pan, zoom, create distance lines, drag endpoints) using only mouse/touch without keyboard
- **SC-002**: Pressing any previously-supported keyboard shortcut (Tab, arrows, +/-, Escape) produces no application response within 100ms
- **SC-003**: Screen readers detect zero ARIA labels or live regions on map elements
- **SC-004**: Application bundle size reduces by at least 5KB due to removed keyboard and accessibility code
- **SC-005**: No visual focus indicators appear on any map element regardless of user interaction

## Assumptions

- **ASM-001**: The target user base consists exclusively of sighted users with mouse or touch input devices
- **ASM-002**: Compliance with WCAG 2.1 Level AA accessibility standards is not required for this application
- **ASM-003**: Users who require keyboard navigation will use alternative mapping applications
- **ASM-004**: The application will remain functional for mouse/touch users with identical feature parity (except keyboard methods)
- **ASM-005**: Existing mouse and touch interaction code will not be affected by keyboard feature removal
