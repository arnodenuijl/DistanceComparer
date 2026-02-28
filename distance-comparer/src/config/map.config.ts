/**
 * Default configuration for map components
 * Based on OpenStreetMap tile service and project requirements
 */

import type { Coordinate, MapConfig, TileLayerConfig } from '../types/map.types'

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default center coordinates (Null Island: 0°, 0°)
 */
export const DEFAULT_CENTER: Coordinate = {
  lat: 0,
  lng: 0,
}

/**
 * Default zoom level (world view)
 */
export const DEFAULT_ZOOM = 2

/**
 * Minimum zoom level (world view)
 */
export const MIN_ZOOM = 2

/**
 * Maximum zoom level (street view)
 */
export const MAX_ZOOM = 18

// ============================================================================
// Tile Layer Configuration
// ============================================================================

/**
 * OpenStreetMap tile layer configuration
 * Using standard OSM tile servers with proper attribution
 */
export const DEFAULT_TILE_CONFIG: TileLayerConfig = {
  urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: MAX_ZOOM,
  minZoom: MIN_ZOOM,
  subdomains: ['a', 'b', 'c'],
  retryAttempts: 3,
  retryDelay: 1000,
}

/**
 * Wikimedia tile layer configuration (fallback option)
 */
export const WIKIMEDIA_TILE_CONFIG: TileLayerConfig = {
  urlTemplate: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 18,
  minZoom: 1,
  retryAttempts: 3,
  retryDelay: 1000,
}

// ============================================================================
// Map Configuration
// ============================================================================

/**
 * Default map configuration for both panels
 */
export const DEFAULT_MAP_CONFIG: MapConfig = {
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
}

// ============================================================================
// Interaction Settings
// ============================================================================

/**
 * Debounce delay for map events (milliseconds)
 */
export const EVENT_DEBOUNCE_DELAY = 150

/**
 * Pan step size for keyboard navigation (pixels)
 */
export const KEYBOARD_PAN_STEP = 50

/**
 * Zoom step size for keyboard navigation (levels)
 */
export const KEYBOARD_ZOOM_STEP = 1

/**
 * Responsive breakpoint width (pixels)
 * Below this width, maps stack vertically
 */
export const BREAKPOINT_WIDTH = 768
