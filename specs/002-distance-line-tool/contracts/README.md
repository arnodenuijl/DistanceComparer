# Component Contracts: Distance Line Tool

**Feature**: Distance Line Tool  
**Date**: February 28, 2026  
**Purpose**: Define stable interfaces for distance line components

---

## Contract Philosophy

Component contracts specify the **public API** of components - their props, events, slots, and exposed methods. Contracts establish versioned interfaces that:

1. **Decouple specification from implementation**: Contracts describe WHAT, not HOW
2. **Enable parallel development**: Frontend can be built against contracts before backend exists
3. **Document breaking changes**: Semantic versioning tracks API evolution
4. **Support testing**: Contracts define the testable surface area

---

## Versioning

Contracts follow **semantic versioning** (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes to props, events, or exposed methods (remove prop, change event payload structure)
- **MINOR**: Backward-compatible additions (new prop, new event, new slot)
- **PATCH**: Documentation clarifications, no functional changes

**Example**:
- `1.0.0` → `1.1.0`: Add new optional prop (backward compatible)
- `1.1.0` → `2.0.0`: Remove prop or change required prop type (breaking)

---

## Contracts in This Feature

1. **[DistanceLine.contract.md](DistanceLine.contract.md)** - Distance line overlay component for MapPanel

---

## Integration with Existing Contracts

This feature extends the existing dual-map view from spec 001:

- **MapPanel.vue** (existing): Will integrate DistanceLine as optional overlay via slot
- **MapContainer.vue** (existing): Unchanged, no new contracts needed

**Extension Pattern**:
```vue
<!-- MapPanel.vue integration -->
<MapPanel :id="'left-map'" :config="mapConfig">
  <DistanceLine
    v-if="showDistanceLine"
    :map="mapInstance"
    :side="'left'"
    @distance-changed="handleDistanceChange"
  />
</MapPanel>
```

---

## References

- Contract template: [../../.specify/templates/contract-template.md](../../.specify/templates/contract-template.md)
- Existing contracts: [../001-dual-map-view/contracts/](../001-dual-map-view/contracts/)
- Data model: [../data-model.md](../data-model.md)

---

**Document Version**: 1.0.0  
**Date**: February 28, 2026
