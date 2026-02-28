/**
 * Geodesic calculations composable
 * T006-T009: Haversine distance, bearing, destination point, formatting
 * Based on research.md geodesic calculations
 */

import type { Coordinate, DistanceUnit } from '../types/map.types'
import { DISTANCE_THRESHOLDS } from '../config/map.config'

// Earth's radius in meters (mean radius)
const EARTH_RADIUS_METERS = 6371000

/**
 * Composable for geodesic calculations
 * Provides distance, bearing, and destination point calculations
 */
export function useGeodesic() {
  /**
   * T006: Calculate geodesic distance between two points using Haversine formula
   * Accuracy: ±0.5% for distances up to 20,000km (SC-003 requirement: 99.5%)
   * Performance: <10ms per calculation (SC-004)
   * 
   * @param lat1 - Start latitude in decimal degrees
   * @param lng1 - Start longitude in decimal degrees
   * @param lat2 - End latitude in decimal degrees
   * @param lng2 - End longitude in decimal degrees
   * @returns Distance in meters
   */
  function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    // Convert to radians
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    // Haversine formula
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    // Distance in meters
    return EARTH_RADIUS_METERS * c
  }

  /**
   * T007: Calculate bearing (direction) from start point to end point
   * Returns forward azimuth in degrees (0-360)
   * 0° = North, 90° = East, 180° = South, 270° = West
   * 
   * @param start - Start coordinate
   * @param end - End coordinate
   * @returns Bearing in degrees (0-360)
   */
  function calculateBearing(start: Coordinate, end: Coordinate): number {
    // Convert to radians
    const φ1 = (start.lat * Math.PI) / 180
    const φ2 = (end.lat * Math.PI) / 180
    const Δλ = ((end.lng - start.lng) * Math.PI) / 180

    // Calculate bearing
    const y = Math.sin(Δλ) * Math.cos(φ2)
    const x =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)

    const θ = Math.atan2(y, x)

    // Convert to degrees and normalize to 0-360
    const bearing = ((θ * 180) / Math.PI + 360) % 360

    return bearing
  }

  /**
   * T008: Calculate destination point given start, distance, and bearing
   * Uses geodesic calculations for accurate results on Earth's surface
   * Essential for right map line rotation (preserves distance while changing bearing)
   * 
   * @param start - Start coordinate
   * @param distanceMeters - Distance in meters
   * @param bearingDegrees - Bearing in degrees (0-360)
   * @returns Destination coordinate
   */
  function calculateDestinationPoint(
    start: Coordinate,
    distanceMeters: number,
    bearingDegrees: number
  ): Coordinate {
    // Convert to radians
    const φ1 = (start.lat * Math.PI) / 180
    const λ1 = (start.lng * Math.PI) / 180
    const θ = (bearingDegrees * Math.PI) / 180
    const δ = distanceMeters / EARTH_RADIUS_METERS // Angular distance

    // Calculate destination point
    const φ2 = Math.asin(
      Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
    )

    const λ2 =
      λ1 +
      Math.atan2(
        Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
        Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
      )

    // Convert back to degrees and normalize longitude
    const lat = (φ2 * 180) / Math.PI
    const lng = (((λ2 * 180) / Math.PI + 540) % 360) - 180 // Normalize to -180 to 180

    return { lat, lng }
  }

  /**
   * T009: Format distance value with appropriate unit and precision
   * Auto-converts based on magnitude per data-model.md DistanceUnit
   * 
   * @param meters - Distance in meters
   * @param unit - Target unit (defaults to auto-convert)
   * @param precision - Number of decimal places (default: 1)
   * @returns Formatted distance string (e.g., "5.2 km")
   */
  function formatDistance(
    meters: number,
    unit: DistanceUnit = 'kilometers',
    precision: number = 1
  ): string {
    // Handle zero or very small distances
    if (meters < 0.01) {
      return '0 m'
    }

    // Auto-convert based on magnitude
    if (unit === 'kilometers' || unit === 'meters') {
      if (meters < DISTANCE_THRESHOLDS.metersToKilometers) {
        // Use meters for short distances
        if (meters < DISTANCE_THRESHOLDS.highPrecisionMeters) {
          // High precision for very short distances
          return `${meters.toFixed(2)} m`
        }
        return `${meters.toFixed(0)} m`
      } else {
        // Use kilometers for long distances
        const km = meters / 1000
        return `${km.toFixed(precision)} km`
      }
    }

    // Miles conversion
    if (unit === 'miles') {
      const miles = meters * 0.000621371
      if (miles < 0.1) {
        // Use feet for short distances
        const feet = meters * 3.28084
        return `${feet.toFixed(0)} ft`
      }
      return `${miles.toFixed(precision)} mi`
    }

    // Feet conversion
    if (unit === 'feet') {
      const feet = meters * 3.28084
      return `${feet.toFixed(precision)} ft`
    }

    // Fallback to meters
    return `${meters.toFixed(precision)} m`
  }

  /**
   * Validate coordinate is within valid lat/lng bounds
   * Utility for input validation (data-model.md constraints)
   * 
   * @param coord - Coordinate to validate
   * @returns True if valid, false otherwise
   */
  function isValidCoordinate(coord: Coordinate): boolean {
    return (
      coord.lat >= -90 &&
      coord.lat <= 90 &&
      coord.lng >= -180 &&
      coord.lng <= 180 &&
      !isNaN(coord.lat) &&
      !isNaN(coord.lng)
    )
  }

  /**
   * Clamp coordinate to valid lat/lng bounds
   * Used for error recovery per data-model.md error handling
   * 
   * @param coord - Coordinate to clamp
   * @returns Clamped coordinate within valid bounds
   */
  function clampCoordinate(coord: Coordinate): Coordinate {
    return {
      lat: Math.max(-90, Math.min(90, coord.lat)),
      lng: Math.max(-180, Math.min(180, coord.lng)),
    }
  }

  /**
   * Calculate midpoint between two coordinates
   * Useful for determining rotation anchor point
   * 
   * @param start - Start coordinate
   * @param end - End coordinate
   * @returns Midpoint coordinate
   */
  function calculateMidpoint(start: Coordinate, end: Coordinate): Coordinate {
    // Simple midpoint (not geodesic - sufficient for visualization)
    return {
      lat: (start.lat + end.lat) / 2,
      lng: (start.lng + end.lng) / 2,
    }
  }

  return {
    calculateDistance,
    calculateBearing,
    calculateDestinationPoint,
    formatDistance,
    isValidCoordinate,
    clampCoordinate,
    calculateMidpoint,
  }
}
