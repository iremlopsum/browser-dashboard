import Events from './events'
import Weather from './weather'
import Firebase from './firebase'

export type { TimeDataType, WeatherDataType, WeatherStateType } from '../../types/core'

export default { firebase: Firebase, weather: Weather, events: Events }
