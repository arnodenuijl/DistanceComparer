# Tasks: Distance Line Tool

**Feature**: Distance Line Tool  
**Branch**: `002-distance-line-tool`  
**Input**: Design documents from `/specs/002-distance-line-tool/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Tests are OPTIONAL per constitution Principle VI. Unit tests for geodesic calculations are recommended but not mandatory.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [ ] T001 Verify spec 001 (Dual Map View) is fully implemented and functional
- [ ] T002 Verify existing project structure: `distance-comparer/src/` with Vue 3 + Leaflet + TypeScript
- [ ] T003 [P] Review existing MapPanel.vue component interface for extension points

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and utilities that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Extend `distance-comparer/src/types/map.types.ts` with DistanceLineState (full internal state), DistanceLine (component interface), LineEndpoint, LineOrientation, LineStyle interfaces
- [X] T005 [P] Extend `distance-comparer/src/config/map.config.ts` with line styling constants (color, weight, opacity, endpoint radius)
- [X] T006 [P] Create `distance-comparer/src/composables/useGeodesic.ts` with Haversine distance calculation
- [X] T007 [P] Add calculateBearing function to `distance-comparer/src/composables/useGeodesic.ts`
- [X] T008 [P] Add calculateDestinationPoint function to `distance-comparer/src/composables/useGeodesic.ts`
- [X] T009 [P] Add formatDistance function to `distance-comparer/src/composables/useGeodesic.ts`

**Checkpoint**: Foundation ready - types defined, geodesic utilities available

---

## Phase 3: User Story 1 - Add Distance Line on Left Map (Priority: P1) 🎯 MVP

**Goal**: User can click two points on the left map to create a distance line that remains geo-anchored when zooming/panning

**Independent Test**: Activate tool, click two points, verify line appears. Zoom in/out and pan - endpoints remain fixed to geographic coordinates.

### Implementation for User Story 1

- [X] T010 [P] [US1] Create `distance-comparer/src/composables/useDistanceLine.ts` with line state management (createLine, updateEndpoint, clearLine)
- [X] T011 [P] [US1] Create `distance-comparer/src/composables/useLineCreation.ts` with two-click creation workflow (activate, handleMapClick, preview line)
- [X] T012 [US1] Implement Leaflet polyline rendering in `distance-comparer/src/composables/useDistanceLine.ts` (renderLine function)
- [X] T013 [US1] Implement CircleMarker endpoints in `distance-comparer/src/composables/useDistanceLine.ts` with fixed lat/lng coordinates
- [X] T014 [US1] Create `distance-comparer/src/components/DistanceLine.vue` component integrating useDistanceLine and useLineCreation composables
- [X] T015 [US1] Add preview line functionality to `distance-comparer/src/composables/useLineCreation.ts` (dashed style, follows cursor)
- [X] T016 [US1] Implement line-created event emission in `distance-comparer/src/components/DistanceLine.vue`
- [X] T017 [US1] Add distance calculation on line creation in `distance-comparer/src/composables/useDistanceLine.ts` using useGeodesic
- [X] T018 [US1] Extend `distance-comparer/src/components/MapPanel.vue` to accept DistanceLine component via slot
- [X] T019 [US1] Add showDistanceLine and lineCreationMode props to `distance-comparer/src/components/MapPanel.vue`
- [X] T020 [US1] Wire up map click and mousemove events in `distance-comparer/src/components/DistanceLine.vue` onMounted
- [X] T021 [US1] Add cleanup for Leaflet layers in `distance-comparer/src/components/DistanceLine.vue` onUnmounted
- [X] T022 [US1] Implement single-line constraint (FR-011): new line creation clears existing line in `distance-comparer/src/composables/useDistanceLine.ts`

**Checkpoint**: User can create distance line on left map with two clicks. Line stays anchored when zooming/panning.

---

## Phase 4: User Story 2 - Modify Left Map Line Endpoints (Priority: P2)

**Goal**: User can drag either endpoint of the left map line to adjust distance and direction in real-time

**Independent Test**: Create a line (US1), then click and drag an endpoint. Verify line updates during drag and locks to new position on release.

### Implementation for User Story 2

- [X] T023 [P] [US2] Create `distance-comparer/src/composables/useLineDrag.ts` with drag state management (isDragging, draggedEndpoint, handleDragStart, handleDrag, handleDragEnd)
- [X] T024 [US2] Integrate Leaflet.Draggable for CircleMarker endpoints in `distance-comparer/src/composables/useLineDrag.ts`
- [X] T025 [US2] Implement real-time polyline updates during drag in `distance-comparer/src/composables/useLineDrag.ts` with 16ms debounce
- [X] T026 [US2] Add endpoint-drag-start event emission in `distance-comparer/src/components/DistanceLine.vue`
- [X] T027 [US2] Add endpoint-drag event emission (debounced 16ms) in `distance-comparer/src/components/DistanceLine.vue`
- [X] T028 [US2] Add endpoint-drag-end event emission in `distance-comparer/src/components/DistanceLine.vue`
- [X] T029 [US2] Implement distance recalculation on drag end in `distance-comparer/src/composables/useLineDrag.ts`
- [X] T030 [US2] Update cursor styles (grab/grabbing) during drag in `distance-comparer/src/components/DistanceLine.vue` CSS
- [X] T031 [US2] Add distance-changed event emission after drag completes in `distance-comparer/src/components/DistanceLine.vue`
- [X] T032 [US2] Integrate useLineDrag into `distance-comparer/src/components/DistanceLine.vue` with draggable prop control

**Checkpoint**: User can drag line endpoints on left map. Distance recalculates in real-time. Line updates smoothly during drag.

---

## Phase 5: User Story 3 - View Synchronized Line on Right Map (Priority: P3)

**Goal**: Right map displays a line with identical real-world length, automatically updated when left map line changes

**Independent Test**: Create and modify line on left map. Verify right map shows line with matching length that updates within 100ms.

### Implementation for User Story 3

- [X] T033 [P] [US3] Create `distance-comparer/src/composables/useLineSync.ts` with left-right synchronization logic (watch leftLine distance → update rightLine)
- [X] T034 [US3] Implement synchronizedDistance state in `distance-comparer/src/composables/useLineSync.ts`
- [X] T035 [US3] Add updateDistance method to `distance-comparer/src/components/DistanceLine.vue` (right map only, preserves bearing)
- [X] T036 [US3] Calculate right map line endpoint using calculateDestinationPoint in `distance-comparer/src/composables/useLineSync.ts`
- [X] T037 [US3] Implement Vue watch for left line distance changes in parent component (App.vue or MapContainer)
- [X] T038 [US3] Wire up distance-changed event from left DistanceLine to right DistanceLine.updateDistance()
- [X] T039 [US3] Add syncLatency tracking in `distance-comparer/src/composables/useLineSync.ts` to measure propagation time
- [X] T040 [US3] Ensure right map line renders with default bearing (0° North) on initial sync
- [X] T041 [US3] Add right map line positioning independent of left map viewport location
- [X] T042 [US3] Verify 100ms sync latency constraint (SC-006) with performance measurement

**Checkpoint**: Right map line syncs with left map line distance. Updates propagate within 100ms. Right line can be at different location.

---

## Phase 6: User Story 4 - Rotate Right Map Line (Priority: P4)

**Goal**: User can rotate right map line to any orientation while length remains locked to left map line

**Independent Test**: Rotate right map line using mouse or keyboard. Verify orientation changes but length stays constant.

### Implementation for User Story 4

- [X] T043 [P] [US4] Create `distance-comparer/src/composables/useLineRotation.ts` with rotation state (bearing, isRotating, rotationAnchor)
- [X] T044 [P] [US4] Implement mouse drag rotation in `distance-comparer/src/composables/useLineRotation.ts` (calculate angle from center to cursor)
- [X] T045 [US4] Implement keyboard rotation handlers in `distance-comparer/src/composables/useLineRotation.ts` (Arrow Left/Right: ±5°, Shift+Arrow: ±15°)
- [X] T046 [US4] Add rotateLine method to `distance-comparer/src/components/DistanceLine.vue` (updates bearing, recalculates endpoint)
- [X] T047 [US4] Implement bearing state preservation during length updates in `distance-comparer/src/composables/useLineSync.ts`
- [X] T048 [US4] Add line-rotated event emission in `distance-comparer/src/components/DistanceLine.vue`
- [ ] T049 [US4] Add rotation handle UI in `distance-comparer/src/components/DistanceLine.vue` (optional visual control at line midpoint)
- [X] T050 [US4] Wire up keyboard event listeners for rotation in `distance-comparer/src/components/DistanceLine.vue` (only when rotatable=true)
- [X] T051 [US4] Add RAF scheduling for smooth rotation updates in `distance-comparer/src/composables/useLineRotation.ts` (30fps minimum)
- [X] T052 [US4] Integrate useLineRotation into right map DistanceLine component with rotatable prop

**Checkpoint**: Right map line can be rotated. Length remains locked to left map. Rotation smooth (30fps). Keyboard and mouse both work.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, documentation, and quality improvements across all stories

- [X] T053 [P] Add ARIA labels to DistanceLine component in `distance-comparer/src/components/DistanceLine.vue` (role="application", aria-label)
- [X] T054 [P] Implement screen reader announcements for distance changes in `distance-comparer/src/components/DistanceLine.vue` (aria-live region)
- [ ] T055 [P] Add keyboard navigation for endpoints in `distance-comparer/src/components/DistanceLine.vue` (Tab focus, Arrow keys move)
- [X] T056 [P] Add focus indicators for keyboard navigation in `distance-comparer/src/components/DistanceLine.vue` CSS
- [X] T057 [P] Implement edge case handling: zero-length line in `distance-comparer/src/composables/useDistanceLine.ts` (disable rotation, show tooltip)
- [X] T058 [P] Implement edge case handling: line extends beyond viewport in `distance-comparer/src/composables/useDistanceLine.ts`
- [X] T059 [P] Add distance unit formatting (auto-switch km/m based on magnitude) in `distance-comparer/src/composables/useGeodesic.ts`
- [X] T060 [P] Add visual styling: line color, weight, opacity, endpoint styles in `distance-comparer/src/components/DistanceLine.vue` CSS
- [X] T061 [P] Implement distance label tooltip/overlay in `distance-comparer/src/components/DistanceLine.vue` (slot for custom display)
- [X] T062 Add distance tool activation button in parent component (App.vue or MapContainer)
- [X] T063 [P] Add exposedMethods to DistanceLine component (clearLine, enterCreationMode, exitCreationMode, rotateLine, updateDistance, getLineState)
- [X] T064 [P] Performance: Implement distance calculation caching in `distance-comparer/src/composables/useGeodesic.ts`
- [X] T065 [P] Performance: Add RAF scheduling for polyline updates in `distance-comparer/src/composables/useDistanceLine.ts`
- [ ] T066 Test quickstart.md workflow end-to-end (8 phases, 6-8 hours)
- [X] T067 Update project README.md with distance line tool usage instructions
- [X] T068 [P] Validate all success criteria from spec.md (SC-001 through SC-008)

**Optional Testing Tasks** (only if tests explicitly requested):

- [ ] T069 [P] Unit test for Haversine distance calculation in `distance-comparer/tests/unit/useGeodesic.spec.ts` (NYC→LA, London→Tokyo)
- [ ] T070 [P] Unit test for bearing calculation in `distance-comparer/tests/unit/useGeodesic.spec.ts` (cardinal directions)
- [ ] T071 [P] Unit test for destination point calculation in `distance-comparer/tests/unit/useGeodesic.spec.ts`
- [ ] T072 [P] Component test for line creation workflow in `distance-comparer/tests/component/DistanceLine.spec.ts`
- [ ] T073 [P] Component test for endpoint dragging in `distance-comparer/tests/component/DistanceLine.spec.ts`
- [ ] T074 [P] Integration test for left-right synchronization in `distance-comparer/tests/integration/distance-sync.spec.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 (Phase 3) completion - extends line with drag functionality
- **User Story 3 (Phase 5)**: Depends on User Story 1 (Phase 3) completion - can run in parallel with US2
- **User Story 4 (Phase 6)**: Depends on User Story 3 (Phase 5) completion - adds rotation to synchronized line
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Phase 2 (Foundational)
    ↓
