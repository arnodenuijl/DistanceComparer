<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version change: N/A (template) → 1.0.0
Bump rationale: Initial constitution adoption from template

Modified principles: N/A (initial adoption)
Added sections:
  - 7 Core Principles (I-VII)
  - Technology Stack section
  - Development Workflow section
  - Governance rules

Removed sections: None

Templates requiring updates:
  ✅ plan-template.md - No changes required (generic Constitution Check placeholder)
  ✅ spec-template.md - No changes required (compatible with flexible testing)
  ✅ tasks-template.md - No changes required (tests marked as optional aligns with Principle VI)

Follow-up TODOs: None
================================================================================
-->

# DistanceComparer Constitution

## Core Principles

### I. User-First Design

The application MUST prioritize user experience in distance comparison workflows.

- Every feature MUST clearly serve the primary use case: comparing distances in two side-by-side maps
- UI interactions MUST be intuitive and require minimal clicks to accomplish core tasks
- Visual feedback MUST be immediate when users interact with maps or distance markers
- Error states MUST be communicated clearly with actionable guidance

**Rationale**: The application's value proposition centers on making distance comparison effortless. Poor UX undermines this core purpose.

### II. Component Architecture

All UI elements MUST be built as modular, reusable components.

- Components MUST have a single responsibility
- Components MUST accept configuration via props/parameters, not global state
- Shared components MUST be placed in a dedicated `components/` directory
- Page-specific components SHOULD be co-located with their parent page

**Rationale**: Side-by-side maps share significant functionality. Component reuse reduces bugs and ensures consistent behavior between panels.

### III. Type Safety

TypeScript strict mode MUST be enabled and enforced across the codebase.

- All function parameters and return types MUST be explicitly typed
- `any` type is PROHIBITED except when interfacing with untyped third-party libraries (must be documented)
- API responses MUST have corresponding TypeScript interfaces
- Map coordinates and distance values MUST use branded types to prevent unit confusion

**Rationale**: Maps involve complex coordinate systems. Type safety prevents subtle bugs like mixing latitude/longitude or distance units.

### IV. Responsive & Accessible

The application MUST work across devices and meet accessibility standards.

- Side-by-side layout MUST gracefully adapt to mobile (stacked view) and desktop (horizontal split)
- All interactive elements MUST be keyboard navigable
- Map components MUST provide screen reader announcements for distance changes
- Color MUST NOT be the only means of conveying information; use labels and patterns

**Rationale**: Distance comparison is useful in many contexts—planning trips on mobile, presenting to others on desktop. Accessibility ensures all users can benefit.

### V. Performance

Map rendering and distance calculations MUST be optimized for perceived speed.

- Initial map load MUST complete within 3 seconds on standard connections
- Distance recalculations MUST feel instantaneous (<100ms perceived delay)
- Map tiles MUST be lazy-loaded and cached appropriately
- Heavy computations MUST not block the main thread

**Rationale**: Maps are resource-intensive. Users will abandon the application if interactions feel sluggish.

### VI. Testing Flexibility

Tests are encouraged but not mandated via strict TDD.

- Critical paths (distance calculation, coordinate handling) SHOULD have unit tests
- Integration tests SHOULD cover end-to-end distance comparison workflows
- Tests MUST be written before fixing reported bugs (regression prevention)
- Test coverage goals are advisory, not blocking for PRs

**Rationale**: The project benefits from pragmatic testing that covers high-risk areas without ceremony that slows iteration.

### VII. Simplicity

Start simple and expand only when requirements demand.

- YAGNI (You Aren't Gonna Need It): Do not build features speculatively
- Prefer standard library solutions over additional dependencies
- New dependencies MUST be justified with clear rationale
- Over-engineering MUST be flagged in code review

**Rationale**: Web applications easily accumulate complexity. Disciplined simplicity keeps the codebase maintainable.

## Technology Stack

- **Language**: TypeScript 5.x with strict mode enabled
- **Runtime**: Node.js 20 LTS or later
- **Framework**: To be determined based on feature requirements (React, Vue, or Svelte recommended)
- **Map Provider**: To be determined (Leaflet, Mapbox GL, or Google Maps)
- **Build Tool**: Vite or similar modern bundler
- **Package Manager**: npm or pnpm

All dependency additions MUST be reviewed against Principle VII (Simplicity).

## Development Workflow

- **Branching**: Feature branches off `main`, named `[issue-number]-brief-description`
- **Pull Requests**: All changes MUST go through PR review before merging
- **Code Review**: At least one approval required; reviewer MUST verify constitution compliance
- **Commits**: Use conventional commit format (`feat:`, `fix:`, `docs:`, `refactor:`)
- **CI**: Linting and type checking MUST pass before merge; tests run if present

## Governance

This constitution supersedes all other project practices. Amendments require:

1. Written proposal documenting the change and rationale
2. Review of impact on existing code and workflows
3. Version increment following semantic versioning:
   - **MAJOR**: Principle removal or incompatible redefinition
   - **MINOR**: New principle or significant expansion
   - **PATCH**: Clarification or wording refinement

All code reviews MUST verify compliance with these principles. Deviations MUST be documented and justified in the PR description.

**Version**: 1.0.0 | **Ratified**: 2026-02-28 | **Last Amended**: 2026-02-28
