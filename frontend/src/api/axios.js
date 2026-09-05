import axios from 'axios'

// Base instance: cookie auth (httpOnly accessToken/refreshToken set by the
// backend), so every request must carry credentials.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

// Requests that must never trigger a refresh-and-retry themselves, or the
// interceptor below would loop.
const AUTH_FREE_PATHS = ['/users/login', '/users/signup', '/users/refresh-token']

let isRefreshing = false
let pendingRequests = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    const isAuthFreePath = AUTH_FREE_PATHS.some((path) => config?.url?.includes(path))

    if (response?.status !== 401 || isAuthFreePath || config._retried) {
      return Promise.reject(error)
    }

    config._retried = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject })
      }).then(() => api(config))
    }

    isRefreshing = true

    try {
      await api.post('/users/refresh-token')
      pendingRequests.forEach(({ resolve }) => resolve())
      pendingRequests = []
      return api(config)
    } catch (refreshError) {
      pendingRequests.forEach(({ reject }) => reject(refreshError))
      pendingRequests = []
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