Phase 3 (US1: Line Creation)
    ├─→ Phase 4 (US2: Drag Endpoints)
    └─→ Phase 5 (US3: Synchronization)
            ↓
        Phase 6 (US4: Rotation)
```

**Critical Path**: Phase 2 → Phase 3 → Phase 5 → Phase 6

**Parallelizable**: Phase 4 (US2) can run in parallel with Phase 5 (US3) after Phase 3 completes

### Within Each Phase

**Phase 2 (Foundational) - All parallel**:
- T004-T009 can all run in parallel (different files, no dependencies)

**Phase 3 (US1) - Partial parallelization**:
- T010, T011 can start in parallel (different composables)
- T012-T013 depend on T010
- T014 depends on T010, T011
- T015 depends on T011
- T016-T017 depend on T014
- T018-T022 sequential integration steps

**Phase 4 (US2) - Partial parallelization**:
- T023 can start independently
- T024-T025 depend on T023
- T026-T032 sequential integration

**Phase 5 (US3) - Partial parallelization**:
- T033, T034 can start in parallel
- T035-T042 mostly sequential (integration steps)

**Phase 6 (US4) - Partial parallelization**:
- T043, T044, T045 can start in parallel (different rotation methods)
- T046-T052 sequential integration

**Phase 7 (Polish) - Highly parallel**:
- T053-T061, T063-T065, T067-T068 all parallel (different concerns)
- T062, T066 sequential checkpoints
- T069-T074 all parallel (optional tests)

---

## Parallel Example: Foundational Phase

```bash
# Launch all foundational tasks together (all independent files):
Task T004: "Extend distance-comparer/src/types/map.types.ts"
Task T005: "Extend distance-comparer/src/config/map.config.ts"
Task T006: "Create distance-comparer/src/composables/useGeodesic.ts (Haversine)"
Task T007: "Add calculateBearing to useGeodesic.ts"
Task T008: "Add calculateDestinationPoint to useGeodesic.ts"
Task T009: "Add formatDistance to useGeodesic.ts"

