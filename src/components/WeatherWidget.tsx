import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge } from 'lucide-react'
import { weatherAPI, timezoneAPI } from '../api'

interface WeatherData {
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

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeather()
  }, [])

  const fetchWeather = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user's location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async position => {
            const { latitude, longitude } = position.coords

            // Fetch weather from Open-Meteo API
            const data = await weatherAPI('getWeatherForecast', {
              latitude,
              longitude,
              current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code',
              daily: 'weather_code,temperature_2m_max',
              timezone: 'auto',
            })

            // Get location name using reverse geocoding
            try {
              const locationData = await timezoneAPI('getReverseGeocode', {
                latitude,
                longitude,
                localityLanguage: 'en',
              })

              const weatherCode = data.current.weather_code
              const condition = getWeatherCondition(weatherCode)

              const forecast = data.daily.weather_code.slice(1, 4).map((code: number, idx: number) => ({
                day: new Date(Date.now() + (idx + 1) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
                temp: Math.round(data.daily.temperature_2m_max[idx + 1]),
                condition: getWeatherCondition(code),
              }))

              setWeather({
                temperature: Math.round(data.current.temperature_2m),
                condition,
                humidity: data.current.relative_humidity_2m,
                windSpeed: Math.round(data.current.wind_speed_10m),
                visibility: 10,
                pressure: Math.round(data.current.surface_pressure),
                location:
                  locationData.city || locationData.locality || locationData.principalSubdivision || 'Your Location',
                forecast,
              })
              setLoading(false)
            } catch (geoErr) {
              // If geocoding fails, still show weather with generic location
              const weatherCode = data.current.weather_code
              const condition = getWeatherCondition(weatherCode)

              const forecast = data.daily.weather_code.slice(1, 4).map((code: number, idx: number) => ({
                day: new Date(Date.now() + (idx + 1) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
                temp: Math.round(data.daily.temperature_2m_max[idx + 1]),
                condition: getWeatherCondition(code),
              }))

              setWeather({
                temperature: Math.round(data.current.temperature_2m),
                condition,
                humidity: data.current.relative_humidity_2m,
                windSpeed: Math.round(data.current.wind_speed_10m),
                visibility: 10,
                pressure: Math.round(data.current.surface_pressure),
                location: 'Your Location',
                forecast,
              })
              setLoading(false)
            }
          },
          _error => {
            console.log('Geolocation permission denied or unavailable, using default location')
            // Fallback to default location (Berlin)
            loadDefaultWeather()
          },
          {
            timeout: 10000,
            maximumAge: 300000, // Cache for 5 minutes
            enableHighAccuracy: false,
          },
        )
      } else {
        loadDefaultWeather()
      }
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Failed to fetch weather data')
      setLoading(false)
    }
  }

  const loadDefaultWeather = async () => {
    try {
      const data = await weatherAPI('getWeatherForecast', {
        latitude: 52.52,
        longitude: 13.41,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code',
        daily: 'weather_code,temperature_2m_max',
        timezone: 'auto',
      })
      const weatherCode = data.current.weather_code

      const forecast = data.daily.weather_code.slice(1, 4).map((code: number, idx: number) => ({
        day: new Date(Date.now() + (idx + 1) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round(data.daily.temperature_2m_max[idx + 1]),
        condition: getWeatherCondition(code),
      }))

      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        condition: getWeatherCondition(weatherCode),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        visibility: 10,
        pressure: Math.round(data.current.surface_pressure),
        location: 'Berlin',
        forecast,
      })
      setLoading(false)
    } catch (err) {
      setError('Failed to load weather')
      setLoading(false)
    }
  }

  const getWeatherCondition = (code: number): string => {
    if (code === 0) return 'Clear'
    if (code <= 3) return 'Cloudy'
    if (code <= 67) return 'Rainy'
    if (code <= 77) return 'Snowy'
    return 'Stormy'
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="w-12 h-12 text-yellow-400" />
      case 'cloudy':
        return <Cloud className="w-12 h-12 text-gray-300" />
      case 'rainy':
        return <CloudRain className="w-12 h-12 text-blue-400" />
      default:
        return <Cloud className="w-12 h-12 text-gray-300" />
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl h-full">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-400">Loading weather...</div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-64 text-red-400">
            {error}
          </motion.div>
        ) : weather ? (
          <motion.div
            key="weather"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-gray-400 mb-1">Weather</h2>
                <p className="text-gray-300">{weather.location}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={fetchWeather}
                className="text-gray-400 hover:text-white transition-colors">
                <Wind className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
                  {getWeatherIcon(weather.condition)}
                </motion.div>
                <div>
                  <div className="flex items-baseline">
                    <span className="text-6xl">{weather.temperature}</span>
                    <span className="text-3xl text-gray-400 ml-1">°C</span>
                  </div>
                  <p className="text-gray-400 mt-1">{weather.condition}</p>
                </div>
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-gray-400 mb-1">
                  <Droplets className="w-4 h-4" />
                  <span className="text-sm">Humidity</span>
                </div>
                <p className="text-xl">{weather.humidity}%</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-gray-400 mb-1">
                  <Wind className="w-4 h-4" />
                  <span className="text-sm">Wind</span>
                </div>
                <p className="text-xl">{weather.windSpeed} km/h</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-gray-400 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Visibility</span>
                </div>
                <p className="text-xl">{weather.visibility} km</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-gray-400 mb-1">
                  <Gauge className="w-4 h-4" />
                  <span className="text-sm">Pressure</span>
                </div>
                <p className="text-xl">{weather.pressure} mb</p>
              </div>
            </div>

            {/* Forecast */}
            <div className="border-t border-gray-700/50 pt-4">
              <h3 className="text-sm text-gray-400 mb-3">3-Day Forecast</h3>
              <div className="grid grid-cols-3 gap-3">
                {weather.forecast.map((day, idx) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gray-700/20 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-400 mb-2">{day.day}</p>
                    <div className="flex justify-center mb-2">{getWeatherIcon(day.condition)}</div>
                    <p className="text-lg">{day.temp}°C</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
