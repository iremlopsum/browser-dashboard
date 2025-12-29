import Events from './events'
import Firebase from './firebase'
import Weather from './weather'

export type { TimeDataType, WeatherDataType, WeatherStateType } from '../../types/core'

export default { firebase: Firebase, weather: Weather, events: Events }
