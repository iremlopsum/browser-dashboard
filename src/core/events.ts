// Import the emittify module.
import EmittifyReact from '@libs/emittify/react'

/**
 * Time data structure containing formatted time information for the detected timezone.
 */
export interface TimeData {
  /** Current Date object */
  date: Date
  /** Hours (0-23) */
  hours: number
  /** Minutes (0-59) */
  minutes: number
  /** Seconds (0-59) */
  seconds: number
  /** Formatted date string (e.g., "Mon Jan 15") */
  dateString: string
  /** Timezone abbreviation (e.g., "EST", "PST", "GMT") */
  timeZoneName: string
}

// Type for the emitter key is the name of the event and value is the type of the event.
interface EventsType {
  'time.update': TimeData
}

const emitter = new EmittifyReact<EventsType>({
  // Cache is used to cache events and provide initial values to new listeners
  cachedEvents: ['time.update'],

  // Deduplication prevents emitting events when values haven't changed
  deduplicatedEvents: [],
})

export default emitter
