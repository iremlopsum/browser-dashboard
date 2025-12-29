import api from '../api'

import emitter from './events'

import type { TimeDataType } from '../../types/core'

/**
 * Centralized time service that emits time updates every second.
 * Uses a single interval timer to update all subscribers, improving performance
 * when multiple components need time information.
 *
 * Automatically detects timezone based on user's location and handles
 * timezone transitions using the Intl API.
 */
class TimeCore {
  private intervalId: ReturnType<typeof setInterval> | null = null
  private timeZone: string = this.getSystemTimeZone()
  private timeZoneInitialized = false

  /**
   * Gets the system timezone from the browser.
   * Falls back to Europe/Tallinn if unavailable.
   */
  private getSystemTimeZone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Tallinn'
    } catch {
      return 'Europe/Tallinn'
    }
  }

  /**
   * Attempts to detect timezone based on geolocation.
   * Falls back to system timezone if geolocation is unavailable or denied.
   */
  private async detectTimeZoneFromLocation(): Promise<void> {
    if (this.timeZoneInitialized) return

    // First, try to get timezone from geolocation
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 300000, // Cache for 5 minutes
            enableHighAccuracy: false,
          })
        })

        const { latitude, longitude } = position.coords

        // Use BigDataCloud API to get timezone from coordinates (free, no API key required)
        try {
          const data = await api('getTimezoneByLocation', {
            latitude,
            longitude,
            localityLanguage: 'en',
          })
          if (data.ianaTimeId) {
            this.timeZone = data.ianaTimeId
            this.timeZoneInitialized = true
            return
          }
        } catch (err) {
          console.log('Timezone API failed, using system timezone')
        }
      } catch (err) {
        console.log('Geolocation unavailable or denied, using system timezone')
      }
    }

    // Fallback to system timezone
    this.timeZone = this.getSystemTimeZone()
    this.timeZoneInitialized = true
  }

  /**
   * Starts the time service and begins emitting time updates every second.
   * Safe to call multiple times - will only start one timer.
   */
  async start() {
    if (this.intervalId !== null) {
      return // Already running
    }

    // Initialize timezone detection (non-blocking)
    this.detectTimeZoneFromLocation()

    // Emit initial time immediately
    this.emitTime()

    // Then emit every second
    this.intervalId = setInterval(() => {
      this.emitTime()
    }, 1000)
  }

  /**
   * Stops the time service and clears the interval timer.
   */
  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  /**
   * Formats the current time using Intl API and emits it to all listeners.
   * Handles timezone transitions automatically based on detected timezone.
   */
  private emitTime() {
    const now = new Date()

    // Use Intl API to properly handle timezone transitions
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Force 24-hour format
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZoneName: 'short',
    })

    const parts = formatter.formatToParts(now)
    const hours = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10)
    const minutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10)
    const seconds = parseInt(parts.find(p => p.type === 'second')?.value || '0', 10)

    const weekday = parts.find(p => p.type === 'weekday')?.value || ''
    const month = parts.find(p => p.type === 'month')?.value || ''
    const day = parts.find(p => p.type === 'day')?.value || ''
    const timeZoneName = parts.find(p => p.type === 'timeZoneName')?.value || ''

    const dateString = `${weekday} ${month} ${day}`

    const timeData: TimeDataType = {
      date: now,
      hours,
      minutes,
      seconds,
      dateString,
      timeZoneName,
    }

    emitter.send('time.update', timeData)
  }
}

const timeCore = new TimeCore()

// Auto-start the time service when the module is imported
timeCore.start()

export default timeCore
