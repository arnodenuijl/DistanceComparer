# Quick Start: Remove Keyboard Accessibility

**Status**: ✅ **GATE UNBLOCKED** (Constitution v2.0.0)  
**Date**: February 28, 2026  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md) | [research.md](research.md)

## Implementation Overview

**Goal**: Remove all keyboard accessibility features while preserving mouse/touch functionality

**Affected Files**: 9 files
- 1 complete deletion: `src/composables/useMapKeyboard.ts`
- 8 modifications: Remove keyboard handlers, ARIA attributes, focus state, and related CSS

**Estimated Effort**: 4-6 hours

## Quick Reference

### Step-by-Step Implementation

1. **Delete Keyboard Composable**
   ```bash
   rm src/composables/useMapKeyboard.ts
   ```

2. **Remove Imports** (MapPanel.vue)
   - Remove `import { useMapKeyboard } from '../composables/useMapKeyboard'`
   - Remove all `useMapKeyboard()` calls and destructured return values

3. **Remove Template Attributes** (All Vue components)
   - Remove `tabindex` attributes
   - Remove `role` attributes
   - Remove `aria-label` attributes
   - Remove `aria-live` regions
   - Remove `aria-atomic` attributes

4. **Remove CSS** (main.css, component styles)
   - Remove `:focus` styles for map-panel
   - Remove focus indicator styles (blue borders)
   - Remove focus-visible styles

5. **Remove Config Constants** (map.config.ts)
   - Remove `KEYBOARD_PAN_STEP`
   - Remove `KEYBOARD_ZOOM_STEP`

6. **Remove Event Handlers** (useLineRotation.ts, useMapEvents.ts)
   - Remove keyboard event listeners in useLineRotation
   - Remove focus/blur event handlers in useMapEvents

7. **Remove Methods** (useMapNavigation.ts)
   - Remove or comment out `panByOffset` method (only used by keyboard)

8. **Update Documentation** (README.md)
   - Remove "Keyboard Accessible" feature bullet
   - Remove "Keyboard Navigation" section
   - Remove keyboard shortcuts from Distance Line Tool docs
   - Remove keyboard-related accessibility claims
   - Update "Accessibility" section to remove keyboard references

### Dependencies

- None (removal feature)

### Testing Checklist

- [ ] Application builds without TypeScript errors
- [ ] Mouse click and drag works on both maps
- [ ] Mouse scroll wheel zoom works
- [ ] Touch gestures work on mobile (if testable)
- [ ] Distance line creation works with mouse clicks
- [ ] Distance line endpoint dragging works
- [ ] Pressing Tab key does nothing
- [ ] Pressing arrow keys does nothing
- [ ] Pressing +/- keys does nothing
- [ ] No ARIA attributes in rendered DOM
- [ ] No console errors or warnings

### Risks

- **Breaking Change**: Keyboard-only users lose all functionality
- **Accessibility**: Violates WCAG 2.1 Level AA (intentional per Constitution v2.0.0)
- **Documentation**: Must update README to reflect reduced functionality

---

**Phase 1 Status**: ✅ **COMPLETE**  
**Ready for**: Task breakdown via `/speckit.tasks`
