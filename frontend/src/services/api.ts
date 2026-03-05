import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios, { AxiosError } from 'axios'
import { clearAccessToken, getAccessToken, setAccessToken } from '../storage'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean
  }
}

interface FailedQueueItem {
  resolve: (value: AxiosResponse | PromiseLike<AxiosResponse>) => void
  reject: (error: unknown) => void
}

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: FailedQueueItem[] = []

const processQueue = (error: unknown | null = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token as unknown as AxiosResponse)
    }
  })
  failedQueue = []
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (
    error: AxiosError<unknown, unknown> & { config?: AxiosRequestConfig & { _retry?: boolean } },
  ) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest?.skipAuthRefresh &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await api.post<{ accessToken: string }>('/refresh')

        setAccessToken(data.accessToken)

        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`

        processQueue(null, data.accessToken)
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        clearAccessToken()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
