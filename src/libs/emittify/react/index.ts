import { useEffect, useState } from 'react'

import BaseEmitter from '../index'

class Emitter<
  EventsType extends Record<keyof EventsType, EventsType[keyof EventsType]>,
> extends BaseEmitter<EventsType> {
  useEventListener = <K extends keyof EventsType, V extends EventsType[K] | undefined>(key: K, fallbackValue?: V) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [value, setValue] = useState<EventsType[K]>(this.getCache(key) || fallbackValue)

    useEffect(() => {
      const listener = this.listen(key, setValue)

      return () => {
        listener.clearListener()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return value
  }
}

export default Emitter
