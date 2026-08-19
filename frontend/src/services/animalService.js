import api, { normalizeApiError } from './api'
import { mockAnimals } from '../data/mockAnimals'

function isBackendUnreachable(error) {
  return error?.status === null
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
      const found = mockAnimals.find((a) => a.id === id)
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
    console.error('[animalService] createAnimal failed:', error)
    throw normalizeApiError(error)
  }
}

export async function updateAnimal(id, payload) {
  try {
    const response = await api.put(`/animals/${id}`, payload)
    return response.data
  } catch (error) {
    console.error('[animalService] updateAnimal failed:', error)
    throw normalizeApiError(error)
  }
}

export async function deleteAnimal(id) {
  try {
    const response = await api.delete(`/animals/${id}`)
    return response.data
  } catch (error) {
    console.error('[animalService] deleteAnimal failed:', error)
    throw normalizeApiError(error)
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
      return mockAnimals.filter((a) => a.farmerId === farmerId)
    }
    console.error('[animalService] fetchFarmerAnimals failed:', normalized)
    throw normalized
  }
}

function filterMockAnimals(filters) {
  return mockAnimals.filter((animal) => {
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
