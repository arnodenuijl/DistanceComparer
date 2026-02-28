# Research: Remove Keyboard Accessibility

**Status**: ✅ **GATE UNBLOCKED** (Updated: Constitution amended to v2.0.0)  
**Date**: February 28, 2026  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

## Gate Block Resolution

This feature was initially **BLOCKED** by Constitution Principle IV (Responsive & Accessible) which mandated WCAG 2.1 Level AA compliance.

**RESOLUTION APPLIED**: Constitution has been amended from v1.1.0 to v2.0.0, making accessibility features OPTIONAL rather than MANDATORY. This feature can now proceed to implementation.

## Constitutional Amendment Summary

**Version**: 1.1.0 → 2.0.0 (MAJOR breaking change)  
**Date**: February 28, 2026  
**Amendment**: Principle IV renamed to "Responsive & Device Support"  

**Removed Requirements** (now optional):
- WCAG 2.1 Level AA compliance
- Keyboard navigation
- ARIA labels and semantic HTML for accessibility
- Screen reader announcements
- Focus indicators

**Retained Requirements** (still mandatory):
- Responsive layout (mobile/desktop adaptation)
- Touch gesture support
- Mouse interaction support

**New Guidance**: Accessibility features are now evaluated per-feature based on target audience, maintenance cost, and stakeholder priorities.

## Research Findings

### Technology Decisions

**No new technologies required** - This is a removal feature that simplifies the existing codebase.

**Affected Technologies**:
- Vue 3.5 composables (remove useMapKeyboard.ts)
- Leaflet 1.9.4 (remove keyboard event handlers)
- TypeScript 5.9 (remove keyboard-related types and interfaces)
- CSS (remove focus indicator styles)

### Implementation Approach

**Strategy**: Surgical removal of keyboard and accessibility features while preserving all mouse/touch functionality.

**Removal Categories**:
1. **Composable Deletion**: Delete `src/composables/useMapKeyboard.ts` entirely
2. **Event Handler Removal**: Remove keyboard event listeners from components
3. **Attribute Removal**: Remove ARIA attributes (aria-label, aria-live, role) from Vue templates
4. **State Removal**: Remove focus tracking and keyboard state management
5. **Style Removal**: Remove CSS for focus indicators, keyboard-specific styling
6. **Config Removal**: Remove keyboard-related constants from configuration

### Best Practices

**For Accessibility Removal**:
- Document the change clearly in README and user-facing documentation
- Preserve all existing mouse and touch functionality
- Test thoroughly to ensure no unintended side effects
- Consider creating a migration note for users relying on keyboard accesspability

**Code Cleanup**:
- Remove unused imports after deleting useMapKeyboard
- Remove unused type definitions related to keyboard
- Clean up config constants that are no longer referenced
- Ensure TypeScript compilation passes after removals

### Impact Analysis

**Bundle Size**: Expected reduction of ~5-8KB (removal of useMapKeyboard composable, event handlers, ARIA text)

**Performance**: Slight improvement from fewer event listeners and reduced DOM attribute overhead

**Maintenance**: Reduced complexity in event handling and state management

**Breaking Changes**:
- Users relying on keyboard navigation will lose functionality
- Screen reader users will lose announcements
- No migration path for keyboard-only users

### Alternative Approaches Considered

**Alternative 1: Keep Keyboard, Remove Screen Reader Only**
- Rejected: User requested complete keyboard accessibility removal
- Would reduce impact but not meet stated requirements

**Alternative 2: Make Keyboard Optional Via Feature Flag**
- Rejected: Adds complexity; easier to completely remove
- Constitution now allows omitting accessibility entirely

**Alternative 3: Graceful Degradation**
- Rejected: Keyboard features either work or don't; no middle ground
- Removal is cleaner than disabled statebehavior

---

**Phase 0 Research Status**: ✅ **COMPLETE**  
**Constitutional Gate**: ✅ **RESOLVED** (Constitution v2.0.0)  
**Next Step**: Proceed with `/speckit.tasks` to generate implementation task list
