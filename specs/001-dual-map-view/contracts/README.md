# Component Contracts: Dual Map View

**Feature**: Dual Map View  
**Date**: 2026-02-28  
**Purpose**: Define public interfaces for all UI components

---

## Overview

This directory contains the contract specifications for all components in the dual map view feature. Contracts define the public API that components expose to their consumers, including props, events, slots, and exposed methods.

**Contract Philosophy**:
- Contracts are consumer-facing specifications (what users of the component see)
- Implementation details are deliberately omitted
- Type signatures are language-agnostic but map to TypeScript
- Changes to contracts are breaking changes requiring version bumps

---

## Component Index

| Component | Purpose | Contract File |
|-----------|---------|--------------|
| MapPanel | Single interactive map instance | [MapPanel.contract.md](MapPanel.contract.md) |
| MapContainer | Layout wrapper for dual maps | [MapContainer.contract.md](MapContainer.contract.md) |

---

## Contract Format

Each contract file follows this structure:

1. **Component Overview**: Purpose and usage context
2. **Props**: Input properties with types and defaults
3. **Events**: Emitted events with payload specifications
4. **Slots**: Extension points with slot prop specifications  
5. **Exposed Methods**: Imperative API via template refs
6. **Accessibility**: ARIA attributes and keyboard interactions
7. **Examples**: Usage examples (code sketches, not implementation)

---

## Type Notation

Contracts use TypeScript-inspired notation but remain language-agnostic:

```
PropertyName: Type = DefaultValue
```

**Common Types**:
- `string`, `number`, `boolean`: Primitives
- `string | null`: Union types
- `{ lat: number, lng: number }`: Object shapes
- `Array<T>`: Array types
- `'value1' | 'value2'`: Literal unions (enums)
- `(arg: Type) => ReturnType`: Function signatures

---

## Contract Versioning

Contracts follow semantic versioning:
- **MAJOR**: Breaking changes to props, events, or exposed methods
- **MINOR**: New optional props, events, or methods
- **PATCH**: Documentation clarifications (no behavior change)

Current version: **1.0.0** (initial specification)

---

## Contract Stability Guarantees

- **Props**: Adding required props is a MAJOR version change
- **Events**: Changing event payload shape is a MAJOR version change
- **Exposed Methods**: Changing method signatures is a MAJOR version change
- **Slots**: Changing slot prop shapes is a MAJOR version change
- **Internal Implementation**: Can change freely without version impact

---

## Testing Contracts

All contracts must be verified with integration tests:

1. **Prop defaults**: Test that omitted props use documented defaults
2. **Prop validation**: Test that invalid values trigger errors
3. **Event emissions**: Test that events fire with correct payloads
4. **Slot rendering**: Test that slots render with correct props
5. **Exposed methods**: Test that methods behave as documented
6. **Accessibility**: Test ARIA attributes and keyboard navigation

---

## Next Steps

- Review individual component contracts in this directory
- Implement components adhering to their contracts
- Write integration tests validating contract compliance
