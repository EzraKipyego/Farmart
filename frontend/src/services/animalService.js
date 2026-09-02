import api, { normalizeApiError } from './api'

export async function fetchAnimals(filters = {}) {
  try {
    const params = {}
    if (filters.type && filters.type !== 'All animals') params.type = filters.type
    if (filters.breed) params.breed = filters.breed
    if (filters.search) params.search = filters.search
    if (filters.minAge != null) params.min_age = filters.minAge
    if (filters.maxAge != null) params.max_age = filters.maxAge

    const response = await api.get('/animals', { params })
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
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
    console.error('[animalService] fetchFarmerAnimals failed:', normalized)
    throw normalized
  }
}