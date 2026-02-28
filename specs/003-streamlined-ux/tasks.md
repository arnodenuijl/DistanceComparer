# Tasks: Streamlined UX Improvements

**Feature Branch**: `003-streamlined-ux`  
**Input**: Design documents from `specs/003-streamlined-ux/`  
**Prerequisites**: ✅ plan.md, spec.md, research.md, data-model.md, contracts/App-UX.contract.md

**Tests**: No tests required per Principle VI (Testing Flexibility) and project constitution

**Organization**: Tasks grouped by user story (P1, P2, P3) for independent implementation and validation

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This project uses: `distance-comparer/src/` (single Vue SPA at repository root)

---

## Phase 1: Setup

**Status**: ✅ **COMPLETE** - Project already initialized with Vue 3 + TypeScript

No setup tasks required. Existing structure:
- `distance-comparer/src/App.vue` - Primary modification target
- `distance-comparer/src/components/` - Existing components (no changes)
- Vue 3.5.25 + TypeScript 5.9.3 + Leaflet 1.9.4 already configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Status**: ✅ **COMPLETE** - No foundational work required

This is a pure UI refactor of existing functionality. All infrastructure (Vue components, Leaflet maps, state management) already exists.

**Checkpoint**: ✅ User story implementation can begin immediately

---

## Phase 3: User Story 1 - Immediate Tool Readiness with Instructions (Priority: P1) 🎯 MVP

**Goal**: Auto-activate distance tool on page load and display clear usage instructions in header so new users can start measuring within 30 seconds without configuration.

**Independent Test**: Load the application. Verify (1) instructions are visible in header, (2) no activation button visible, (3) clicking two points on left map immediately creates distance line without any prior button clicks.

### Implementation for User Story 1

- [ ] T001 [US1] Change `showDistanceTool` ref default from `false` to `true` in distance-comparer/src/App.vue (line ~59)
- [ ] T002 [US1] Change `isCreatingLine` ref default from `false` to `true` in distance-comparer/src/App.vue (line ~60)
- [ ] T003 [US1] Remove the "Activate Distance Tool" button from template in distance-comparer/src/App.vue (lines ~120-127)
- [ ] T004 [US1] Remove `toggleDistanceTool` method from script section in distance-comparer/src/App.vue (lines ~65-75)
- [ ] T005 [US1] Add usage instructions text below subtitle in distance-comparer/src/App.vue template (after line ~114)
- [ ] T006 [US1] Style usage instructions with appropriate CSS (.usage-instructions class) in distance-comparer/src/App.vue styles section
- [ ] T007 [US1] Add aria-label or role="region" to instructions for screen reader accessibility in distance-comparer/src/App.vue

**Checkpoint**: Tool auto-activates on load, instructions visible, users can immediately create distance lines. Test by loading app and clicking two points (no activation needed).

---

## Phase 4: User Story 2 - Reset Distance Lines (Priority: P2)

**Goal**: Provide reset functionality so users can clear current distance line and create new measurements without page reload, enabling rapid comparison workflows.

**Independent Test**: After US1 complete, create a distance line, then click reset button. Verify (1) button is visible when line exists, (2) clicking button removes both lines from maps, (3) distance display disappears, (4) reset button disappears, (5) tool is ready for new clicks.

### Implementation for User Story 2

- [ ] T008 [US2] Add `resetDistanceLine()` method to script section in distance-comparer/src/App.vue (clears state and toggles showDistanceTool for remount)
- [ ] T009 [US2] Add reset button in header-controls div with v-if="currentDistance" in distance-comparer/src/App.vue template (after line ~129)
- [ ] T010 [US2] Wire reset button to call resetDistanceLine() via @click handler in distance-comparer/src/App.vue
- [ ] T011 [US2] Style reset button to match header aesthetic (.reset-button class) in distance-comparer/src/App.vue styles section
- [ ] T012 [US2] Add keyboard accessibility attributes to reset button (tabindex, clear label) in distance-comparer/src/App.vue
- [ ] T013 [US2] Implement resetDistanceLine logic: set isCreatingLine=true, currentDistance='', toggle showDistanceTool false→true in distance-comparer/src/App.vue

