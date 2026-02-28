/**
 * T033: Line Synchronization Composable
 * Synchronizes distance line between left and right maps
 */
import { ref, watch, type Ref } from 'vue'
import type { DistanceLine } from '../types/map.types'

interface UseLineSyncOptions {
  /** Left map distance line (source of truth) */
  leftLine: Ref<DistanceLine | null>
  /** Callback to update right map line distance */
  onDistanceUpdate?: (distanceMeters: number) => void
  /** Enable sync latency tracking */
  trackLatency?: boolean
}

export function useLineSync(options: UseLineSyncOptions) {
  const {
    leftLine,
    onDistanceUpdate,
    trackLatency = false,
  } = options

  // T034: Synchronized distance state
  const synchronizedDistance = ref<number>(0)

  // T039: Sync latency tracking
  const syncLatency = ref<number>(0)
  const lastSyncTimestamp = ref<number>(0)

  /**
   * Get current synchronized distance
   */
  const getSynchronizedDistance = (): number => {
    return synchronizedDistance.value
  }

  /**
   * Update synchronized distance and trigger right map update
   */
  const updateSynchronizedDistance = (distanceMeters: number): void => {
    const startTime = performance.now()

    synchronizedDistance.value = distanceMeters

    // Trigger right map update callback
    onDistanceUpdate?.(distanceMeters)

    // T039: Track sync latency
    if (trackLatency) {
      const endTime = performance.now()
      syncLatency.value = endTime - startTime
      lastSyncTimestamp.value = Date.now()

      // Log if latency exceeds 100ms threshold (SC-006)
      if (syncLatency.value > 100) {
        console.warn(`Sync latency exceeded 100ms: ${syncLatency.value.toFixed(2)}ms`)
      }
    }
  }

  // T037: Watch left line distance changes
  watch(
    () => leftLine.value?.distanceMeters,
    (newDistance) => {
      if (newDistance !== undefined && newDistance !== null) {
        updateSynchronizedDistance(newDistance)
      }
    }
  )

  /**
   * Reset synchronization state
   */
  const reset = (): void => {
    synchronizedDistance.value = 0
    syncLatency.value = 0
    lastSyncTimestamp.value = 0
  }

  /**
   * Get sync performance metrics
   */
  const getMetrics = () => {
    return {
      syncLatency: syncLatency.value,
      lastSyncTimestamp: lastSyncTimestamp.value,
      synchronizedDistance: synchronizedDistance.value,
      isWithinThreshold: syncLatency.value <= 100, // T042: Verify 100ms constraint
    }
  }

  return {
    // State
    synchronizedDistance,
    syncLatency,
    lastSyncTimestamp,

    // Methods
    getSynchronizedDistance,
    updateSynchronizedDistance,
    reset,
    getMetrics,
  }
}
