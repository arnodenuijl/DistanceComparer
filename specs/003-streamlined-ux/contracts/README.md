# Contracts: Streamlined UX Improvements

**Feature**: 003-streamlined-ux

## Overview

This directory contains interface contracts for the streamlined UX feature. Since this is a pure UI/UX improvement with no external APIs or component interfaces, contracts focus on user-facing behavior and visual structure.

## Contract Documents

### [App-UX.contract.md](App-UX.contract.md)

**Type**: User Interface Contract  
**Scope**: App.vue presentation layer

Defines the required user-facing behavior including:
- Header visual structure (instructions, distance display, reset button)
- Auto-activation requirements
- Reset flow behavior
- Accessibility requirements (WCAG 2.1 AA)
- Responsive behavior contracts

**Audience**: 
- Developers implementing UI changes
- QA/testers validating UX requirements
- Designers ensuring visual consistency

## Contract Types in This Feature

### User Interface Contracts

Since this feature modifies only the presentation layer, there are no:
- ❌ API endpoints (no backend)
- ❌ Component prop interfaces (using existing components)
- ❌ Event schemas (using existing events)
- ❌ Data persistence contracts (ephemeral state only)

The sole contract is the user-facing interface behavior defined in App-UX.contract.md.

## Validation

UI contracts are validated through:
1. **Manual testing**: Checklist in App-UX.contract.md
2. **Visual inspection**: Compare against contract specifications
3. **Accessibility testing**: Keyboard navigation, screen reader announcements
4. **Responsive testing**: Desktop, tablet, mobile viewports

Optional automated validation using Playwright/Cypress assertions provided in contract document.

## Version Control

Contracts follow semantic versioning:
- **MAJOR**: Breaking changes to user interface (e.g., removing functionality)
- **MINOR**: New UI elements or behaviors (e.g., adding reset button)
- **PATCH**: Clarifications or corrections to existing contract text

Current version: **1.0.0** (Initial contract for feature 003)