**Checkpoint**: Reset button appears when line exists, clicking it removes line and returns to creation mode. Test by creating line, clicking reset, creating new line.

---

## Phase 5: User Story 3 - Clean Interface (Priority: P3)

**Goal**: Remove technical debug elements (layout-indicator, event-log) to create focused, professional interface that doesn't distract users with development information.

**Independent Test**: Load application. Verify (1) no "Current layout: horizontal" text visible anywhere, (2) no event log showing map interaction messages, (3) only title, subtitle, instructions, distance (when applicable), and reset (when applicable) visible in header.

### Implementation for User Story 3

- [ ] T014 [P] [US3] Remove event-log template block from header in distance-comparer/src/App.vue (line ~131)
- [ ] T015 [P] [US3] Remove .event-log CSS styles from styles section in distance-comparer/src/App.vue (lines ~301-309)
- [ ] T016 [P] [US3] Remove layout-indicator template block from MapContainer slot in distance-comparer/src/App.vue (lines ~192-197)
- [ ] T017 [P] [US3] Remove .layout-indicator and .hint CSS styles from styles section in distance-comparer/src/App.vue (lines ~323-337)
- [ ] T018 [US3] Update event handlers to only console.log (not update lastEvent ref) in distance-comparer/src/App.vue (lines ~29-56)
- [ ] T019 [US3] Consider removing or commenting out `lastEvent` ref if no longer needed in distance-comparer/src/App.vue (line ~28)

**Checkpoint**: Clean interface with only essential user-facing information. No debug elements visible. Test by visual inspection and DOM inspection.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and final quality checks

- [ ] T020 [P] Update README.md with new UX behavior (auto-activation, reset feature) in distance-comparer/README.md
- [ ] T021 [P] Validate all acceptance scenarios from spec.md against running application
- [ ] T022 [P] Test keyboard navigation (Tab to reset button, Enter/Space to activate) per contracts/App-UX.contract.md
- [ ] T023 [P] Test screen reader announcements for instructions and state changes per contracts/App-UX.contract.md
- [ ] T024 [P] Test responsive behavior on mobile viewport (instructions wrap, controls stack) per contracts/App-UX.contract.md
- [ ] T025 Run quickstart.md scenarios to validate end-user experience in specs/003-streamlined-ux/quickstart.md
- [ ] T026 Visual regression check: verify gradient header, map layouts, distance display styling unchanged

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ Already complete
- **Foundational (Phase 2)**: ✅ Already complete
- **User Story 1 (Phase 3)**: No dependencies - can start immediately
- **User Story 2 (Phase 4)**: Can start after US1 (needs auto-activated tool) OR in parallel (independent code sections)
- **User Story 3 (Phase 5)**: Can start in parallel with US1/US2 (different template sections)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: ✅ No dependencies - can start immediately
  - Changes: script refs initialization + remove button + add instructions
