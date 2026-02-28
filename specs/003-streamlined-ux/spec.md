# Feature Specification: Streamlined UX Improvements

**Feature Branch**: `003-streamlined-ux`  
**Created**: February 28, 2026  
**Status**: Draft  
**Input**: User description: "we want to make the system a bit more user friendly. - remove the layout-indicator and event-log to make the app a bit cleaner - instead of having to activate the 'Distance tool' it should just auto activate and you should immediately be able to draw a line - There should be a reset button to remove the current line and start over (or some other user friendly way if you have a better idea) - in the top banner it should have a few lines explaining how to use this site"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Immediate Tool Readiness with Instructions (Priority: P1)

As a new user visiting the Distance Comparer for the first time, I want the distance tool to be immediately active with clear usage instructions displayed in the header, so I can start drawing distance lines without needing to figure out how to activate features or what the tool does.

**Why this priority**: This is the core user experience improvement. New users should be able to accomplish their goal (comparing distances) within seconds of page load. Without this, users may be confused or leave the site. This combines auto-activation with instructional guidance for maximum immediate usability.

**Independent Test**: Can be fully tested by loading the application and immediately clicking two points on the left map. The user should see instructions before clicking and successfully create a distance line without any activation steps.

**Acceptance Scenarios**:

1. **Given** a user opens the Distance Comparer application, **When** the page loads, **Then** the distance tool is automatically in creation mode (ready to accept clicks) and usage instructions are displayed in the header
2. **Given** a new user sees the application for the first time, **When** they read the header instructions, **Then** they understand they need to click two points on the left map to create a distance line
3. **Given** the tool is auto-activated, **When** the user clicks two points on the left map, **Then** a distance line is created and displayed on both maps immediately
4. **Given** the application loads, **When** the user looks at the interface, **Then** they see a clean header with instructions and no technical debug information (event-log, layout-indicator)

---

### User Story 2 - Reset Distance Lines (Priority: P2)

As a user who has drawn a distance line, I want to easily reset/remove the current line and start over, so I can compare different locations without reloading the page.

**Why this priority**: After the initial line creation (P1), users will immediately need the ability to compare different distances. Without reset functionality, the tool becomes single-use per page load, severely limiting usability. This is essential for the tool's primary purpose of **comparing** distances.

**Independent Test**: Can be fully tested by creating a distance line, clicking a reset control, and verifying the line is removed and the tool returns to creation mode ready for a new line.

**Acceptance Scenarios**:

1. **Given** a distance line has been created on both maps, **When** the user activates the reset control, **Then** both distance lines are removed and the tool returns to creation mode
2. **Given** the user has activated reset, **When** they click two new points on the left map, **Then** a new distance line is created successfully
3. **Given** no distance line exists yet, **When** the user views the reset control, **Then** it is either hidden or clearly disabled to avoid confusion
4. **Given** a user wants to compare multiple locations, **When** they use reset between each comparison, **Then** they can perform multiple comparisons in a single session without page reloads

---

### User Story 3 - Clean Interface (Priority: P3)

As any user of the Distance Comparer, I want the interface to only show relevant controls and information without technical debugging details, so I can focus on the distance comparison task without visual clutter.

**Why this priority**: This is polish and refinement. While important for professional presentation, users can still accomplish their primary goal (P1) and iterate (P2) with a cluttered interface. Removing debug information improves focus and perceived quality.

**Independent Test**: Can be fully tested by loading the application and visually confirming that layout-indicator and event-log elements are not visible in the interface.

**Acceptance Scenarios**:

1. **Given** a user loads the application, **When** they view the interface, **Then** no "Current layout" indicator is visible
2. **Given** a user interacts with the maps, **When** map events occur (zoom, pan, etc.), **Then** no event log messages are displayed
3. **Given** a user views the header area, **When** they look for information, **Then** they see only usage instructions, distance display (when applicable), and reset control (when applicable)
4. **Given** technical debug information is removed, **When** developers need debugging, **Then** they can still access browser console logs for troubleshooting

---

### Edge Cases

- What happens when a user tries to reset before creating any distance line? (Control should be disabled or hidden)
- How does the system handle rapid clicks during line creation? (Should complete current operation before accepting new input)
- What happens if a user refreshes the page after creating a line? (Line is cleared, tool returns to initial ready state)
- How does the interface adapt on mobile/small screens with limited header space? (Instructions may need to be collapsed or simplified)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Application MUST automatically activate the distance tool in creation mode immediately upon page load
- **FR-002**: Application MUST display concise usage instructions in the header explaining how to use the distance comparison tool
- **FR-003**: Application MUST NOT display the layout-indicator component in the visible interface
- **FR-004**: Application MUST NOT display the event-log component in the visible interface  
- **FR-005**: Application MUST provide a reset control that removes existing distance lines from both maps
- **FR-006**: Reset control MUST be visible only when a distance line exists, or clearly disabled when no line exists
- **FR-007**: After resetting, the distance tool MUST return to creation mode ready to accept new line creation
- **FR-008**: Usage instructions MUST be clear, concise (2-4 lines maximum), and understandable to first-time users
- **FR-009**: Distance display MUST remain visible in the header when a line exists to show measurement results
- **FR-010**: All existing distance tool functionality (line creation, dragging on right map, rotation on right map) MUST continue to work unchanged

### Key Entities

- **Distance Tool State**: Represents the current mode of the distance tool (creation mode, line displayed, reset available). Transitions: creation → line-exists → creation (after reset)
- **Distance Line**: Represents a line drawn between two geographic points with associated distance measurement. Exists on both left map (creation) and right map (synchronized, interactive)
- **Usage Instructions**: Static text content displayed in header to guide user interaction. Should explain the three-step process: click two points, compare on second map, reset to start over

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users can successfully create their first distance line within 30 seconds of page load without external guidance (measured by time from page load to successful line creation)
- **SC-002**: Users can complete 5 consecutive distance comparisons (create line, view, reset, repeat) within 3 minutes, demonstrating efficient workflow
- **SC-003**: 90% of users successfully create a distance line on their first attempt without clicking any activation buttons
- **SC-004**: Header area displays only essential information (title, instructions, distance when available) with zero technical debug output visible to users
- **SC-005**: Reset functionality works consistently with 100% success rate (line removed, tool ready for new line) across all browser environments
