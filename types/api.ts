import type { CreateRequestType } from '@colorfy-software/apify'

// Request name type
export type RequestNameType = 'getTimezoneByLocation' | 'getReverseGeocode' | 'getWeatherForecast' | 'getGitLabMergeRequests'

// CreatePost request types
export interface CreatePostReqType {
  title: string
  body: string
  userId: number
}

export interface CreatePostResType {
  id: number
  title: string
  body: string
  userId: number
}

export type CreatePostType = CreateRequestType<CreatePostReqType, CreatePostResType>

// Timezone API request types
export interface GetTimezoneReqType {
  latitude: number
  longitude: number
  localityLanguage?: string
}

export interface GetTimezoneResType {
  ianaTimeId: string
  [key: string]: unknown
}

export type GetTimezoneType = CreateRequestType<GetTimezoneReqType, GetTimezoneResType>

// Open-Meteo Weather API request types
export interface GetWeatherForecastReqType {
  latitude: number
  longitude: number
  current?: string
  daily?: string
  timezone?: string
}

export interface GetWeatherForecastResType {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    wind_speed_10m: number
    surface_pressure: number
    weather_code: number
  }
  daily: {
    weather_code: number[]
    temperature_2m_max: number[]
  }
  [key: string]: unknown
}

export type GetWeatherForecastType = CreateRequestType<GetWeatherForecastReqType, GetWeatherForecastResType>

// BigDataCloud Reverse Geocoding API request types
export interface GetReverseGeocodeReqType {
  latitude: number
  longitude: number
  localityLanguage?: string
}

export interface GetReverseGeocodeResType {
  city?: string
  locality?: string
  principalSubdivision?: string
  [key: string]: unknown
}

export type GetReverseGeocodeType = CreateRequestType<GetReverseGeocodeReqType, GetReverseGeocodeResType>

// GitLab API request types
export interface GetGitLabMergeRequestsReqType {
  projectId: string
  state?: 'opened' | 'closed' | 'locked' | 'merged'
  per_page?: number
  page?: number
}

export interface GitLabMergeRequestType {
  id: number
  title: string
  author: {
    name: string
  }
  state: string
  created_at: string
  source_branch: string
  target_branch: string
  description: string
  [key: string]: unknown
}

export interface GetGitLabMergeRequestsResType extends Array<GitLabMergeRequestType> {}

export type GetGitLabMergeRequestsType = CreateRequestType<GetGitLabMergeRequestsReqType, GetGitLabMergeRequestsResType>

