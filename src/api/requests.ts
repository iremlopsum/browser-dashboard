import { CreateRequest, CreateRequestType } from '@colorfy-software/apify'

// Define request type
interface CreatePostReqType {
  title: string
  body: string
  userId: number
}

// Define response type
interface CreatePostResType {
  id: number
  title: string
  body: string
  userId: number
}

// Combine types
type CreatePostType = CreateRequestType<CreatePostReqType, CreatePostResType>

// Create request
const createPost = new CreateRequest<CreatePostType>('/posts')

// Timezone API request types
interface GetTimezoneReqType {
  latitude: number
  longitude: number
  localityLanguage?: string
}

interface GetTimezoneResType {
  ianaTimeId: string
  [key: string]: unknown
}

type GetTimezoneType = CreateRequestType<GetTimezoneReqType, GetTimezoneResType>

// Custom GET request class that handles query parameters (compatible with apify structure)
class GetRequestWithQueryParams<T extends { params: unknown; response: unknown }> {
  endpoint: string
  options?: RequestInit

  constructor(endpoint: string, options?: RequestInit) {
    this.endpoint = endpoint
    this.options = options
  }

  request = async (params: T['params'] | T['params'][], baseUrl?: string): Promise<T['response']> => {
    try {
      if (!baseUrl) {
        throw new Error('baseUrl is required for this request')
      }

      // APIConstructor spreads params into an array, so extract the first element if it's an array
      const actualParams = Array.isArray(params) ? params[0] : params

      // Construct URL properly using URL constructor for validation
      const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
      const path = this.endpoint.startsWith('/') ? this.endpoint : `/${this.endpoint}`
      const baseEndpoint = `${base}${path}`

      // Build query string from params
      const queryParams = new URLSearchParams()
      if (actualParams && typeof actualParams === 'object' && !Array.isArray(actualParams)) {
        Object.entries(actualParams as Record<string, unknown>).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value))
          }
        })
      }

      // Construct final URL using URL constructor to ensure it's valid
      let url: URL
      try {
        url = new URL(baseEndpoint)
      } catch (urlError) {
        throw new Error(
          `Invalid URL: ${baseEndpoint} - ${urlError instanceof Error ? urlError.message : String(urlError)}`,
        )
      }

      queryParams.forEach((value, key) => {
        url.searchParams.append(key, value)
      })

      const response = await fetch(url.toString(), {
        ...this.options,
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      // Re-throw with more context
      throw error instanceof Error ? error : new Error(String(error))
    }
  }
}

// Create timezone request with GET method and query parameters
const getTimezoneByLocation = new GetRequestWithQueryParams<GetTimezoneType>('/data/timezone-by-location')

// Open-Meteo Weather API request types
interface GetWeatherForecastReqType {
  latitude: number
  longitude: number
  current?: string
  daily?: string
  timezone?: string
}

interface GetWeatherForecastResType {
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

type GetWeatherForecastType = CreateRequestType<GetWeatherForecastReqType, GetWeatherForecastResType>

// Create weather forecast request
const getWeatherForecast = new GetRequestWithQueryParams<GetWeatherForecastType>('/v1/forecast')

// BigDataCloud Reverse Geocoding API request types
interface GetReverseGeocodeReqType {
  latitude: number
  longitude: number
  localityLanguage?: string
}

interface GetReverseGeocodeResType {
  city?: string
  locality?: string
  principalSubdivision?: string
  [key: string]: unknown
}

type GetReverseGeocodeType = CreateRequestType<GetReverseGeocodeReqType, GetReverseGeocodeResType>

// Create reverse geocoding request
const getReverseGeocode = new GetRequestWithQueryParams<GetReverseGeocodeType>('/data/reverse-geocode-client')

// GitLab API request types
interface GetGitLabMergeRequestsReqType {
  projectId: string
  state?: 'opened' | 'closed' | 'locked' | 'merged'
  per_page?: number
  page?: number
}

interface GitLabMergeRequest {
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

interface GetGitLabMergeRequestsResType extends Array<GitLabMergeRequest> {}

type GetGitLabMergeRequestsType = CreateRequestType<GetGitLabMergeRequestsReqType, GetGitLabMergeRequestsResType>

// Custom GET request class for GitLab API (supports headers via options)
class GetRequestWithHeaders<T extends { params: unknown; response: unknown }> {
  endpoint: string
  options?: RequestInit

  constructor(endpoint: string, options?: RequestInit) {
    this.endpoint = endpoint
    this.options = options
  }

  request = async (params: T['params'] | T['params'][], baseUrl?: string): Promise<T['response']> => {
    try {
      if (!baseUrl) {
        throw new Error('baseUrl is required for this request')
      }

      // APIConstructor spreads params into an array, so extract the first element if it's an array
      const actualParams = Array.isArray(params) ? params[0] : params

      // Construct URL properly using URL constructor for validation
      const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
      let endpoint = this.endpoint.startsWith('/') ? this.endpoint : `/${this.endpoint}`

      // Replace :id placeholder with projectId before constructing URL
      endpoint = endpoint.replace(':id', (actualParams as { projectId?: string })?.projectId || '')

      const baseEndpoint = `${base}${endpoint}`

      // Build query string from params
      const queryParams = new URLSearchParams()
      if (actualParams && typeof actualParams === 'object' && !Array.isArray(actualParams)) {
        Object.entries(actualParams as Record<string, unknown>).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'projectId') {
            queryParams.append(key, String(value))
          }
        })
      }

      // Construct final URL using URL constructor to ensure it's valid
      let url: URL
      try {
        url = new URL(baseEndpoint)
      } catch (urlError) {
        throw new Error(
          `Invalid URL: ${baseEndpoint} - ${urlError instanceof Error ? urlError.message : String(urlError)}`,
        )
      }

      queryParams.forEach((value, key) => {
        url.searchParams.append(key, value)
      })

      const response = await fetch(url.toString(), {
        ...this.options,
        method: 'GET',
        headers: {
          ...this.options?.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      // Re-throw with more context
      throw error instanceof Error ? error : new Error(String(error))
    }
  }
}

// Create GitLab merge requests request
const getGitLabMergeRequests = new GetRequestWithHeaders<GetGitLabMergeRequestsType>(
  '/api/v4/projects/:id/merge_requests',
)

// Export all requests
export default {
  createPost,
  getTimezoneByLocation,
  getWeatherForecast,
  getReverseGeocode,
  getGitLabMergeRequests,
}
