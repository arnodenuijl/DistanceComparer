/**
 * Core type definitions for the dual map view feature
 * Based on data-model.md and component contracts
 */

// ============================================================================
// Geographic Types
// ============================================================================

/**
 * Geographic coordinate with latitude and longitude
 */
export interface Coordinate {
  /** Latitude in decimal degrees (-90 to 90) */
  lat: number
  /** Longitude in decimal degrees (-180 to 180) */
  lng: number
}

/**
 * Geographic bounding box defining a rectangular area
 */
export interface Bounds {
  /** Northern boundary latitude */
  north: number
  /** Southern boundary latitude */
  south: number
  /** Eastern boundary longitude */
  east: number
  /** Western boundary longitude */
  west: number
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Configuration for initializing a map instance
 */
export interface MapConfig {
  /** Initial geographic center of the map */
  center: Coordinate
  /** Initial zoom level */
  zoom: number
  /** Minimum allowed zoom level */
  minZoom: number
  /** Maximum allowed zoom level */
  maxZoom: number
}

/**
 * Configuration for tile layer source
 */
export interface TileLayerConfig {
  /** URL template for fetching tiles (contains {z}, {x}, {y}, {s} placeholders) */
  urlTemplate: string
  /** Copyright/attribution HTML string */
  attribution: string
  /** Maximum zoom level supported by tile provider */
  maxZoom: number
  /** Minimum zoom level supported by tile provider */
  minZoom: number
  /** Tile server subdomains for load balancing */
  subdomains?: string[]
  /** Number of retry attempts for failed tiles */
  retryAttempts?: number
  /** Delay between retries in milliseconds */
  retryDelay?: number
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Error information emitted by map components
 */
export interface MapError {
  /** Error code identifier */
  code: 'INIT_FAILED' | 'TILE_LOAD_FAILED' | 'NETWORK_ERROR' | 'INVALID_CONFIG'
  /** Human-readable error message */
  message: string
  /** Whether the error can be recovered from */
  recoverable: boolean
}

/**
 * Event payloads emitted by MapPanel component
 */
export interface MapPanelEvents {
  /** Emitted when map is fully initialized and ready */
  'map-ready': {
    mapId: string
    center: Coordinate
    zoom: number
  }
  /** Emitted when map center changes (debounced) */
  'center-changed': {
    mapId: string
    center: Coordinate
  }
  /** Emitted when zoom level changes (debounced) */
  'zoom-changed': {
    mapId: string
    zoom: number
  }
  /** Emitted when viewport bounds change (debounced) */
  'bounds-changed': {
    mapId: string
    bounds: Bounds
  }
  /** Emitted when tile loading starts */
  'loading-start': {
    mapId: string
  }
  /** Emitted when tile loading completes */
  'loading-end': {
    mapId: string
    success: boolean
  }
  /** Emitted when an error occurs */
  'error': {
    mapId: string
    error: MapError
  }
  /** Emitted when map panel receives keyboard focus */
  'focus-gained': {
    mapId: string
  }
  /** Emitted when map panel loses keyboard focus */
  'focus-lost': {
    mapId: string
  }
}

// ============================================================================
// State Types
// ============================================================================

/**
 * Loading state of a map component
 */
export type LoadingState = 'idle' | 'loading' | 'error'

/**
 * Layout mode for MapContainer
 */
export type LayoutMode = 'side-by-side' | 'stacked'

/**
 * Input mode for map interaction
 */
export type InputMode = 'mouse' | 'touch' | 'keyboard'

// ============================================================================
// Distance Line Types (Feature 002)
// ============================================================================

/**
 * Full internal state for a distance line (data-model.md: DistanceLineState)
 * Contains all attributes for state management
 */
export interface DistanceLineState {
  /** Unique identifier for the line instance */
  id: string
  /** Starting point of the line */
  startPoint: LineEndpoint
  /** Ending point of the line */
  endPoint: LineEndpoint
  /** Real-world geodesic distance in meters */
  distanceMeters: number
  /** Formatted distance string with units (e.g., "5.2 km") */
  distanceDisplay: string
  /** Which map this line belongs to */
  mapSide: 'left' | 'right'
  /** Whether line is currently visible */
  visible: boolean
  /** Visual styling properties */
  style: LineStyle
}

/**
 * Simplified component interface for distance line (contract: DistanceLine)
 * Public API with minimal attributes
 */
export interface DistanceLine {
  /** Unique identifier */
  id: string
  /** Start point coordinates */
  startPoint: Coordinate
  /** End point coordinates */
  endPoint: Coordinate
  /** Real-world distance in meters */
  distanceMeters: number
  /** Bearing in degrees (0-360), for right map only */
  bearing?: number
}

/**
 * Draggable anchor point (endpoint) of a distance line
 */
export interface LineEndpoint {
  /** Unique identifier */
  id: string
  /** Geographic coordinates */
  position: Coordinate
  /** Whether endpoint is currently being dragged */
  isDragging: boolean
}

/**
 * Rotational state of right map's distance line
 */
export interface LineOrientation {
  /** Direction in degrees (0=North, 90=East, 180=South, 270=West) */
  bearing: number
  /** Whether line is currently being rotated */
  isRotating: boolean
  /** Point around which rotation occurs */
  rotationAnchor: Coordinate
}

/**
 * Visual styling configuration for distance line
 */
export interface LineStyle {
  /** Hex color code */
  color: string
  /** Line thickness in pixels */
  weight: number
  /** Line opacity (0-1) */
  opacity: number
  /** Dash pattern (e.g., '5, 10') or undefined for solid */
  dashArray?: string
  /** Endpoint circle radius in pixels */
  endpointRadius: number
  /** Endpoint fill color hex */
  endpointFillColor: string
  /** Endpoint border color hex */
  endpointBorderColor: string
  /** Endpoint border thickness in pixels */
  endpointBorderWeight: number
}

/**
 * Distance unit for display formatting
 */
export type DistanceUnit = 'meters' | 'kilometers' | 'miles' | 'feet'
