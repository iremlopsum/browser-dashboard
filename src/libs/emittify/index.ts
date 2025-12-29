import fastDeepEqual from 'fast-deep-equal'

export interface DeduplicationConfig<K> {
  event: K
  comparison: 'deep' | 'shallow'
}

export interface OptionsType<EventsType extends Record<keyof EventsType, EventsType[keyof EventsType]>> {
  cachedEvents?: (keyof EventsType)[]
  deduplicatedEvents?: DeduplicationConfig<keyof EventsType>[]
}

class Emitter<EventsType extends Record<keyof EventsType, EventsType[keyof EventsType]>> {
  /**
   * Map that holds all registered receiver ids per event type. The ids are kept in a Set.
   * This allows to loop over all listeners per event, and send out the message
   *
   * @example { 'messages.incoming': ['0.wfuyeh', '0.kjhsadf8'] }
   */
  private receivers: Map<keyof EventsType, Set<string>> = new Map()
  /**
   * Map of all listeners where key is id of the listener and value is an object with callback, id and event name
   *
   * @example { '0.wfuyeh': { callback: (params) => {}, id: '0.wfuyeh', event: 'messages.incoming' } }
   */
  private listeners = new Map<
    string,
    { id: string; event: keyof EventsType; callback: (params: EventsType[keyof EventsType]) => void }
  >()

  private cachedMessages = new Map<keyof EventsType, EventsType[keyof EventsType]>()

  /**
   * Map that stores previous values for deduplicated events
   * Used to compare current value against previous to prevent redundant emissions
   */
  private previousValues = new Map<keyof EventsType, EventsType[keyof EventsType]>()

  /**
   * Map that stores deduplication config per event (deep or shallow comparison)
   */
  private deduplicationConfig = new Map<keyof EventsType, 'deep' | 'shallow'>()

  constructor(private options?: OptionsType<EventsType>) {
    this.options = options || {}

    // Initialize deduplication config map
    if (this.options.deduplicatedEvents) {
      this.options.deduplicatedEvents.forEach(config => {
        this.deduplicationConfig.set(config.event, config.comparison)
      })
    }
  }

  /**
   * Performs shallow equality comparison between two values
   * Only checks first level properties, not nested objects
   */
  private shallowEqual = (a: any, b: any): boolean => {
    if (a === b) return true

    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
      return false
    }

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false

    return keysA.every(key => a[key] === b[key])
  }

  /**
   * Checks if two values are equal based on comparison strategy
   */
  private areValuesEqual = (a: any, b: any, comparison: 'deep' | 'shallow'): boolean => {
    return comparison === 'deep' ? fastDeepEqual(a, b) : this.shallowEqual(a, b)
  }

  send = <K extends keyof EventsType>(key: K, params: EventsType[K]) => {
    // Check if this event should be deduplicated
    const comparisonType = this.deduplicationConfig.get(key)

    if (comparisonType) {
      // If we have a previous value, compare it with the current one
      if (this.previousValues.has(key)) {
        const previousValue = this.previousValues.get(key)

        // If values are equal, skip emission
        if (this.areValuesEqual(previousValue, params, comparisonType)) {
          // Still update cache if needed (cache should reflect latest attempt)
          if (this.options?.cachedEvents?.includes(key)) {
            this.cachedMessages.set(key, params)
          }
          return
        }
      }

      // Store current value as previous for next comparison
      this.previousValues.set(key, params)
    }

    const receivers = this.receivers.get(key)

    if (receivers) {
      receivers.forEach(receiverId => {
        const listener = this.listeners.get(receiverId)

        if (listener) {
          listener.callback(params)
        }
      })
    }

    if (this.options?.cachedEvents?.includes(key)) {
      this.cachedMessages.set(key, params)
    }
  }

  listen = <K extends keyof EventsType>(
    key: K,
    callback: (params: EventsType[K]) => void,
  ): {
    id: string
    event: K
    clearListener: () => void
  } => {
    const id = Math.random().toString(16)
    const receivers = this.receivers.get(key)

    if (this.options?.cachedEvents?.includes(key) && this.cachedMessages.has(key)) {
      const values = this.cachedMessages.get(key) as EventsType[K]

      if (values) {
        callback(values)
      }
    }

    if (receivers) {
      receivers.add(id)
    } else {
      this.receivers.set(key, new Set<string>().add(id))
    }

    this.listeners.set(id, {
      id,
      event: key,
      callback: callback as (params: EventsType[keyof EventsType]) => void,
    })

    return {
      id,
      event: key,
      clearListener: () => this.clear(id),
    }
  }

  getCache = <K extends keyof EventsType, V extends EventsType[K]>(
    key: K,
    fallbackValue?: V,
  ): V extends undefined ? EventsType[K] : V => {
    if (this.cachedMessages.has(key)) {
      return this.cachedMessages.get(key) as EventsType[K]
    }

    return fallbackValue as EventsType[K]
  }

  clear = (id: string) => {
    const listener = this.listeners.get(id)

    if (listener) {
      const receivers = this.receivers.get(listener.event)

      if (receivers) {
        receivers.delete(id)
        this.listeners.delete(id)
      }
    }

    return undefined
  }

  clearAll = () => {
    this.receivers = new Map()
    this.listeners = new Map()

    return this.listeners
  }

  clearCache = <K extends keyof EventsType>(key: K) => {
    this.cachedMessages.delete(key)
  }

  clearAllCache = () => {
    this.cachedMessages = new Map()
  }

  /**
   * Clears the previous value for a specific deduplicated event
   * Next send will always emit since there's no previous value to compare
   */
  clearDeduplicationCache = <K extends keyof EventsType>(key: K) => {
    this.previousValues.delete(key)
  }

  /**
   * Clears all previous values for deduplicated events
   * Next sends will always emit since there are no previous values to compare
   */
  clearAllDeduplicationCache = () => {
    this.previousValues = new Map()
  }
}

export default Emitter
