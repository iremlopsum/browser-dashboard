import { Clock } from 'lucide-react'
import { motion } from 'motion/react'

import Counter from './Counter'

import core from '../core'

/**
 * Animated colon separator used between time units in the clock display.
 * Pulses with a fade animation to create a visual separator effect.
 *
 * @param {Object} props - Component props
 * @param {number} [props.delay=0] - Animation delay in seconds before starting the pulse
 * @returns {JSX.Element} Animated colon separator
 */
const Separator = ({ delay = 0 }: { delay?: number }) => (
  <motion.span
    animate={{ opacity: [1, 0.4, 1] }}
    transition={{ duration: 1, repeat: Infinity, delay }}
    className="text-2xl text-purple-400">
    :
  </motion.span>
)

/**
 * Common styling props shared across all Counter components in the clock display.
 * Ensures consistent appearance for hours, minutes, and seconds.
 */
const COMMON_COUNTER_PROPS = {
  places: [10, 1],
  fontSize: 24,
  padding: 0,
  gap: 0,
  textColor: 'white' as const,
  fontWeight: 400 as const,
  gradientHeight: 0,
}

/**
 * ClockWidget component displays the current time based on user's location.
 * Shows hours, minutes, and seconds with animated counters, along with the current date
 * and timezone abbreviation. Automatically detects timezone from geolocation and
 * handles daylight saving time transitions.
 *
 * Features:
 * - Real-time updates every second via centralized time service
 * - Animated digit transitions using Counter components
 * - Pulsing colon separators between time units
 * - Dynamic timezone detection based on user's location
 * - Formatted date display with weekday, month, and day
 * - Uses event emitter for efficient multi-component time sharing
 *
 * @returns {JSX.Element} Clock widget displaying current local time
 */
export function ClockWidget() {
  // Subscribe to time updates from the centralized time service
  const timeData = core.events.useEventListener('time.update', {
    date: new Date(),
    hours: 0,
    minutes: 0,
    seconds: 0,
    dateString: '',
    timeZoneName: 'EET',
  })

  const { hours, minutes, seconds, dateString, timeZoneName } = timeData

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <div className="flex items-baseline space-x-0.5 justify-end mb-0.5">
          <Counter value={hours} {...COMMON_COUNTER_PROPS} />
          <Separator />
          <Counter value={minutes} {...COMMON_COUNTER_PROPS} />
          <Separator delay={0.5} />
          <Counter value={seconds} {...COMMON_COUNTER_PROPS} />
        </div>
        <div className="flex items-center justify-end space-x-1.5 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>
            {dateString} {timeZoneName}
          </span>
        </div>
      </div>
    </div>
  )
}