- **User Story 2 (P2)**: Recommended after US1 (but can be parallel)
  - Reason: Reset requires tool to be auto-activated for full testing
  - Can develop in parallel since it adds new button (doesn't conflict with US1)
- **User Story 3 (P3)**: ✅ Can run in parallel with US1/US2
  - Changes: Remove template blocks for debug elements
  - No conflicts with US1 or US2 changes

### Within Each User Story

**User Story 1**:
1. T001-T002: Change ref defaults (do together)
2. T003-T004: Remove activation button and method (do together)
3. T005-T007: Add instructions with styling and accessibility (sequential)

**User Story 2**:
1. T008: Add reset method (do first)
2. T009-T010: Add button and wire handler (do together)
3. T011-T012: Style and accessibility (can parallel after T009-T010)
4. T013: Implement reset logic (may already be done in T008)

**User Story 3**:
- T014-T019: All can run in parallel (different sections of file)

### Parallel Opportunities

**Maximum Parallelization** (if you have multiple people or work sessions):

```bash
# Session 1: User Story 1 + User Story 3 together
Branch 1: T001-T007 (US1: Auto-activation + instructions)
Branch 2: T014-T019 (US3: Remove debug UI) - parallel, different sections

# Session 2: User Story 2
Branch 3: T008-T013 (US2: Reset functionality)

# Session 3: Polish
Branch 4: T020-T026 (Documentation and validation)
```

**Recommended Sequential** (solo developer, safest):

1. Complete T001-T007 (US1) → Test independently
2. Complete T008-T013 (US2) → Test independently  
3. Complete T014-T019 (US3) → Test independently
4. Complete T020-T026 (Polish) → Final validation

---

## Parallel Example: User Story 3

```bash
# All US3 tasks can run in parallel (different parts of App.vue):
Task T014: Remove event-log template (line 131)
Task T015: Remove event-log CSS (lines 301-309)
Task T016: Remove layout-indicator template (lines 192-197)
Task T017: Remove layout-indicator CSS (lines 323-337)
Task T018: Update event handlers (lines 29-56)
Task T019: Clean up lastEvent ref (line 28)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Skip Setup (already done)
2. ✅ Skip Foundational (already done)
3. Complete Phase 3: User Story 1 (T001-T007)
4. **STOP and VALIDATE**: 
   - Load app → instructions visible
   - Click two points → line created without activation
   - Success Criteria SC-001: First line created within 30 seconds
5. **Demo/Deploy US1** if validated

This gives you an immediately usable improvement: users can start using the tool faster.

### Incremental Delivery

1. ✅ Foundation ready (already complete)
2. **Iteration 1**: User Story 1 (T001-T007)
   - Test: Auto-activation + instructions work
   - Value: New users can start immediately
   - Deploy: MVP ready!
3. **Iteration 2**: User Story 2 (T008-T013)
   - Test: Reset button adds/removes lines correctly
   - Value: Users can do multiple comparisons rapidly
   - Deploy: Enhanced workflow!
4. **Iteration 3**: User Story 3 (T014-T019)
   - Test: Debug elements removed, interface clean
   - Value: Professional appearance, better focus
   - Deploy: Polished experience!
5. **Iteration 4**: Polish (T020-T026)
   - Test: All contracts validated, docs updated
   - Value: Production-ready quality
   - Deploy: Complete feature!

### Parallel Team Strategy

With 2-3 developers working simultaneously:

1. ✅ Foundation complete (no team coordination needed)
2. **Sprint 1** (parallel):
   - **Developer A**: T001-T007 (US1: Auto-activation + instructions) in distance-comparer/src/App.vue
   - **Developer B**: T014-T019 (US3: Remove debug UI) in distance-comparer/src/App.vue - DIFFERENT SECTIONS
3. **Sprint 2** (after Sprint 1 merge):
   - **Developer A or B**: T008-T013 (US2: Reset functionality) in distance-comparer/src/App.vue
4. **Sprint 3** (parallel):
   - **Developer A**: T020-T023 (Docs + contract validation)
   - **Developer B**: T024-T026 (Testing + visual regression)

**Merge Strategy**: 
- US1 and US3 touch different parts of App.vue - can merge in either order or together
- US2 should merge after US1/US3 to avoid conflicts in header section

---

## Task Count Summary

- **Setup**: 0 tasks (already complete)
- **Foundational**: 0 tasks (already complete)
- **User Story 1**: 7 tasks (T001-T007)
- **User Story 2**: 6 tasks (T008-T013)
- **User Story 3**: 6 tasks (T014-T019)
- **Polish**: 7 tasks (T020-T026)
- **Total**: 26 tasks

**Estimated Effort**: 
- User Story 1: 1.5-2 hours (core MVP)
- User Story 2: 1-1.5 hours (reset functionality)
- User Story 3: 0.5-1 hour (cleanup)
- Polish: 1-2 hours (validation and docs)
- **Total**: 4-6.5 hours for complete feature

**Parallel Opportunities**: Up to 12 tasks can run in parallel (all of US3 + portions of US1/US2)

---

## Notes

- All tasks modify `distance-comparer/src/App.vue` (single file)
- No new components, APIs, or dependencies needed
- [P] tasks are in different sections of the file (can work simultaneously)
- Each user story is independently testable per specification
- Constitution Principle VII: This feature REDUCES complexity (removes UI elements)
- Verify against contracts/App-UX.contract.md acceptance criteria after each story
- Maintain WCAG 2.1 Level AA accessibility (aria-labels, keyboard navigation)
- Console logging preserved for developer debugging (only UI elements removed)
