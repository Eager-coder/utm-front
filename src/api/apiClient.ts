import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'

const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10s, adjust as needed
  })

  // Request interceptor: add auth token if present
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  // Response interceptor: unwrap data or handle errors globally
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      // optional: global error handling
      console.error('API error:', error.response?.status, error.response?.data)
      return Promise.reject(error)
    },
  )

  return client
}

// Instantiate with your base URL (could come from env)
export const apiClient = createApiClient(import.meta.env.VITE_API_URL)

export default apiClient
