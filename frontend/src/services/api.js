import axios from 'axios'
import { API_BASE_URL } from '../config/env'

const baseURL = API_BASE_URL
const publicAuthPaths = ['/auth/login', '/auth/register', '/auth/password-reset']

function isPublicAuthRequest(url) {
  return publicAuthPaths.some((path) => url?.startsWith(path))
}

export const api = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('farmart_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Debug: log whether Authorization header will be sent for payment requests
    try {
      if (config.url && config.url.includes('/payments/stk-push')) {
        // do not log the token itself, just its presence
        // eslint-disable-next-line no-console
        console.debug('[api] /payments/stk-push Authorization present:', !!config.headers.Authorization)
      }
    } catch (e) {
      /* ignore */
    }
    return config
  },
  (error) => {
    console.error('[api] Request setup failed:', error)
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url

    if (status === 401 && !isPublicAuthRequest(url)) {
      console.warn(`[api] 401 unauthorized on ${url} — clearing session`)
      localStorage.removeItem('farmart_token')
      localStorage.removeItem('farmart_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      console.warn(`[api] 403 forbidden on ${url}`)
    } else if (status >= 500) {
      console.error(`[api] Server error (${status}) on ${url}:`, error.response?.data)
    } else if (!error.response) {
      console.error(`[api] Network error calling ${url} — is the backend running at ${baseURL}?`, error.message)
    }

    return Promise.reject(normalizeApiError(error))
  },
)

export function normalizeApiError(error) {
  if (error?.status !== undefined && error?.message) {
    return error
  }
  if (error.response) {
    return {
      message: error.response.data?.message || error.response.data?.error || 'Something went wrong. Try again.',
      status: error.response.status,
      details: error.response.data,
    }
  }
  if (error.request) {
    return {
      message: 'Could not reach the server. Check your connection and try again.',
      status: null,
      details: null,
    }
  }
  return {
    message: error.message || 'An unexpected error occurred.',
    status: null,
    details: null,
  }
}

export default api
