# Data Model: Streamlined UX Improvements

**Feature**: 003-streamlined-ux  
**Created**: February 28, 2026

## Overview

This feature modifies UI state management in App.vue. No backend entities or persistence. All state is ephemeral client-side reactive references.

## Entities

### Distance Tool State

**Type**: Reactive UI State (Vue ref)  
**Purpose**: Track the lifecycle of distance line creation and display

**Fields**:
- `showDistanceTool: boolean` - Whether distance tool UI is mounted
  - **Default**: `true` (changed from `false` - auto-activation)
  - **Transitions**: Always `true` in P1, toggles during reset for remount
- `isCreatingLine: boolean` - Whether user is in line creation mode (awaiting clicks)
  - **Default**: `true` (changed - ready immediately)
  - **Transitions**: `true` → `false` after second point clicked → `true` on reset
- `currentDistance: string` - Formatted distance display (e.g., "1234.56m")
  - **Default**: `''` (empty until line created)
  - **Transitions**: `''` → `"[value]m"` on line creation → `''` on reset

**State Diagram**:
```
[Page Load]
    ↓
[Ready: showDistanceTool=true, isCreatingLine=true, currentDistance='']
    ↓ (user clicks 2 points)
[Line Active: showDistanceTool=true, isCreatingLine=false, currentDistance='1234m']
    ↓ (user clicks reset)
[Resetting: showDistanceTool toggles false→true]
    ↓
[Ready: isCreatingLine=true, currentDistance='']
```

### Usage Instructions

**Type**: Static Content (Template String)  
**Purpose**: Guide first-time users on how to use the tool

**Content** (proposed):
```
How to use: Click two points on the left map to measure distance. 
Drag and rotate the line on the right map to compare it with other locations. 
Click Reset to start a new measurement.
```

**Constraints**:
- Maximum 3 lines for header space
- Must be comprehensible without prior map experience
- Should mention all three core actions: create, compare, reset

**Validation Rules**: None (static text)

### Component Communication

**Type**: Parent-Child Relationship (Vue template refs)

**Relationships**:
- `App.vue` (parent) → `DistanceLine` (left/right children)
  - **Direction**: Bidirectional
  - **Left child**: Emits events (`@line-created`, `@distance-changed`) to parent
  - **Right child**: Receives imperative method calls (`updateDistance()`, potential `clearLine()`)
  - **Reset flow**: Parent controls lifecycle by toggling `showDistanceTool`

## Validation Rules

### State Consistency Rules

1. **Tool Visibility**: `showDistanceTool` must be `true` before `isCreatingLine` can be `true`
   - Enforcement: Conditional rendering (`v-if="showDistanceTool"`)

2. **Distance Display**: `currentDistance` must be empty string when `isCreatingLine=true`
   - Enforcement: Reset handler clears both simultaneously

3. **Creation Mode**: `isCreatingLine` must transition `true→false` exactly once per line
   - Enforcement: DistanceLine component emits `@line-created` only after second click

### Reset Preconditions

- Reset button should be **disabled** or **hidden** when `currentDistance === ''`
  - Rationale: Nothing to reset if no line exists
  - Implementation: `v-if="currentDistance"` or `:disabled="!currentDistance"`

## State Transitions

### Initialization (Page Load)
```typescript
showDistanceTool.value = true      // Changed: was false
isCreatingLine.value = true        // Changed: was false
currentDistance.value = ''         // Unchanged
```

### Line Creation Complete
```typescript
// Triggered by handleLineCreated(event)
isCreatingLine.value = false
currentDistance.value = event.distanceDisplay
// Sync to right map via rightDistanceLine.value.updateDistance()
```

### Reset Action
```typescript
// Triggered by reset button click
isCreatingLine.value = true
currentDistance.value = ''
showDistanceTool.value = false
await nextTick()
showDistanceTool.value = true
// Component remount clears line visuals
```

## Edge Cases

### Rapid Reset Clicks
**Scenario**: User clicks reset multiple times quickly  
**Handling**: Button should be disabled during toggle (while `showDistanceTool` is temporarily false)  
**Implementation**: Add `isResetting: boolean` ref if debouncing needed

### Mid-Creation Reset
**Scenario**: User clicks reset after first point but before second  
**Handling**: Reset clears partial state (one point) via component remount  
**Data Impact**: `isCreatingLine` returns to `true`, partial line removed from map

### Page Refresh
**Scenario**: User refreshes browser after creating line  
**Handling**: All state lost (no persistence), returns to initial Ready state  
**Data Impact**: No data persisted, behavior matches current implementation

## Migration Notes

**Breaking Changes**: None - all existing state structures preserved

**Changed Defaults**:
- `showDistanceTool`: `false` → `true`
- `isCreatingLine`: `false` → `true` (on initialization)

**New State**: None (all refs already exist)

**Removed State**: 
- `lastEvent` ref: Still exists but no longer displayed in UI (kept for console logging if needed)

## Performance Implications

**State Size**: ~48 bytes total (3 small refs)  
**Update Frequency**: 
- `isCreatingLine`: 2 updates per distance measurement
- `currentDistance`: 1-N updates (1 on creation, +N on drag if watching)
- `showDistanceTool`: 2 updates per reset (toggle)

**Memory Impact**: Negligible (state was already present, just initialization changed)
