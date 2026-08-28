import api, { normalizeApiError } from './api'

const TOKEN_KEY = 'farmart_token'
const USER_KEY = 'farmart_user'

export async function register(payload) {
  try {
    const response = await api.post('/auth/register', payload)
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    console.error('[authService] register failed:', normalized)
    throw normalized
  }
}

export async function login(payload) {
  try {
    const response = await api.post('/auth/login', payload)
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    console.error('[authService] login failed:', normalized)
    throw normalized
  }
}

export async function fetchProfile() {
  try {
    const response = await api.get('/profile')
    return response.data
  } catch (error) {
    console.error('[authService] fetchProfile failed:', error)
    throw normalizeApiError(error)
  }
}

export async function updateProfile(payload) {
  try {
    const response = await api.put('/profile', payload)
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    console.error('[authService] updateProfile failed:', normalized)
    throw normalized
  }
}

export function persistSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function loadSession() {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const rawUser = localStorage.getItem(USER_KEY)
    if (!token || !rawUser) return null
    return { token, user: JSON.parse(rawUser) }
  } catch (error) {
    console.error('[authService] failed to parse stored session, clearing it:', error)
    clearSession()
    return null
  }
}
