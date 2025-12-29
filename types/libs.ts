export interface DeduplicationConfigType<K> {
  event: K
  comparison: 'deep' | 'shallow'
}

export interface OptionsType<EventsType extends Record<keyof EventsType, EventsType[keyof EventsType]>> {
  cachedEvents?: (keyof EventsType)[]
  deduplicatedEvents?: DeduplicationConfigType<keyof EventsType>[]
}