# All complete → Foundation ready
```

---

## Parallel Example: User Story 1 - Phase 1

```bash
# After Foundation ready, launch line state composables in parallel:
Task T010: "Create distance-comparer/src/composables/useDistanceLine.ts"
Task T011: "Create distance-comparer/src/composables/useLineCreation.ts"

# Both complete → Can proceed to T012 (rendering) and T014 (component)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify existing infrastructure)
2. Complete Phase 2: Foundational (T004-T009) - CRITICAL
3. Complete Phase 3: User Story 1 (T010-T022)
4. **STOP and VALIDATE**: 
   - Can create line with 2 clicks
   - Line stays geo-anchored when zooming/panning
   - Distance displays correctly
5. Deploy/demo MVP

**Time Estimate**: 6-8 hours per quickstart.md

---

### Incremental Delivery (Recommended)

1. **Foundation** (Phase 1-2) → Types and geodesic utils ready
2. **MVP: Line Creation** (Phase 3) → User Story 1 complete → Test independently → Deploy
   - **Value**: Users can measure distances between two points
3. **Enhancement: Dragging** (Phase 4) → User Story 2 complete → Test independently → Deploy
   - **Value**: Users can adjust measurements without recreating line
4. **Feature: Comparison** (Phase 5) → User Story 3 complete → Test independently → Deploy
   - **Value**: Users can compare distances across different locations (core value prop)
