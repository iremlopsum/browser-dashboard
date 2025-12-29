import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Droplets, Eye, Gauge, Wind } from 'lucide-react'

import { getWeatherIcon } from '../utils/weather'

import core from '../core'

import type { WeatherDataType, WeatherStateType } from '../../types/core'

export function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<WeatherDataType | undefined>(undefined)
  const [weatherState, setWeatherState] = useState<WeatherStateType>({ loading: true, error: null })

  useEffect(() => {
    core.weather.fetchWeather()

    const weatherUpdateListener = core.events.listen('weather.update', setWeatherData)
    const weatherStateListener = core.events.listen('weather.state', setWeatherState)

    return () => {
      weatherUpdateListener.clearListener()
      weatherStateListener.clearListener()
    }
  }, [])

  const handleRefresh = () => {
    core.weather.fetchWeather()
  }

  const { loading, error } = weatherState

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
        ) : weatherData ? (
          <motion.div
            key="weather"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-gray-400 mb-1">Weather</h2>
                <p className="text-gray-300">{weatherData.location}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRefresh}
                className="text-gray-400 hover:text-white transition-colors">
                <Wind className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
                  {getWeatherIcon(weatherData.condition)}
                </motion.div>
                <div>
                  <div className="flex items-baseline">
                    <span className="text-6xl">{weatherData.temperature}</span>
                    <span className="text-3xl text-gray-400 ml-1">°C</span>
                  </div>
                  <p className="text-gray-400 mt-1">{weatherData.condition}</p>
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
                <p className="text-xl">{weatherData.humidity}%</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-gray-400 mb-1">
                  <Wind className="w-4 h-4" />
                  <span className="text-sm">Wind</span>
                </div>
                <p className="text-xl">{weatherData.windSpeed} km/h</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-gray-400 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Visibility</span>
                </div>
                <p className="text-xl">{weatherData.visibility} km</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-gray-400 mb-1">
                  <Gauge className="w-4 h-4" />
                  <span className="text-sm">Pressure</span>
                </div>
                <p className="text-xl">{weatherData.pressure} mb</p>
              </div>
            </div>

            {/* Forecast */}
            <div className="border-t border-gray-700/50 pt-4">
              <h3 className="text-sm text-gray-400 mb-3">3-Day Forecast</h3>
              <div className="grid grid-cols-3 gap-3">
                {weatherData.forecast.map((day, idx) => (
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
