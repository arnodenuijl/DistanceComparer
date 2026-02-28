# Research: Streamlined UX Improvements

**Feature**: 003-streamlined-ux  
**Created**: February 28, 2026  
**Status**: Complete - No new technology decisions required

## Overview

This feature implements UX improvements to existing functionality. All required patterns and technologies are already present in the codebase. No external research or new dependencies needed.

## Technology Decisions

### Decision: Use Existing Vue 3 Composition API Patterns
**Rationale**: App.vue already uses `ref()` for reactive state management. Changes require only:
- Initializing existing refs with different default values
- Modifying template conditional rendering
- Adding a reset method that resets existing state

**Alternatives Considered**: None - this is the idiomatic Vue 3 approach already in use.

**Implementation Notes**:
- `showDistanceTool` ref: Change default from `false` to `true`
- `isCreatingLine` ref: Initialize to `true` on mount
- Add `resetDistanceLine()` method to clear state and reinitialize

### Decision: Static Usage Instructions (No i18n)
**Rationale**: Application does not currently support internationalization. Adding i18n for UX text would violate Principle VII (Simplicity/YAGNI).

**Alternatives Considered**: 
- Vue i18n plugin: Rejected - over-engineering for a single set of instructions
- External config file: Rejected - adds indirection without benefit

**Implementation Notes**: Hardcode 2-3 line instruction text in App.vue template.

### Decision: Imperative Reset via Component Ref
**Rationale**: Parent (App.vue) needs to clear child (DistanceLine) state. Vue's template refs already established for right map sync.

**Alternatives Considered**:
- Event bus: Rejected - overkill for parent-child communication
- Provide/inject: Rejected - adds unnecessary indirection
- Prop-based reset trigger: Considered but ref method more explicit

**Implementation Notes**: 
- Call `rightDistanceLine.value.clearLine()` in reset handler
- May need to add `clearLine()` method to DistanceLine.vue if not present
- Left map line clears by toggling `showDistanceTool` (re-mount)

### Decision: Remove Elements via v-if (Not CSS)
**Rationale**: Debug elements (event-log, layout-indicator) should be completely removed from DOM, not just hidden. This reduces memory/processing overhead.

**Alternatives Considered**:
- CSS `display: none`: Rejected - leaves elements in DOM unnecessarily
- Feature flag: Rejected - debugging can use browser console

**Implementation Notes**: Delete template blocks for layout-indicator and event-log.

## Best Practices Applied

### Vue 3 Lifecycle
- **Pattern**: Use existing `ref()` initialization pattern
- **Source**: Already demonstrated in App.vue lines 59-61
- **Application**: Initialize `showDistanceTool` and `isCreatingLine` to `true` in setup

### Accessibility (Principle IV)
- **Pattern**: Semantic HTML for instructions
- **Guidance**: WCAG 2.1 Level AA (existing project standard)
- **Application**: 
  - Use `<p>` or `<div role="region" aria-label="Instructions">` for usage text
  - Reset button needs clear label: "Reset Distance Line" (not icon-only)
  - Ensure button has proper `type="button"` to prevent form submission

### Vue Component Communication
- **Pattern**: Template refs for imperative child methods
- **Source**: Already used in App.vue line 61 (`rightDistanceLine`)
- **Application**: Reuse existing ref pattern, add call to reset method

## Integration Patterns

### Existing Event Flow (Unchanged)
```
User clicks map
  ↓
MapPanel emits @line-created
  ↓
App.vue handleLineCreated
  ↓
rightDistanceLine.value.updateDistance()
```

### New Reset Flow
```
User clicks reset button
  ↓
App.vue resetDistanceLine()
  ↓
1. Set isCreatingLine = true
2. Clear currentDistance = ''
3. Toggle showDistanceTool (false then true) to remount components
  ↓
DistanceLine components re-initialize
```

## Unknowns Resolution

All items from Technical Context marked "NEEDS CLARIFICATION" have been resolved:

1. ✅ **Language/Version**: TypeScript 5.9.3 (confirmed from package.json)
2. ✅ **Framework**: Vue 3.5.25 with Composition API (confirmed)
3. ✅ **Testing**: None required per Principle VI
4. ✅ **Reset UX**: Button in header (preferred over keyboard shortcut for discoverability)
5. ✅ **Instructions Placement**: Replace event-log area in header
6. ✅ **Instructions Content**: "Click two points on the left map to measure distance. Drag and rotate on the right map to compare. Click Reset to start over."

## Dependencies

**New Dependencies**: None

**Existing Dependencies** (unchanged):
- Vue 3.5.25
- Leaflet 1.9.4
- TypeScript 5.9.3

## Performance Considerations

**Impact Analysis**:
- Removing event-log updates: Eliminates 3-5 DOM updates per user interaction → Slight performance improvement
- Auto-activation: Moves initialization from click handler to mount → No measurable difference
- Reset functionality: Minimal (<1ms) state reset operations

**No performance concerns identified.**

## Security/Privacy

**Impact**: None - client-side UI changes only, no data persistence or external communication.

## Conclusion

All technical questions resolved. Feature ready for Phase 1 (Design Artifacts).
