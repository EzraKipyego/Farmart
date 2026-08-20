import api, { normalizeApiError } from './api'
import { mockAnimals } from '../data/mockAnimals'

const LOCAL_LISTINGS_KEY = 'farmart_local_listings'

function isBackendUnreachable(error) {
  return error?.status === null
}

function loadLocalListings() {
  try {
    const raw = localStorage.getItem(LOCAL_LISTINGS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error('[animalService] failed to parse local listings, resetting store:', error)
    return []
  }
}

function saveLocalListings(listings) {
  try {
    localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(listings))
  } catch (error) {
    console.error('[animalService] failed to persist local listings:', error)
  }
}

function getAllAnimals() {
  return [...loadLocalListings(), ...mockAnimals]
}

export async function fetchAnimals(filters = {}) {
  try {
    const params = {}
    if (filters.type && filters.type !== 'All animals') params.type = filters.type
    if (filters.breed) params.breed = filters.breed
    if (filters.search) params.search = filters.search
    if (filters.minAge != null) params.min_age = filters.minAge
    if (filters.maxAge != null) params.max_age = filters.maxAge
    if (filters.minPrice != null) params.min_price = filters.minPrice
    if (filters.maxPrice != null) params.max_price = filters.maxPrice

    const response = await api.get('/animals', { params })
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    if (isBackendUnreachable(normalized)) {
      console.warn('[animalService] backend unreachable, using local sample data:', normalized.message)
      return filterMockAnimals(filters)
    }
    console.error('[animalService] fetchAnimals failed:', normalized)
    throw normalized
  }
}

export async function fetchAnimalById(id) {
  try {
    const response = await api.get(`/animals/${id}`)
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    if (isBackendUnreachable(normalized)) {
      console.warn('[animalService] backend unreachable, using local sample data:', normalized.message)
      const found = getAllAnimals().find((a) => a.id === id)
      if (!found) throw { message: 'Animal not found', status: 404 }
      return found
    }
    console.error('[animalService] fetchAnimalById failed:', normalized)
    throw normalized
  }
}

export async function createAnimal(payload) {
  try {
    const response = await api.post('/animals', payload)
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    if (isBackendUnreachable(normalized)) {
      console.warn('[animalService] backend unreachable, saving listing locally:', normalized.message)
      const listings = loadLocalListings()
      const newAnimal = {
        ...payload,
        id: `local_${Date.now()}`,
        verified: false,
        vaccinated: false,
        healthCertified: false,
        farmerRating: null,
        createdAt: new Date().toISOString().slice(0, 10),
      }
      listings.unshift(newAnimal)
      saveLocalListings(listings)
      return newAnimal
    }
    console.error('[animalService] createAnimal failed:', normalized)
    throw normalized
  }
}

export async function updateAnimal(id, payload) {
  try {
    const response = await api.put(`/animals/${id}`, payload)
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    if (isBackendUnreachable(normalized)) {
      console.warn('[animalService] backend unreachable, updating listing locally:', normalized.message)
      const listings = loadLocalListings()
      const index = listings.findIndex((a) => a.id === id)
      if (index === -1) {
        throw { message: 'This listing was created before local storage was cleared and can no longer be edited.', status: 404 }
      }
      listings[index] = { ...listings[index], ...payload, id }
      saveLocalListings(listings)
      return listings[index]
    }
    console.error('[animalService] updateAnimal failed:', normalized)
    throw normalized
  }
}

export async function deleteAnimal(id) {
  try {
    const response = await api.delete(`/animals/${id}`)
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    if (isBackendUnreachable(normalized)) {
      console.warn('[animalService] backend unreachable, deleting listing locally:', normalized.message)
      const listings = loadLocalListings().filter((a) => a.id !== id)
      saveLocalListings(listings)
      return { id, deleted: true }
    }
    console.error('[animalService] deleteAnimal failed:', normalized)
    throw normalized
  }
}

export async function fetchFarmerAnimals(farmerId) {
  try {
    const response = await api.get('/farmer/animals', { params: { farmer_id: farmerId } })
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    if (isBackendUnreachable(normalized)) {
      console.warn('[animalService] backend unreachable, using local sample data:', normalized.message)
      return getAllAnimals().filter((a) => a.farmerId === farmerId)
    }
    console.error('[animalService] fetchFarmerAnimals failed:', normalized)
    throw normalized
  }
}

function filterMockAnimals(filters) {
  return getAllAnimals().filter((animal) => {
    if (filters.type && filters.type !== 'All animals' && animal.type !== filters.type) return false
    if (filters.breed && animal.breed !== filters.breed) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const haystack = `${animal.type} ${animal.breed} ${animal.title}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (filters.minAge != null && animal.age < filters.minAge) return false
    if (filters.maxAge != null && animal.age > filters.maxAge) return false
    return true
  })
}