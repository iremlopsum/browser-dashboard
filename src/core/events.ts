import EmittifyReact from '@libs/emittify/react'

import type { EventsType } from '../../types/core'

const emitter = new EmittifyReact<EventsType>({
  // Cache is used to cache events and provide initial values to new listeners
  cachedEvents: ['time.update', 'weather.update', 'weather.state'],

  // Deduplication prevents emitting events when values haven't changed
  deduplicatedEvents: [
    { event: 'weather.update', comparison: 'deep' },
    { event: 'weather.state', comparison: 'shallow' },
  ],
})

export default emitter
