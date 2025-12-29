/**
 * Time data structure containing formatted time information for the detected timezone.
 */
export interface TimeDataType {
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

/**
 * Weather data structure containing current weather and forecast information.
 */
export interface WeatherDataType {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  pressure: number
  location: string
  forecast: Array<{
    day: string
    temp: number
    condition: string
  }>
}

/**
 * Weather loading state
 */
export interface WeatherStateType {
  loading: boolean
  error: string | null
}

// Type for the emitter key is the name of the event and value is the type of the event.
export interface EventsType {
  'time.update': TimeDataType
  'weather.update': WeatherDataType
  'weather.state': WeatherStateType
}

