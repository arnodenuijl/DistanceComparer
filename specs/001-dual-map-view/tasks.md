---
description: "Implementation tasks for Dual Map View feature"
---

# Tasks: Dual Map View

**Input**: Design documents from `/specs/001-dual-map-view/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are OPTIONAL per Constitution Principle VI. Test tasks marked below can be implemented as needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1, US2, US3) - included for story-specific tasks only
- File paths use repository root (distance-comparer/) as base

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure needed before any feature work

- [ ] T001 Create Vue 3 + TypeScript project using Vite (npm create vite@latest distance-comparer -- --template vue-ts)
- [ ] T002 Install core dependencies: leaflet ^1.9.4, @types/leaflet ^1.9.8
- [ ] T003 [P] Configure TypeScript strict mode in tsconfig.json (strict: true, strictNullChecks: true, noImplicitAny: true)
- [ ] T004 [P] Import Leaflet CSS in src/main.ts (import 'leaflet/dist/leaflet.css')
- [ ] T005 [P] Create project directory structure (src/components/, src/composables/, src/types/, src/config/, src/assets/)
- [ ] T006 [P] Create base CSS in src/assets/main.css (reset, box-sizing, font-family)

**Checkpoint**: Project skeleton ready; TypeScript configured; dependencies installed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and configuration that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 [P] Define Coordinate interface in src/types/map.types.ts (lat: number, lng: number with validation ranges)
- [ ] T008 [P] Define Bounds interface in src/types/map.types.ts (north, south, east, west properties)
- [ ] T009 [P] Define MapConfig interface in src/types/map.types.ts (center, zoom, minZoom, maxZoom)
- [ ] T010 [P] Define TileLayerConfig interface in src/types/map.types.ts (urlTemplate, attribution, maxZoom, minZoom)
- [ ] T011 [P] Define MapPanelEvents type in src/types/map.types.ts (event names and payload types)
- [ ] T012 [P] Create default map configuration in src/config/map.config.ts (default center {0,0}, zoom 2, tile URL, attribution, subdomains: ['a', 'b', 'c'])

**Checkpoint**: Foundation ready - type system complete; user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Display Two Maps Side by Side (Priority: P1) 🎯 MVP

**Goal**: Display two independently initialized world maps in a responsive layout (side-by-side on desktop, stacked on mobile)

**Independent Test**: Load application and verify: (1) Two map panels visible, (2) Each shows OpenStreetMap tiles, (3) Responsive layout switches at 768px breakpoint, (4) Both maps load at zoom level 2 centered at {0,0}

**Acceptance Criteria**:
- Two map panels displayed side by side with equal width on desktop (viewport ≥ 768px)
- Maps stack vertically on mobile (viewport < 768px)
- Both maps show world view at identical initial zoom level
- OpenStreetMap attribution visible on each map

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create useLeafletMap composable in src/composables/useLeafletMap.ts with shallowRef for map instance
- [ ] T014 [US1] Implement map initialization in useLeafletMap.onMounted (create L.Map with config, add tile layer)
- [ ] T015 [US1] Implement map cleanup in useLeafletMap.onUnmounted (call map.remove() to prevent memory leaks)
- [ ] T016 [US1] Add basic exposed methods to useLeafletMap (getCenter, getZoom, setView)
- [ ] T017 [US1] Add isReady and error state tracking to useLeafletMap composable
- [ ] T018 [P] [US1] Create MapPanel.vue component in src/components/MapPanel.vue with template ref for map container
- [ ] T019 [US1] Define MapPanel props in src/components/MapPanel.vue (id, initialCenter, initialZoom, minZoom, maxZoom, tileUrl, attribution)
- [ ] T020 [US1] Integrate useLeafletMap in MapPanel.vue setup function, passing containerRef and config
- [ ] T021 [US1] Add map-ready event emission in MapPanel when isReady becomes true
- [ ] T022 [US1] Add error and loading state UI in MapPanel.vue template (loading spinner, error message slots with retry button)
- [ ] T023 [US1] Add MapPanel scoped styles (container fills parent, focus outline styles)
- [ ] T024 [US1] Add basic ARIA attributes to MapPanel (role="application", aria-label, tabindex="0")
- [ ] T025 [US1] Expose map methods via defineExpose in MapPanel.vue (setView, getCenter, getZoom, map)
- [ ] T026 [P] [US1] Create MapContainer.vue component in src/components/MapContainer.vue
- [ ] T027 [US1] Define MapContainer props (breakpointWidth default 768, gap default 0, initialLayout default 'auto')
- [ ] T028 [US1] Add leftMapConfig and rightMapConfig props to MapContainer for passing to child MapPanels
- [ ] T029 [US1] Implement responsive layout logic in MapContainer (computed currentLayout based on viewportWidth)
- [ ] T030 [US1] Add window resize listener in MapContainer.onMounted with handleResize function
- [ ] T031 [US1] Emit layout-changed event in MapContainer when layout mode switches
- [ ] T032 [US1] Create template in MapContainer with two MapPanel slots (left and right)
- [ ] T033 [US1] Add MapContainer scoped styles (flexbox layout, side-by-side and stacked modes, responsive CSS)
- [ ] T034 [US1] Add border between panels in MapContainer (border-right in side-by-side, border-bottom in stacked)
- [ ] T035 [US1] Expose methods in MapContainer (getLeftMap, getRightMap, getCurrentLayout)
- [ ] T036 [P] [US1] Create App.vue with MapContainer usage
- [ ] T037 [US1] Configure left map in App.vue (initialCenter: {0, 0}, initialZoom: 2)
- [ ] T038 [US1] Configure right map in App.vue (initialCenter: {0, 0}, initialZoom: 2)
- [ ] T039 [US1] Add app header in App.vue (title "Distance Comparer", layout indicator)
- [ ] T040 [US1] Add global styles to App.vue (reset, full viewport height, font)

**Checkpoint**: User Story 1 complete! Two maps display side by side, responsive layout works, maps load tiles successfully

**MVP Delivery**: This phase delivers a fully functional MVP demonstrating the core value proposition

---

## Phase 4: User Story 2 - Navigate Each Map Independently (Priority: P2)

**Goal**: Enable independent pan and zoom interactions for each map using mouse/touch gestures

**Independent Test**: Load application, then: (1) Drag left map and verify right map stays still, (2) Scroll wheel on right map and verify left map doesn't zoom, (3) Touch gestures work on mobile, (4) Maps respect min/max zoom limits

**Acceptance Criteria**:
- Pan one map by dragging; other map remains stationary
- Zoom one map with scroll wheel; other map zoom unchanged
- Touch gestures (pan drag, pinch zoom) work on mobile
- Panning stops when cursor leaves map boundary
- Maps respect configured min/max zoom levels

### Implementation for User Story 2

- [ ] T041 [P] [US2] Create useMapEvents composable in src/composables/useMapEvents.ts for event adapter pattern
- [ ] T042 [US2] Attach Leaflet moveend event listener in useMapEvents (emit center-changed with debouncing)
- [ ] T043 [US2] Attach Leaflet zoomend event listener in useMapEvents (emit zoom-changed with debouncing)
- [ ] T044 [US2] Implement debouncing logic in useMapEvents (150ms delay per research.md)
- [ ] T045 [US2] Convert Leaflet event data to plain objects in useMapEvents (extract lat/lng from LatLng objects)
- [ ] T046 [US2] Add cleanup in useMapEvents.onUnmounted (remove all Leaflet event listeners)
- [ ] T047 [P] [US2] Create useMapNavigation composable in src/composables/useMapNavigation.ts
- [ ] T048 [US2] Track interaction state in useMapNavigation (isDragging, isZooming, inputMode)
- [ ] T049 [US2] Add panTo method to useMapNavigation wrapping Leaflet map.panTo
- [ ] T050 [US2] Add zoomIn/zoomOut methods to useMapNavigation wrapping Leaflet zoom methods
- [ ] T051 [US2] Add fitBounds method to useMapNavigation with padding options
- [ ] T052 [US2] Integrate useMapEvents into MapPanel.vue component
- [ ] T053 [US2] Wire up center-changed event emission in MapPanel using useMapEvents
- [ ] T054 [US2] Wire up zoom-changed event emission in MapPanel using useMapEvents
- [ ] T055 [US2] Add bounds-changed event emission in MapPanel (debounced)
- [ ] T056 [US2] Integrate useMapNavigation into MapPanel.vue component
- [ ] T057 [US2] Expose navigation methods from MapPanel (panTo, zoomIn, zoomOut, fitBounds)
- [ ] T058 [US2] Add loading-start and loading-end event emissions in MapPanel
- [ ] T059 [US2] Attach Leaflet loading and load events for tile loading state
- [ ] T060 [US2] Add error event emission in MapPanel with structured error payload
- [ ] T061 [US2] Implement tile loading error handler in MapPanel (network errors, tile 404s)
- [ ] T061b [US2] Implement automatic tile retry with exponential backoff (use retryAttempts and retryDelay from config)
- [ ] T061c [US2] Add retry() method to error slot props that resets error state and re-initializes map
- [ ] T062 [US2] Add visual loading indicator in MapPanel during tile fetch (spinner overlay)
- [ ] T063 [US2] Ensure mouse panning works independently per panel (verify Leaflet default behavior)
- [ ] T064 [US2] Ensure scroll wheel zooming works independently per panel (verify Leaflet default behavior)
- [ ] T065 [US2] Test touch gestures on mobile (pan drag and pinch zoom work independently)
- [ ] T066 [US2] Verify zoom limits are enforced (maxZoom: 18, minZoom: 2 per config)
- [ ] T067 [US2] Add throttling for rapid pan/zoom operations (prevent overwhelming tile server)

**Checkpoint**: User Story 2 complete! Each map navigates independently, events fire correctly, error handling works

---

## Phase 5: User Story 3 - Keyboard Navigation Support (Priority: P3)

**Goal**: Enable keyboard-based navigation for accessibility compliance

**Independent Test**: Using only keyboard: (1) Tab to focus left map, verify focus outline, (2) Press arrow keys to pan, (3) Press +/- to zoom, (4) Tab to switch to right map, (5) Navigate right map with keyboard, (6) Press Escape to remove focus

**Acceptance Criteria**:
- Tab key moves focus between map panels with visible outline
- Arrow keys pan the focused map in the pressed direction
- Plus (+) and minus (-) keys zoom focused map in/out
- Escape key removes focus from map panel
- Screen reader announces zoom and center changes

### Implementation for User Story 3

- [ ] T068 [P] [US3] Create useMapKeyboard composable in src/composables/useMapKeyboard.ts
- [ ] T069 [US3] Define keyboard mappings in useMapKeyboard (arrows, +/-, Tab, Escape)
- [ ] T070 [US3] Implement arrow key handler in useMapKeyboard (pan map by fixed pixel offset)
- [ ] T071 [US3] Implement plus/minus key handler in useMapKeyboard (zoom in/out by 1 level)
- [ ] T072 [US3] Implement Escape key handler in useMapKeyboard (blur active element)
- [ ] T073 [US3] Add panStepSize and zoomStepSize configuration to useMapKeyboard (default 50px, 1 level)
- [ ] T074 [US3] Integrate useMapKeyboard into MapPanel.vue component
- [ ] T075 [US3] Add keydown event listener to MapPanel container div
- [ ] T076 [US3] Add focus and blur event handlers in MapPanel
- [ ] T077 [US3] Emit focus-gained event when MapPanel receives focus
- [ ] T078 [US3] Emit focus-lost event when MapPanel loses focus
- [ ] T079 [US3] Add visual focus indicator styling to MapPanel (2px outline in focus state)
- [ ] T080 [US3] Track focused panel in MapContainer (focusedPanelId state)
- [ ] T081 [US3] Emit panel-focus-changed event from MapContainer when focus switches
- [ ] T082 [US3] Ensure only one map panel can have focus at a time
- [ ] T083 [P] [US3] Add ARIA live region to MapPanel for screen reader announcements
- [ ] T084 [US3] Announce zoom level changes to screen readers (aria-live="polite")
- [ ] T085 [US3] Announce center coordinate changes to screen readers (formatted as degrees)
- [ ] T086 [US3] Add ARIA label describing keyboard shortcuts on focus
- [ ] T087 [US3] Update MapPanel.contract.md if keyboard API differs from spec
- [ ] T088 [US3] Test keyboard navigation flow: Tab → Arrow keys → +/- → Tab → Escape
- [ ] T089 [US3] Test screen reader announcements with NVDA/JAWS (Windows) or VoiceOver (Mac)

**Checkpoint**: User Story 3 complete! Full keyboard accessibility implemented, screen reader support working

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements, performance optimization, and production readiness

- [ ] T090 [P] Add error boundary wrapper component (src/components/MapErrorBoundary.vue) - optional
- [ ] T091 [P] Add favicon to public/ directory
- [ ] T092 [P] Configure Vite build optimization (bundle size target <500KB gzipped)
- [ ] T093 [P] Add robots.txt and meta tags for SEO (optional for MVP)
- [ ] T094 Update README.md with setup instructions, architecture overview, and quickstart reference
- [ ] T095 [P] Add JSDoc comments to public APIs (composables, exposed methods)
- [ ] T096 Test application on target browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- [ ] T097 Test responsive behavior at breakpoints (768px, 320px minimum width)
- [ ] T098 Verify OpenStreetMap attribution is visible and linked correctly on both maps
- [ ] T099 Performance audit: measure initial load time and interaction latency
- [ ] T100 Accessibility audit: run Lighthouse accessibility score (target: 95+)

**Checkpoint**: Application polished and production-ready

---

## Dependencies & Execution Strategy

### Critical Path (Sequential)

1. **Phase 1 (Setup)** → Must complete before any other phase
2. **Phase 2 (Foundational)** → Must complete before Phase 3, 4, 5
3. **Phase 3 (US1)** → MVP blocker, must complete before US2 and US3
4. **Phase 4 (US2)** → Can start after US1, independent of US3
5. **Phase 5 (US3)** → Can start after US1, independent of US2
6. **Phase 6 (Polish)** → Can start after US1, parallel with US2/US3

### Parallel Execution Opportunities

**After Phase 2 completes**, these can run in parallel:
- **US1 Core**: T013-T025 (composables and MapPanel) can be developed while...
- **US1 Layout**: T026-T035 (MapContainer) developed separately, then integrated

**After Phase 3 completes**, these can run in parallel:
- **US2 Navigation**: T041-T067 (one developer)
- **US3 Keyboard**: T068-T089 (another developer)
- **Polish**: T090-T095 (documentation and tooling)

### Recommended MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1 only)**

This delivers a working dual map view demonstrating core value with ~40 tasks (~16-24 hours effort).

User Story 2 (navigation) and User Story 3 (keyboard) can be delivered as iterative enhancements.

---

## Task Summary

| Phase | Task Count | Estimated Effort | Parallelizable Tasks |
|-------|-----------|------------------|---------------------|
| Phase 1: Setup | 6 tasks | 2 hours | 4 tasks (T003-T006) |
| Phase 2: Foundational | 6 tasks | 3 hours | All 6 tasks (T007-T012) |
| Phase 3: US1 (MVP) | 28 tasks | 12-16 hours | 8 tasks (T013, T018, T026, T036 + docs) |
| Phase 4: US2 | 29 tasks | 11-13 hours | 4 tasks (T041, T047 + parallel testing) |
| Phase 5: US3 | 22 tasks | 8-10 hours | 3 tasks (T068, T083 + testing) |
| Phase 6: Polish | 11 tasks | 4-6 hours | 6 tasks (T090-T095) |
| **TOTAL** | **102 tasks** | **40-50 hours** | **31 parallelizable** |

**MVP Effort**: ~21-25 hours (Phases 1-3)  
**Full Feature**: ~40-50 hours (All phases)

---

## Validation Checklist

After completing all tasks, verify:

### User Story 1 Validation
- [ ] Two maps display side by side on desktop (viewport ≥ 768px)
- [ ] Maps stack vertically on mobile (viewport < 768px)
- [ ] Both maps show OpenStreetMap tiles
- [ ] Initial view: world map at zoom level 2
- [ ] Maps resize correctly when viewport changes
- [ ] Attribution visible on both maps

### User Story 2 Validation
- [ ] Dragging left map does not affect right map
- [ ] Zooming left map does not affect right map
- [ ] Dragging right map does not affect left map
- [ ] Zooming right map does not affect left map
- [ ] Touch gestures work on mobile devices
- [ ] Maps respect min/max zoom limits
- [ ] Error messages display when tiles fail to load
- [ ] Other map continues working when one map has an error

### User Story 3 Validation
- [ ] Tab key moves focus to first map (visible outline)
- [ ] Arrow keys pan focused map
- [ ] Plus/minus keys zoom focused map
- [ ] Tab key switches focus to second map
- [ ] Escape key removes focus from map
- [ ] Screen reader announces zoom changes
- [ ] Screen reader announces center changes
- [ ] Keyboard shortcuts documented in ARIA labels

### Constitution Compliance Validation
- [ ] Principle I: User experience is intuitive (direct manipulation, minimal clicks)
- [ ] Principle II: Components are modular and reusable (MapPanel used twice)
- [ ] Principle III: TypeScript strict mode enabled, all types explicit
- [ ] Principle IV: Responsive layout works, keyboard accessible, ARIA support
- [ ] Principle V: Load time <3s, interactions <100ms (measure with DevTools)
- [ ] Principle VI: Tests optional (not blocking implementation)
- [ ] Principle VII: Only essential dependencies (Leaflet, Vue, TypeScript)

### Performance Validation
- [ ] Initial map load completes in <3 seconds on 25 Mbps connection
- [ ] Pan/zoom interactions feel instantaneous (<100ms perceived delay)
- [ ] No memory leaks (verify with Browser DevTools memory profiler)
- [ ] Bundle size <500KB gzipped (check Vite build output)

### Accessibility Validation
- [ ] Lighthouse accessibility score ≥95
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Screen reader can navigate and use maps
- [ ] Color not sole means of conveying information

---

## Implementation Strategy

### Iteration 1: MVP (Phases 1-3)
Focus: Get working dual map view displaying side by side
- Delivers immediate user value
- Demonstrates core concept
- Enables user feedback on layout and design
- ~21-25 hours effort

### Iteration 2: Navigation (Phase 4)
Focus: Add mouse/touch interaction
- Enables actual comparison workflows
- Users can position different locations on each map
- ~10-12 hours effort

### Iteration 3: Accessibility (Phase 5)
Focus: Keyboard navigation and screen reader support
- Meets constitution accessibility requirements
- Expands user base to keyboard-only users
- ~8-10 hours effort

### Iteration 4: Polish (Phase 6)
Focus: Production readiness
- Performance optimization
- Cross-browser testing
- Documentation
- ~4-6 hours effort

**Total Time to Full Feature**: 6-8 working days for solo developer, 3-4 days for pair/team

---

## Notes

- **Tests are optional** per Constitution Principle VI. No test tasks included in this breakdown. Add test tasks if TDD is desired.
- **Parallel work**: 31 tasks marked with [P] can be executed simultaneously by multiple developers
- **MVP-first approach**: Phase 3 delivers a working prototype; subsequent phases are enhancements
- **Constitution compliance**: All tasks aligned with project constitution principles
- **Risk mitigation**: Research.md documents common pitfalls (shallowRef pattern, event debouncing) to avoid rework

---

**Generated**: 2026-02-28  
**Feature**: Dual Map View (001-dual-map-view)  
**Source Documents**: spec.md, plan.md, data-model.md, contracts/, research.md  
**Task Format**: Checklist-compatible markdown with task IDs, parallel markers, and story labels
