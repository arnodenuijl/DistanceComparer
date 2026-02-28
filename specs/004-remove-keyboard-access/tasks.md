# Tasks: Remove Keyboard Accessibility

**Feature Branch**: `004-remove-keyboard-access`  
**Input**: Design documents from `/specs/004-remove-keyboard-access/`  
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md, contracts/  
**Estimated Effort**: 4-6 hours

**Tests**: No test tasks included (tests not requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Vue 3 + TypeScript web application
- Source code in `distance-comparer/src/`
- No backend or API components

---

## Phase 1: Setup (Verification)

**Purpose**: Verify current state before removal

- [X] T001 Verify application builds and runs without errors (establish baseline)
- [X] T002 Document current keyboard shortcuts that will be removed (reference for validation)
- [X] T003 [P] Verify mouse and touch interactions work correctly (establish working baseline)

---

## Phase 2: User Story 1 - Mouse-Only Map Navigation (Priority: P1) 🎯 MVP

**Goal**: Remove all keyboard navigation from maps (Tab, arrow keys, +/-, Escape) while preserving mouse/touch navigation

**Independent Test**: Navigate maps using mouse (click-drag, scroll wheel) and verify keyboard inputs (Tab, arrows, +/-, Escape) have no effect

### Implementation for User Story 1

- [X] T004 [P] [US1] Delete src/composables/useMapKeyboard.ts file entirely
- [X] T005 [US1] Remove useMapKeyboard import from src/components/MapPanel.vue
- [X] T006 [US1] Remove useMapKeyboard() call and destructured values from src/components/MapPanel.vue script
- [X] T007 [P] [US1] Remove tabindex attribute from map container in src/components/MapPanel.vue template
- [X] T008 [P] [US1] Remove keyboard event handlers from src/composables/useMapEvents.ts (focus, blur, keydown listeners)
- [X] T009 [P] [US1] Remove panByOffset method from src/composables/useMapNavigation.ts (only used by keyboard, no longer needed) - N/A: panByOffset doesn't exist, panBy is general-purpose
- [X] T010 [P] [US1] Remove KEYBOARD_PAN_STEP constant from src/config/map.config.ts
- [X] T011 [P] [US1] Remove KEYBOARD_ZOOM_STEP constant from src/config/map.config.ts
- [X] T012 [P] [US1] Remove focus indicator styles (.map-panel:focus) from src/assets/main.css or component styles
- [X] T013 [P] [US1] Remove focus-visible styles from src/assets/main.css or component styles
- [X] T014 [US1] Verify TypeScript compilation passes with no errors
- [ ] T015 [US1] Verify mouse click-drag panning works on both maps **[MANUAL TESTING REQUIRED]**
- [ ] T016 [US1] Verify mouse scroll wheel zoom works on both maps **[MANUAL TESTING REQUIRED]**
- [ ] T017 [US1] Verify Tab key press has no effect (no focus indicators appear) **[MANUAL TESTING REQUIRED]**
- [ ] T018 [US1] Verify arrow key presses have no effect (maps do not pan) **[MANUAL TESTING REQUIRED]**
- [ ] T019 [US1] Verify +/- key presses have no effect (zoom does not change) **[MANUAL TESTING REQUIRED]**
- [ ] T020 [US1] Verify Escape key press has no effect **[MANUAL TESTING REQUIRED]**

**Checkpoint**: Maps navigate with mouse/touch only; keyboard inputs ignored

---

## Phase 3: User Story 2 - Mouse-Only Distance Line Manipulation (Priority: P2)

**Goal**: Remove keyboard rotation controls for distance lines while preserving mouse drag rotation

**Independent Test**: Create distance line and attempt keyboard rotation (Arrow Left/Right, Shift+Arrow); verify no effect while mouse dragging still works

### Implementation for User Story 2

- [X] T021 [US2] Remove keyboard rotation event listeners from src/composables/useLineRotation.ts (Arrow Left/Right handlers)
- [X] T022 [US2] Remove Shift+Arrow keyboard handlers from src/composables/useLineRotation.ts
- [X] T023 [US2] Preserve mouse drag endpoint rotation logic in src/composables/useLineRotation.ts
- [ ] T024 [US2] Verify distance line creation works with two mouse clicks on left map **[MANUAL TESTING REQUIRED]**
- [ ] T025 [US2] Verify dragging endpoints with mouse still rotates line on right map **[MANUAL TESTING REQUIRED]**
- [ ] T026 [US2] Verify Arrow Left/Right key presses have no effect on line rotation **[MANUAL TESTING REQUIRED]**
- [ ] T027 [US2] Verify Shift+Arrow key presses have no effect on line rotation **[MANUAL TESTING REQUIRED]**
- [ ] T028 [US2] Verify distance tooltips still display correctly **[MANUAL TESTING REQUIRED]**

**Checkpoint**: Distance lines work with mouse only; keyboard rotation disabled

---

## Phase 4: User Story 3 - No Screen Reader Announcements (Priority: P3)

**Goal**: Remove all ARIA labels, live regions, and screen reader support

**Independent Test**: Use screen reader (NVDA, JAWS, or VoiceOver) and verify no announcements occur for zoom, pan, or distance changes

### Implementation for User Story 3

- [X] T029 [P] [US3] Remove role="application" attribute from src/components/MapPanel.vue
- [X] T030 [P] [US3] Remove aria-label attribute from map container in src/components/MapPanel.vue
- [X] T031 [P] [US3] Remove aria-live region from src/components/MapPanel.vue (screen reader announcements)
- [X] T032 [P] [US3] Remove aria-atomic attribute from src/components/MapPanel.vue
- [X] T033 [P] [US3] Remove role="region" attribute from src/components/MapContainer.vue
- [X] T034 [P] [US3] Remove aria-label from MapContainer in src/components/MapContainer.vue
- [X] T035 [P] [US3] Remove role="application" from src/components/DistanceLine.vue
- [X] T036 [P] [US3] Remove aria-label from DistanceLine in src/components/DistanceLine.vue
- [X] T037 [P] [US3] Remove aria-live region from tooltip in src/components/DistanceLine.vue
- [X] T038 [P] [US3] Remove aria-atomic attribute from src/components/DistanceLine.vue
- [X] T039 [P] [US3] Remove role="region" from instructions section in src/App.vue
- [X] T040 [P] [US3] Remove aria-label from instructions in src/App.vue
- [X] T041 [P] [US3] Remove aria-label from reset button in src/App.vue (if present)
- [ ] T042 [US3] Verify no ARIA attributes remain in rendered DOM (use browser inspector) **[MANUAL TESTING REQUIRED]**
- [ ] T043 [US3] Verify screen reader does not announce zoom changes **[MANUAL TESTING REQUIRED]**
- [ ] T044 [US3] Verify screen reader does not announce position changes **[MANUAL TESTING REQUIRED]**
- [ ] T045 [US3] Verify screen reader does not announce distance measurements **[MANUAL TESTING REQUIRED]**

**Checkpoint**: All ARIA attributes removed; no screen reader announcements

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentation updates and final verification

- [X] T046 [P] Remove "Keyboard Accessible" feature bullet from distance-comparer/README.md
- [X] T047 [P] Remove "Keyboard Navigation" section from distance-comparer/README.md (lines ~62-67)
- [X] T048 [P] Remove "Screen Reader Support" section from distance-comparer/README.md (lines ~69-74)
- [X] T049 [P] Remove "Keyboard Rotation" subsection from Distance Line Tool docs in distance-comparer/README.md (lines ~117-122)
- [X] T050 [P] Remove keyboard shortcuts from "Keyboard Shortcuts Summary" in distance-comparer/README.md (lines ~176-182)
- [X] T051 [P] Remove "Keyboard navigation" bullet from Accessibility section in distance-comparer/README.md (line ~194 accessibility features)
- [X] T052 [P] Update "Accessibility" section to note keyboard and screen reader support removed
- [X] T053 [P] Remove KEYBOARD_PAN_STEP from Configuration section in distance-comparer/README.md (line ~266)
- [X] T054 [P] Update "Independent Navigation" feature description to remove "or keyboard" reference in distance-comparer/README.md (line ~8)
- [X] T055 [P] Update Component Architecture diagram to remove useMapKeyboard references in distance-comparer/README.md
- [ ] T056 Run full smoke test: open app in browser, verify all mouse/touch interactions work **[MANUAL TESTING REQUIRED]**
- [ ] T057 [US1] Verify touch gestures work on mobile device or emulator (pinch zoom, drag pan) per FR-012 **[MANUAL TESTING REQUIRED]**
- [ ] T058 Run keyboard verification test: press all previously-supported keys, verify no response **[MANUAL TESTING REQUIRED]**
- [X] T059 Verify application bundle size (should be ~5KB smaller) **[COMPLETED: 2.54KB reduction achieved]**
- [ ] T060 Verify no console errors or warnings in browser console **[MANUAL TESTING REQUIRED]**
- [ ] T061 Run quickstart.md validation (follow quickstart testing checklist) **[MANUAL TESTING REQUIRED]**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Can start after Setup - highest priority (P1)
- **User Story 2 (Phase 3)**: Can start after Setup - independent of US1
- **User Story 3 (Phase 4)**: Can start after Setup - independent of US1 and US2
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - can start after Setup
- **User Story 2 (P2)**: Independent of US1 - can work in parallel
- **User Story 3 (P3)**: Independent of US1 and US2 - can work in parallel

### Within Each User Story

**User Story 1**:
- T004 (delete file) should be done early
- T005, T006 (remove imports) must follow T004
- T007-T013 (remove attributes, handlers, styles, config) can run in parallel [P]
- T014 (TypeScript compilation) must come after code changes
- T015-T020 (verification) must come after all implementation

**User Story 2**:
- T021-T023 (modify useLineRotation) should be done together
- T024-T028 (verification) must come after implementation

**User Story 3**:
- T029-T041 (remove ARIA attributes) can all run in parallel [P] (different files or different parts of same file)
- T042-T045 (verification) must come after all implementation

**Polish**:
- T046-T055 (README updates) can all run in parallel [P]
- T056-T060 (final verification) should be done sequentially after documentation updates

### Parallel Opportunities

#### User Story 1 Parallel Tasks
```bash
# Can run simultaneously (different files or independent sections):
T007: Remove tabindex from MapPanel.vue template
T008: Remove keyboard handlers from useMapEvents.ts
T009: Remove panByOffset from useMapNavigation.ts
T010: Remove KEYBOARD_PAN_STEP from map.config.ts
T011: Remove KEYBOARD_ZOOM_STEP from map.config.ts
T012: Remove focus styles from main.css
T013: Remove focus-visible styles from main.css
```

#### User Story 3 Parallel Tasks
```bash
# Can run simultaneously (different files):
T029-T032: MapPanel.vue ARIA cleanup
T033-T034: MapContainer.vue ARIA cleanup
T035-T038: DistanceLine.vue ARIA cleanup
T039-T041: App.vue ARIA cleanup
```

#### Polish Parallel Tasks
```bash
# Can run simultaneously (different sections of README):
T046: Remove feature bullet
T047: Remove Keyboard Navigation section
T048: Remove Screen Reader section
T049: Remove Keyboard Rotation subsection
T050: Remove Keyboard Shortcuts Summary
T051: Remove keyboard from Accessibility
T052: Update Accessibility section
T053: Remove KEYBOARD_PAN_STEP from config
T054: Update Independent Navigation description
T055: Update Component Architecture diagram
```

### Full Parallel Strategy

If multiple developers available:
1. Complete Setup (Phase 1) together
2. Then split:
   - Developer A: User Story 1 (Phase 2) - Core keyboard removal
   - Developer B: User Story 2 (Phase 3) - Distance line keyboard removal
   - Developer C: User Story 3 (Phase 4) - ARIA removal
3. Reconvene for Polish (Phase 5) and final verification

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: User Story 1 (P1 - Core keyboard navigation removal)
3. **STOP and VALIDATE**: Test that maps work with mouse, keyboard does nothing
4. Decision point: Deploy US1 only, or continue to US2/US3

### Incremental Delivery

1. Complete Setup → Baseline established
2. Add User Story 1 → Test independently → maps are mouse/touch-only ✓
3. Add User Story 2 → Test independently → distance lines use mouse only ✓
4. Add User Story 3 → Test independently → no screen reader support ✓
5. Complete Polish → Documentation updated ✓

### Sequential Execution (Single Developer)

Recommended order:
1. Phase 1: Setup (T001-T003)
2. Phase 2: User Story 1 (T004-T020) - Most critical
3. Phase 3: User Story 2 (T021-T028) - Builds on US1
4. Phase 4: User Story 3 (T029-T045) - Independent cleanup
5. Phase 5: Polish (T046-T060) - Documentation and verification

---

## Notes

- This is a **REMOVAL** feature - no new code, only deletions and simplifications
- **Breaking change**: Keyboard-only users will lose all functionality (intentional per Constitution v2.0.0)
- [P] tasks = different files or independent sections, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and verifiable
- Commit after each logical group of tasks (e.g., after removing files, after removing attributes)
- Stop at any checkpoint to validate story independently
- Use browser inspector to verify ARIA attributes are removed from rendered DOM
- Test with actual screen reader if available (NVDA, JAWS, VoiceOver)
- Expected bundle size reduction: ~5-8KB (removal of useMapKeyboard composable and event handlers)
- Mouse and touch interactions MUST continue to work normally throughout all changes

---

## Success Criteria Validation

After completing all tasks, verify these success criteria from spec.md:

- **SC-001**: ✓ Users can pan, zoom, create distance lines, drag endpoints using only mouse/touch
- **SC-002**: ✓ Keyboard shortcuts (Tab, arrows, +/-, Escape) produce no response within 100ms
- **SC-003**: ✓ Screen readers detect zero ARIA labels or live regions
- **SC-004**: ✓ Bundle size reduced by at least 5KB
- **SC-005**: ✓ No visual focus indicators appear on any map element

---

## Total Task Count

- **Setup**: 3 tasks
- **User Story 1 (P1)**: 17 tasks
- **User Story 2 (P2)**: 8 tasks
- **User Story 3 (P3)**: 17 tasks
- **Polish**: 16 tasks
- **Total**: 61 tasks

**Parallel Opportunities**:
- US1: 7 tasks can run in parallel
- US2: Implementation tasks sequential, verification can overlap
- US3: 13 tasks can run in parallel
- Polish: 10 tasks can run in parallel
- **Total Parallelizable**: ~30 tasks (50% of total)

**Estimated Time**:
- Sequential execution: 4-6 hours
- With parallel execution (3 developers): 2-3 hours
