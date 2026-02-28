# Quickstart: Streamlined UX

**Feature**: 003-streamlined-ux  
**For**: End users of Distance Comparer  
**Status**: Post-implementation guide

## What's New

The Distance Comparer now starts ready to use—no setup required! The interface has been streamlined to focus on the core task: comparing distances between locations on dual side-by-side maps.

### Key Improvements

✅ **Auto-Active Tool**: No activation button needed—just start clicking  
✅ **Clear Instructions**: Header explains exactly how to use the tool  
✅ **Reset Button**: Easily start a new measurement without page reload  
✅ **Cleaner Interface**: Removed technical debug information

## Using Distance Comparer (3 Simple Steps)

### Step 1: Measure Distance

When you open Distance Comparer, the tool is **already active**. 

1. **Click two points** on the **left map** to create a distance line
2. The distance measurement appears automatically in the header

**Example**: Click Paris, then click Rome → See "Distance: 1105234m" in header

### Step 2: Compare Location

Once your distance line is created, the **right map** shows the same distance at a different location:

1. **Drag the endpoints** of the line on the right map to reposition it
2. **Rotate the line** by dragging from the middle to change its angle
3. Compare the distance to landmarks or routes in the new location

**Example**: You measured Paris-to-Rome (1105km). Now drag the line on the right map to compare that distance across your city or a planned trip route.

### Step 3: Start Over

When you're ready to measure a different distance:

1. **Click the Reset button** in the header (appears after creating a line)
2. Both distance lines disappear
3. Tool is immediately ready for two new clicks on the left map

**No page reload required**—compare as many distances as you want!

## Interface Overview

### Header Elements

```
┌─────────────────────────────────────────────────────────────┐
│ Distance Comparer                                           │
│ Compare locations with dual interactive maps               │
│                                                             │
│ How to use: Click two points on the left map to measure    │
│ distance. Drag and rotate the line on the right map to     │
│ compare it with other locations. Click Reset to start a    │
│ new measurement.                                            │
│                                                             │
│ [Distance: 1234567m]  [Reset]                              │
└─────────────────────────────────────────────────────────────┘
```

**Visible on load**:
- Title and subtitle
- Usage instructions (always visible)

**Appears after creating line**:
- Distance display (shows measurement in meters)
- Reset button (clears line and restarts)

### Maps Layout

**Desktop/Tablet (Horizontal)**:
```
┌────────────────┬────────────────┐
│   Left Map     │   Right Map    │
│ (Click to      │ (Drag/Rotate   │
│  measure)      │  to compare)   │
└────────────────┴────────────────┘
```

**Mobile (Vertical)**:
```
┌────────────────┐
│   Left Map     │
│ (Click to      │
│  measure)      │
├────────────────┤
│   Right Map    │
│ (Drag/Rotate   │
│  to compare)   │
└────────────────┘
```

## Keyboard Navigation

For users who prefer keyboard navigation:

1. **Tab**: Move focus to Reset button (when visible)
2. **Enter** or **Space**: Activate reset when focused
3. **Tab**: Continue to map interactions

Maps support standard panning and zooming via mouse/touch.

## Tips & Tricks

### Accurate Measurements

- **Zoom in** before clicking points for higher precision
- Click directly on landmarks (buildings, intersections) for exact measurements
- The distance shown is "as the crow flies" (straight line), not road distance

### Efficient Comparisons

- Use Reset frequently to compare multiple distance pairs quickly
- The right map remembers your zoom level and pan position
- Drag the line by its **endpoints** to move, **center** to rotate

### Mobile Usage

- Use two fingers to pinch-zoom maps
- Single tap to place distance points
- Long press and drag to move line endpoints on right map

## Troubleshooting

### "I can't see the usage instructions"

**Solution**: Instructions are permanently visible in the header. If you see technical debug information instead (like "Current layout" or event logs), the feature may not be fully deployed yet.

### "The Reset button disappeared"

**Cause**: Reset button only appears when a distance line exists.  
**Solution**: Create a line by clicking two points on the left map—Reset will appear.

### "I accidentally created a line"

**Solution**: Click the Reset button to clear it and start over. No need to reload the page.

### "The tool isn't auto-activating"

**Cause**: This feature requires the 003-streamlined-ux update.  
**Check**: If you see an "Activate Distance Tool" button, the old interface is still active. Try clearing cache or verifying deployment.

## Differences from Previous Version

| Old Behavior | New Behavior |
|--------------|--------------|
| Click "Activate Distance Tool" button first | Tool is active immediately on page load |
| Event log shows technical messages | Instructions show how to use the tool |
| Layout indicator visible | Clean interface, no debug info |
| Reload page to start over | Click Reset button to clear and restart |
| Unclear what to do first | Instructions guide you step-by-step |

## Feedback

If you have suggestions for improving the Distance Comparer interface, please share your feedback through the project's issue tracker or contact form.

---

**Related Documentation**:
- [Feature Specification](spec.md) - Detailed requirements and user stories
- [Implementation Plan](plan.md) - Technical implementation details
- [UX Contract](contracts/App-UX.contract.md) - Interface behavior specifications
