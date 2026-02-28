# Contracts: Remove Keyboard Accessibility

**Status**: ✅ **GATE UNBLOCKED** (Constitution v2.0.0)  
**Date**: February 28, 2026  
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [research.md](../research.md)

## Contracts Not Applicable

This feature involves **removing** functionality (keyboard accessibility) rather than adding new public interfaces or contracts.

### Existing Public Interfaces (Impact Analysis)

1. **User Interface Contract**: Web application accessed via browser
   - **Impact**: **BREAKING CHANGE** - Narrows contract by removing keyboard input methods
   - **Before**: Supports mouse, touch, AND keyboard interaction
   - **After**: Supports mouse and touch ONLY
   - **Breaking For**: Users relying on keyboard navigation, screen reader users, keyboard-only users

2. **Browser API Contract**: Standard HTML5/CSS3/JavaScript
   - **Impact**: Simplifies by removing ARIA attributes and keyboard event listeners
   - **Compatibility**: Still valid HTML5 (removal doesn't break standards)
   - **Accessibility Tree**: Simplified (fewer accessible elements)

### No New Contracts

This feature does not introduce:
- New public APIs
- New component interfaces for external consumers
- New data formats or protocols
- New CLI commands or endpoints

### Broken User Contracts

The following **documented user contracts** will be broken:

#### 1. Keyboard Navigation Contract (from current README.md)

**Removed Capabilities**:
- ❌ Tab key to focus maps
- ❌ Arrow keys (↑↓←→) to pan maps
- ❌ +/- keys to zoom in/out
- ❌ Escape key to remove focus

**Impact**: Users who rely on keyboard navigation will be unable to use the application.

#### 2. Accessibility Contract (implied WCAG 2.1 Level AA)

**Removed Capabilities**:
- ❌ Keyboard navigable interactive elements
- ❌ Screen reader support (ARIA labels)
- ❌ Screen reader announcements (ARIA live regions)
- ❌ Focus indicators (visual cues)

**Impact**: Application will not meet WCAG 2.1 Level AA standards.

#### 3. Distance Line Keyboard Controls (from current README.md)

**Removed Capabilities**:
- ❌ Arrow Left/Right for 5° rotation
- ❌ Shift + Arrow Left/Right for 15° rotation
- ❌ Keyboard-based line positioning

**Impact**: Distance line rotation only possible via mouse drag.

### Migration Path

**None Available**: There is no migration path for users requiring keyboard accessibility. They must:
- Switch to mouse or touch input, OR
- Use alternative mapping applications with keyboard support

### Documentation Requirements

Per Constitution v2.0.0, when accessibility features are omitted, this MUST be:

1. **Documented in README**
   - Remove all keyboard navigation documentation
   - Remove accessibility claims
   - Add note that application requires mouse or touch input

2. **Justified in Specification**
   - ✅ Complete - See [spec.md](../spec.md) assumptions and requirements

3. **Reviewed During Code Review**
   - Reviewers must verify mouse/touch functionality preserved
   - Reviewers must confirm keyboard inputs have no effect

---

**Phase 1 Status**: ✅ **COMPLETE**  
**Breaking Changes**: Documented above  
**Ready for**: Task breakdown via `/speckit.tasks`
