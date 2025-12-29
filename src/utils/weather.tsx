import { Cloud, CloudRain, Sun } from 'lucide-react'

/**
 * Returns an icon component for a given weather condition
 * @param condition - Weather condition string
 * @returns React component for the weather icon
 */
export function getWeatherIcon(condition: string) {
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
