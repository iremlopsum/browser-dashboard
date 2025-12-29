import api from '../api'

import emitter from './events'

import type { WeatherDataType, WeatherStateType } from '../../types/core'

/**
 * Converts a weather code to a human-readable condition string
 * @param code - Weather code from Open-Meteo API
 * @returns Weather condition string
 */
function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear'
  if (code <= 3) return 'Cloudy'
  if (code <= 67) return 'Rainy'
  if (code <= 77) return 'Snowy'
  return 'Stormy'
}

/**
 * Centralized weather service that fetches and emits weather updates.
 * Handles geolocation, API calls, and data transformation.
 */
class Weather {
  /**
   * Fetches weather data for a specific location
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param locationName - Optional location name, will be fetched if not provided
   */
  async fetchWeatherForLocation(latitude: number, longitude: number, locationName?: string): Promise<void> {
    try {
      this.emitState({ loading: true, error: null })

      // Fetch weather from Open-Meteo API
      const data = await api('getWeatherForecast', {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code',
        daily: 'weather_code,temperature_2m_max',
        timezone: 'auto',
      })

      // Get location name using reverse geocoding if not provided
      let location = locationName
      if (!location) {
        try {
          const locationData = await api('getReverseGeocode', {
            latitude,
            longitude,
            localityLanguage: 'en',
          })
          location = locationData.city || locationData.locality || locationData.principalSubdivision || 'Your Location'
        } catch {
          location = 'Your Location'
        }
      }

      const weatherCode = data.current.weather_code
      const condition = getWeatherCondition(weatherCode)

      const forecast = data.daily.weather_code.slice(1, 4).map((code: number, idx: number) => ({
        day: new Date(Date.now() + (idx + 1) * 86400000).toLocaleDateString('en-US', {
          weekday: 'short',
        }),
        temp: Math.round(data.daily.temperature_2m_max[idx + 1]),
        condition: getWeatherCondition(code),
      }))

      const weatherData: WeatherDataType = {
        temperature: Math.round(data.current.temperature_2m),
        condition,
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        visibility: 10,
        pressure: Math.round(data.current.surface_pressure),
        location,
        forecast,
      }

      this.emitState({ loading: false, error: null })
      emitter.send('weather.update', weatherData)
    } catch (err) {
      console.error('Weather fetch error:', err)
      const errorMessage = 'Failed to fetch weather data'
      this.emitState({ loading: false, error: errorMessage })
    }
  }

  /**
   * Fetches weather data using the user's current location.
   * Falls back to default location (Berlin) if geolocation is unavailable.
   */
  async fetchWeather(): Promise<void> {
    try {
      this.emitState({ loading: true, error: null })

      // Get user's location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async position => {
            const { latitude, longitude } = position.coords
            await this.fetchWeatherForLocation(latitude, longitude)
          },
          _error => {
            console.log('Geolocation permission denied or unavailable, using default location')
            // Fallback to default location (Berlin)
            this.fetchWeatherForLocation(52.52, 13.41, 'Berlin')
          },
          {
            timeout: 10000,
            maximumAge: 300000, // Cache for 5 minutes
            enableHighAccuracy: false,
          },
        )
      } else {
        // Fallback to default location if geolocation is not supported
        await this.fetchWeatherForLocation(52.52, 13.41, 'Berlin')
      }
    } catch (err) {
      console.error('Weather fetch error:', err)
      this.emitState({ loading: false, error: 'Failed to fetch weather data' })
    }
  }

  /**
   * Emits weather state updates (loading/error)
   */
  private emitState(state: WeatherStateType): void {
    emitter.send('weather.state', state)
  }
}

export default new Weather()
