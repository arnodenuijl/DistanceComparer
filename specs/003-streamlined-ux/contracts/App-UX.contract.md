# Contract: App.vue UX Interface

**Feature**: 003-streamlined-ux  
**Component**: App.vue  
**Type**: User Interface Contract  
**Created**: February 28, 2026

## Purpose

Defines the user-facing behavior and visual structure of the streamlined Distance Comparer interface. This contract ensures consistent UX across implementation changes.

## Header Interface Contract

### Visual Structure

**Required Elements** (in order):
1. **Title**: "Distance Comparer" (h1)
2. **Subtitle**: "Compare locations with dual interactive maps" (p)
3. **Usage Instructions**: 3-line explanation of how to use the tool (p)
4. **Distance Display** (conditional): Shows current measurement when line exists
5. **Reset Button** (conditional): Available when distance line exists

**Removed Elements** (must not be visible):
- Layout indicator ("Current layout: horizontal")
- Event log (debug messages showing map interactions)

### Usage Instructions Text

**Content**:
```
How to use: Click two points on the left map to measure distance. 
Drag and rotate the line on the right map to compare it with other locations. 
Click Reset to start a new measurement.
```

**Formatting**:
- Font size: 13-14px (between subtitle and body text)
- Color: White with 0.85-0.95 opacity (visible but less prominent than title)
- Line height: 1.4-1.6 (comfortable reading)

**Constraints**:
- Must be visible on page load (not hidden behind toggle)
- Must remain visible throughout usage (not replaced by debug info)
- Should wrap gracefully on mobile viewports

### Distance Display

**Behavior**:
- **Shown when**: `currentDistance` is non-empty
- **Hidden when**: No line exists (initial state, after reset)
- **Format**: "Distance: {value}m" (preserve existing format)
- **Style**: White badge/chip on gradient background (preserve existing style)

### Reset Button

**Behavior**:
- **Shown when**: `currentDistance` is non-empty (line exists)
- **Hidden when**: No line exists (initial state)
- **Label**: "Reset" or "Reset Distance Line" (clear, actionable)
- **Position**: Adjacent to distance display in header-controls flex container

**Interaction**:
- Click triggers immediate line removal and return to creation mode
- No confirmation dialog (allows rapid iteration)
- Keyboard accessible (Tab navigation + Enter/Space to activate)

**Visual States**:
- Default: Semi-transparent white background (matches distance-tool-button style)
- Hover: Slightly opaque white background
- Active/pressed: Full white background with subtle shadow
- Focus: Visible focus ring for keyboard users

## Behavioral Contract

### Auto-Activation

**Requirement**: Distance tool must be active and ready to accept clicks immediately on page load.

**Observable Behavior**:
1. User loads page
2. User can immediately click two points on left map (no activation button needed)
3. No "activate tool" step required

**Technical Definition**: 
- `showDistanceTool=true` on mount
- `isCreatingLine=true` on mount
- DistanceLine components rendered on both maps

### Reset Flow

**Requirement**: User can clear distance line and start new measurement without page reload.

**Observable Behavior**:
1. User clicks reset button
2. Distance lines disappear from both maps
3. Distance display disappears from header
4. Reset button disappears from header
5. Tool returns to creation mode (ready for two new clicks)
6. Total interaction time: <500ms (perceived instant)

**Edge Cases**:
- Clicking reset during line creation (after 1 click): Clears partial line state
- Clicking reset when no line exists: Button should not be present
- Rapid reset clicks: Only first click processes (debounced or disabled during transition)

### Clean Interface

**Requirement**: No debugging or technical information visible to end users.

**Observable Behavior**:
- No "Current layout: horizontal" text visible
- No event log showing "left-map: Center → 12.3456, -45.6789"
- No technical status messages in UI
- Console logging may continue (for developer debugging)

**Verification**:
- Visual inspection: Only title, subtitle, instructions, distance, and maps visible
- DOM inspection: No elements with classes "layout-indicator" or "event-log" in document

## Accessibility Requirements (WCAG 2.1 Level AA)

### Keyboard Navigation

**Tab Order**:
1. Reset button (when visible)
2. Left map container
3. Right map container

**Keyboard Actions**:
- `Tab`: Move focus to reset button
- `Enter` or `Space`: Activate reset (when focused)
- `Shift+Tab`: Reverse navigation

### Screen Reader Support

**Announcements**:
- On page load: "Distance tool ready. Click two points on the map to measure."
- On line created: "Distance measured: {value} meters."
- On reset: "Distance line cleared. Tool ready for new measurement."

**Implementation**:
- Use `aria-live="polite"` region for status updates
- Reset button has clear label (not icon-only)
- Usage instructions in semantic `<p>` or `<section>` element

### Color Contrast

**Requirements**:
- White text on gradient background: Must maintain 4.5:1 contrast ratio (existing)
- Reset button: Must meet contrast requirements in all states
- Distance display: White on gradient badge meets contrast

## Responsive Behavior

### Desktop (>768px)

- Header elements flow horizontally
- Instructions on single line or max 2 lines
- Distance display and reset button side-by-side

### Tablet/Mobile (<768px)

- Header elements may stack vertically
- Instructions wrap to 2-3 lines
- Distance display and reset button remain on same line if width permits
- Maps stack vertically (existing behavior)

## Visual Regression Prevention

**Must Preserve**:
- Gradient header background (existing purple gradient)
- Map container layout and sizing
- Distance display badge styling
- Existing responsive breakpoints

**May Change**:
- Header content arrangement (instructions replace event-log)
- Button placement (reset added to header-controls)

## Contract Validation

### Manual Testing Checklist

- [ ] Page loads with instructions visible and tool auto-activated
- [ ] Two clicks on left map creates distance line
- [ ] Distance display appears in header with measurement
- [ ] Reset button appears in header when line exists
- [ ] Clicking reset removes line and hides distance/reset
- [ ] Reset button is keyboard accessible (Tab, Enter)
- [ ] No layout-indicator visible
- [ ] No event-log visible
- [ ] Instructions remain visible throughout usage
- [ ] Mobile viewport: elements stack appropriately

### Automated Validation (Optional)

```typescript
// Contract assertions (e.g., Playwright/Cypress)
await expect(page.locator('.event-log')).not.toBeVisible()
await expect(page.locator('.layout-indicator')).not.toBeVisible()
await expect(page.locator('.usage-instructions')).toBeVisible()
await expect(page.locator('.distance-display')).not.toBeVisible() // initial
// After line creation:
await expect(page.locator('.reset-button')).toBeVisible()
```

## Version History

- **1.0.0** (2026-02-28): Initial contract for streamlined UX feature
