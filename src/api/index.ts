import { APIConstructor } from '@colorfy-software/apify'

// Import requests from prev file
import requests from './requests'

// Create separate API instance for BigDataCloud API
const timezoneAPI = APIConstructor<{
  getTimezoneByLocation: typeof requests.getTimezoneByLocation
  getReverseGeocode: typeof requests.getReverseGeocode
}>(
  { getTimezoneByLocation: requests.getTimezoneByLocation, getReverseGeocode: requests.getReverseGeocode },
  {
    baseUrl: 'https://api.bigdatacloud.net',
    onRequestStart: ({ requestName, params }) => {
      console.log('ON BIGDATACLOUD REQUEST START:', { requestName, params })
    },
    onSuccess: ({ requestName, response }) => {
      console.log('ON BIGDATACLOUD SUCCESS: ', { requestName, response })
    },
    onError: ({ requestName, error }) => {
      console.log('ON BIGDATACLOUD ERROR: ', { requestName, error })
    },
  },
)

// Create API instance for Open-Meteo API
const weatherAPI = APIConstructor<{ getWeatherForecast: typeof requests.getWeatherForecast }>(
  { getWeatherForecast: requests.getWeatherForecast },
  {
    baseUrl: 'https://api.open-meteo.com',
    onRequestStart: ({ requestName, params }) => {
      console.log('ON OPENMETEO REQUEST START:', { requestName, params })
    },
    onSuccess: ({ requestName, response }) => {
      console.log('ON OPENMETEO SUCCESS: ', { requestName, response })
    },
    onError: ({ requestName, error }) => {
      console.log('ON OPENMETEO ERROR: ', { requestName, error })
    },
  },
)

// Create API instance for GitLab API
const gitLabApi = APIConstructor<{ getGitLabMergeRequests: typeof requests.getGitLabMergeRequests }>(
  { getGitLabMergeRequests: requests.getGitLabMergeRequests },
  {
    baseUrl: 'https://gitlab.com',
    onRequestStart: ({ requestName, params }) => {
      console.log('ON GITLAB REQUEST START:', { requestName, params })
    },
    onSuccess: ({ requestName, response }) => {
      console.log('ON GITLAB SUCCESS: ', { requestName, response })
    },
    onError: ({ requestName, error }) => {
      console.log('ON GITLAB ERROR: ', { requestName, error })
    },
  },
)

export { timezoneAPI, weatherAPI, gitLabApi }
