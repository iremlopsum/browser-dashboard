import requests from './requests'

import type { RequestNameType } from '../../types/api'

// Map request names to their base URLs
const requestBaseUrls = {
  getGitLabMergeRequests: 'https://gitlab.com',
  getWeatherForecast: 'https://api.open-meteo.com',
  getReverseGeocode: 'https://api.bigdatacloud.net',
  getTimezoneByLocation: 'https://api.bigdatacloud.net',
} as const

// Extract response types from request instances
type GetTimezoneResponseType = Awaited<ReturnType<(typeof requests.getTimezoneByLocation)['request']>>
type GetReverseGeocodeResponseType = Awaited<ReturnType<(typeof requests.getReverseGeocode)['request']>>
type GetWeatherForecastResponseType = Awaited<ReturnType<(typeof requests.getWeatherForecast)['request']>>
type GetGitLabMergeRequestsResponseType = Awaited<ReturnType<(typeof requests.getGitLabMergeRequests)['request']>>

// Extract param types from requests
type GetTimezoneParamsType = Parameters<(typeof requests.getTimezoneByLocation)['request']>[0]
type GetReverseGeocodeParamsType = Parameters<(typeof requests.getReverseGeocode)['request']>[0]
type GetWeatherForecastParamsType = Parameters<(typeof requests.getWeatherForecast)['request']>[0]
type GetGitLabMergeRequestsParamsType = Parameters<(typeof requests.getGitLabMergeRequests)['request']>[0]

// Function overloads for proper type inference
function api(requestName: 'getTimezoneByLocation', params: GetTimezoneParamsType): Promise<GetTimezoneResponseType>
function api(
  requestName: 'getReverseGeocode',
  params: GetReverseGeocodeParamsType,
): Promise<GetReverseGeocodeResponseType>
function api(
  requestName: 'getWeatherForecast',
  params: GetWeatherForecastParamsType,
): Promise<GetWeatherForecastResponseType>
function api(
  requestName: 'getGitLabMergeRequests',
  params: GetGitLabMergeRequestsParamsType,
): Promise<GetGitLabMergeRequestsResponseType>
function api<T extends RequestNameType>(requestName: T, params: any): any {
  const baseUrl = requestBaseUrls[requestName]
  if (!baseUrl) {
    throw new Error(`Unknown request name: ${requestName}`)
  }

  // Hook into life-cycle events
  console.log('ON REQUEST START:', { requestName, params })

  // Call the request method directly with the baseUrl
  const request = requests[requestName]
  return request
    .request(params, baseUrl)
    .then(response => {
      console.log('ON SUCCESS: ', { requestName, response })
      return response
    })
    .catch(error => {
      console.log('ON ERROR: ', { requestName, error })
      throw error
    })
}

export default api
