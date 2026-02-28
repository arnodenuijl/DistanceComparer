/**
 * useMapKeyboard - Composable for keyboard-based map navigation
 * Handles arrow keys for panning, +/- keys for zooming, and Escape to blur
 * 
 * T068-T073: Keyboard navigation implementation
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import type L from 'leaflet'
import { KEYBOARD_PAN_STEP, KEYBOARD_ZOOM_STEP } from '../config/map.config'

export interface KeyboardNavigationOptions {
  panStepSize?: number
  zoomStepSize?: number
  enabledKeys?: KeyboardKey[]
}

export type KeyboardKey = 'arrows' | 'zoom' | 'escape'

/**
 * useMapKeyboard
 * 
 * Provides keyboard navigation capabilities for a Leaflet map
 * 
 * @param map - Ref to Leaflet map instance
 * @param containerRef - Ref to container element that receives keyboard events
 * @param options - Configuration options
 * @returns Object with keyboard state and methods
 */
export function useMapKeyboard(
  map: Ref<L.Map | null>,
  containerRef: Ref<HTMLElement | null>,
  options: KeyboardNavigationOptions = {}
) {
  const {
    panStepSize = KEYBOARD_PAN_STEP,
    zoomStepSize = KEYBOARD_ZOOM_STEP,
    enabledKeys = ['arrows', 'zoom', 'escape'],
  } = options

  // State
  const isFocused = ref(false)
  const lastKeyPressed = ref<string | null>(null)

  // T069: Keyboard mappings
  const keyMappings = {
    arrows: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
    zoom: ['+', '-', '=', '_'], // Include = and _ for convenience (shift variants)
    escape: ['Escape'],
  }

  /**
   * T070: Handle arrow key navigation
   * Pans the map in the direction of the arrow key pressed
   */
  const handleArrowKey = (key: string) => {
    if (!map.value || !enabledKeys.includes('arrows')) return

    const panOffset: [number, number] = (() => {
      switch (key) {
        case 'ArrowUp':
          return [0, -panStepSize]
        case 'ArrowDown':
          return [0, panStepSize]
        case 'ArrowLeft':
          return [-panStepSize, 0]
        case 'ArrowRight':
          return [panStepSize, 0]
        default:
          return [0, 0]
      }
    })()

    if (panOffset[0] !== 0 || panOffset[1] !== 0) {
      map.value.panBy(panOffset, { animate: true, duration: 0.2 })
    }
  }

  /**
   * T071: Handle zoom key navigation
   * Zooms the map in or out by one level
   */
  const handleZoomKey = (key: string) => {
    if (!map.value || !enabledKeys.includes('zoom')) return

    if (key === '+' || key === '=') {
      // Zoom in
      map.value.zoomIn(zoomStepSize, { animate: true })
    } else if (key === '-' || key === '_') {
      // Zoom out
      map.value.zoomOut(zoomStepSize, { animate: true })
    }
  }

  /**
   * T072: Handle Escape key
   * Removes focus from the active element
   */
  const handleEscapeKey = () => {
    if (!enabledKeys.includes('escape')) return

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    isFocused.value = false
  }

  /**
   * Main keyboard event handler
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!map.value || !isFocused.value) return

    const key = event.key

    // Check if this is a mapped key
    const isArrowKey = keyMappings.arrows.includes(key)
    const isZoomKey = keyMappings.zoom.includes(key)
    const isEscapeKey = keyMappings.escape.includes(key)

    if (!isArrowKey && !isZoomKey && !isEscapeKey) {
      return // Not a key we handle
    }

    // Prevent default browser behavior for navigation keys
    event.preventDefault()
    event.stopPropagation()

    lastKeyPressed.value = key

    // Handle the key press
    if (isArrowKey) {
      handleArrowKey(key)
    } else if (isZoomKey) {
      handleZoomKey(key)
    } else if (isEscapeKey) {
      handleEscapeKey()
    }
  }

  /**
   * Handle focus event
   */
  const handleFocus = () => {
    isFocused.value = true
  }

  /**
   * Handle blur event
   */
  const handleBlur = () => {
    isFocused.value = false
    lastKeyPressed.value = null
  }

  /**
   * Enable keyboard navigation
   */
  const enable = () => {
    if (!containerRef.value) return

    containerRef.value.addEventListener('keydown', handleKeyDown)
    containerRef.value.addEventListener('focus', handleFocus)
    containerRef.value.addEventListener('blur', handleBlur)
  }

  /**
   * Disable keyboard navigation
   */
  const disable = () => {
    if (!containerRef.value) return

    containerRef.value.removeEventListener('keydown', handleKeyDown)
    containerRef.value.removeEventListener('focus', handleFocus)
    containerRef.value.removeEventListener('blur', handleBlur)
  }

  // Auto-enable on mount
  onMounted(() => {
    enable()
  })

  // Auto-cleanup on unmount
  onUnmounted(() => {
    disable()
  })

  return {
    isFocused,
    lastKeyPressed,
    enable,
    disable,
    handleKeyDown,
    handleFocus,
    handleBlur,
  }
}