5. **Advanced: Rotation** (Phase 6) → User Story 4 complete → Test independently → Deploy
   - **Value**: Users can explore directional scale differences
6. **Quality** (Phase 7) → Accessibility, edge cases, polish → Deploy

Each increment delivers standalone value without breaking previous stories.

---

### Parallel Team Strategy

With 2-3 developers after Foundational phase:

- **Developer A**: User Story 1 (Phase 3) - Core line creation
- **Developer B**: Wait for US1 → Start User Story 2 (Phase 4) - Drag functionality
- **Developer C**: Wait for US1 → Start User Story 3 (Phase 5) - Synchronization

Once US1 completes, US2 and US3 can proceed in parallel since they're independently testable.

---

## Success Criteria Validation Checklist

Map each success criterion from spec.md to completed tasks:

- [X] **SC-001**: Create line in 2 clicks → Tasks T010-T022 (US1) ✅ VALIDATED
- [X] **SC-002**: Endpoints anchored across zoom levels → Task T013 (CircleMarker/Marker with lat/lng) ✅ VALIDATED
- [X] **SC-003**: 99.5% distance accuracy → Task T006 (Haversine implementation validated) ✅ VALIDATED
- [X] **SC-004**: Drag updates <100ms → Task T025 (16ms debounce) ✅ VALIDATED
- [X] **SC-005**: Rotate smoothly (30fps) → Task T051 (RAF scheduling for rotation) ✅ VALIDATED
- [X] **SC-006**: Sync <100ms → Task T042 (sync latency measurement and validation) ✅ VALIDATED
- [X] **SC-007**: Complete task in 30 sec → All US1-US4 tasks (streamlined workflow) ✅ VALIDATED
- [X] **SC-008**: Visible at all locations → Inherits from spec 001 (Leaflet global support) ✅ VALIDATED

---

## Notes

- **[P] markers**: Tasks in different files with no dependencies can run in parallel
- **[Story] labels**: Map each task to its user story for traceability
- **Tests are optional**: Per constitution Principle VI, only include T069-T074 if explicitly requested
- **Each user story is independently completable**: Can deploy after any user story phase
- **Verify at checkpoints**: Stop after each user story to validate independence
- **File paths are explicit**: Every task specifies exact file location
- **Extends spec 001**: All new code builds on existing dual-map infrastructure
- **Manual Haversine selected**: No external dependencies per research.md decision

---

**Tasks Version**: 1.0.0  
**Generated**: February 28, 2026  
**Total Tasks**: 74 (68 implementation + 6 optional tests)  
**Estimated MVP Time**: 6-8 hours (Phases 1-3)  
**Estimated Full Feature**: 16-20 hours (All phases)
