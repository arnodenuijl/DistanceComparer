/**
 * Line Creation Composable
 * T011, T015: Two-click creation workflow with preview line
 * Based on quickstart.md Phase 4
 */

import { ref, computed, shallowRef } from 'vue'
import type { Ref } from 'vue'
import L from 'leaflet'
import type { Coordinate } from '../types/map.types'
import { PREVIEW_LINE_STYLE } from '../config/map.config'

export interface UseLineCreationOptions {
  /** Leaflet map instance */
  map: Ref<L.Map | null>
  /** Callback when line is created (receives start and end coordinates) */
  onLineCreated: (start: Coordinate, end: Coordinate) => void
}

/**
 * Composable for two-click line creation workflow
 * T011: Manages creation state (inactive → awaiting-first-click → awaiting-second-click)
 * T015: Displays preview line that follows cursor
 */
export function useLineCreation(options: UseLineCreationOptions) {
  const { map, onLineCreated } = options

  // Creation state (per data-model.md LineCreationState)
  const isActive = ref(false)
  const firstClick = ref<Coordinate | null>(null)
  
  // T015: Preview line (dashed style, follows cursor)
  const previewLine = shallowRef<L.Polyline | null>(null)

  // Computed state
  const isAwaitingSecondClick = computed(
    () => isActive.value && firstClick.value !== null
  )

  /**
   * T011: Activate line creation mode
   * Changes cursor to crosshair, enters awaiting-first-click state
   */
  function activate(): void {
    isActive.value = true
    firstClick.value = null

    if (map.value) {
      map.value.getContainer().style.cursor = 'crosshair'
    }
  }

  /**
   * T011: Deactivate line creation mode
   * Returns to normal cursor, clears state
   */
  function deactivate(): void {
    isActive.value = false
    firstClick.value = null
    removePreviewLine()

    if (map.value) {
      map.value.getContainer().style.cursor = ''
    }
  }

  /**
   * T011: Handle map click during creation mode
   * First click: Store start point, enter awaiting-second-click state
   * Second click: Complete line creation, deactivate mode
   */
  function handleMapClick(e: L.LeafletMouseEvent): void {
    if (!isActive.value) return

    const clickCoord: Coordinate = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    }

    if (!firstClick.value) {
      // First click: Set start point
      firstClick.value = clickCoord
      createPreviewLine(clickCoord)
    } else {
      // Second click: Complete line
      removePreviewLine()
      onLineCreated(firstClick.value, clickCoord)
      deactivate()
    }
  }

  /**
   * T015: Handle mouse move to update preview line
   * Only active when awaiting second click
   */
  function handleMouseMove(e: L.LeafletMouseEvent): void {
    if (!isAwaitingSecondClick.value || !map.value) return

    const currentCoord: Coordinate = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    }

    updatePreviewLine(currentCoord)
  }

  /**
   * T015: Create preview line from first click point
   * Uses dashed style and lower opacity
   */
  function createPreviewLine(start: Coordinate): void {
    if (!map.value) return

    previewLine.value = L.polyline(
      [
        [start.lat, start.lng],
        [start.lat, start.lng], // Will update on mousemove
      ],
      {
        color: PREVIEW_LINE_STYLE.color,
        weight: PREVIEW_LINE_STYLE.weight,
        opacity: PREVIEW_LINE_STYLE.opacity,
        dashArray: PREVIEW_LINE_STYLE.dashArray,
      }
    ).addTo(map.value)
  }

  /**
   * T015: Update preview line endpoint as cursor moves
   */
  function updatePreviewLine(end: Coordinate): void {
    if (!previewLine.value || !firstClick.value) return

    previewLine.value.setLatLngs([
      [firstClick.value.lat, firstClick.value.lng],
      [end.lat, end.lng],
    ])
  }

  /**
   * Remove preview line from map
   */
  function removePreviewLine(): void {
    if (previewLine.value && map.value) {
      map.value.removeLayer(previewLine.value)
      previewLine.value = null
    }
  }

  return {
    // State
    isActive,
    isAwaitingSecondClick,
    firstClick,
    
    // Methods
    activate,
    deactivate,
    handleMapClick,
    handleMouseMove,
  }
}
