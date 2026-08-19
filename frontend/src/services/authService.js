import api, { normalizeApiError } from './api'

const TOKEN_KEY = 'farmart_token'
const USER_KEY = 'farmart_user'
const MOCK_USERS_KEY = 'farmart_mock_users'

function isBackendUnreachable(error) {
  return error?.status === null
}

function loadMockUsers() {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error('[authService] failed to parse mock users, resetting store:', error)
    return []
  }
}

function saveMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
}

function mockRegister({ name, email, password, role, phone, county }) {
  const users = loadMockUsers()
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

  if (existing) {
    throw { message: 'An account with this email already exists', status: 409 }
  }

  const user = {
    id: `local_${Date.now()}`,
    name,
    email,
    password,
    role,
    phone: phone || '',
    county: county || '',
  }

  users.push(user)
  saveMockUsers(users)

  const { password: _password, ...safeUser } = user
  return {
    token: `mock.${btoa(email)}.${Date.now()}`,
    user: safeUser,
  }
}

function mockLogin({ email, password }) {
  const users = loadMockUsers()
  const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

  if (!match || match.password !== password) {
    throw { message: 'Incorrect email or password', status: 401 }
  }

  const { password: _password, ...safeUser } = match
  return {
    token: `mock.${btoa(email)}.${Date.now()}`,
    user: safeUser,
  }
}

export async function register(payload) {
  try {
    const response = await api.post('/auth/register', payload)
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    if (isBackendUnreachable(normalized)) {
      console.warn('[authService] backend unreachable, registering locally:', normalized.message)
      return mockRegister(payload)
    }
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
    if (isBackendUnreachable(normalized)) {
      console.warn('[authService] backend unreachable, checking local accounts:', normalized.message)
      return mockLogin(payload)
    }
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
    if (isBackendUnreachable(normalized)) {
      console.warn('[authService] backend unreachable, applying profile update locally:', normalized.message)
      return payload
    }
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
