import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as animalService from '../../services/animalService'

const initialState = {
  items: [],
  selectedAnimal: null,
  farmerListings: [],
  filters: {
    type: 'All animals',
    breed: null,
    search: '',
    minAge: null,
    maxAge: null,
  },
  status: 'idle',
  detailStatus: 'idle',
  farmerListingsStatus: 'idle',
  error: null,
}

export const loadAnimals = createAsyncThunk('animals/load', async (filters, { rejectWithValue }) => {
  try {
    return await animalService.fetchAnimals(filters)
  } catch (error) {
    return rejectWithValue(error.message || 'Could not load animals')
  }
})

export const loadAnimalDetail = createAsyncThunk('animals/loadDetail', async (id, { rejectWithValue }) => {
  try {
    return await animalService.fetchAnimalById(id)
  } catch (error) {
    return rejectWithValue(error.message || 'Could not load this listing')
  }
})

export const loadFarmerListings = createAsyncThunk('animals/loadFarmerListings', async (farmerId, { rejectWithValue }) => {
  try {
    return await animalService.fetchFarmerAnimals(farmerId)
  } catch (error) {
    return rejectWithValue(error.message || 'Could not load your listings')
  }
})

export const addAnimal = createAsyncThunk('animals/add', async (payload, { rejectWithValue }) => {
  try {
    return await animalService.createAnimal(payload)
  } catch (error) {
    return rejectWithValue(error.message || 'Could not create this listing')
  }
})

export const editAnimal = createAsyncThunk('animals/edit', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await animalService.updateAnimal(id, payload)
  } catch (error) {
    return rejectWithValue(error.message || 'Could not update this listing')
  }
})

export const removeAnimal = createAsyncThunk('animals/remove', async (id, { rejectWithValue }) => {
  try {
    await animalService.deleteAnimal(id)
    return id
  } catch (error) {
    return rejectWithValue(error.message || 'Could not delete this listing')
  }
})

const animalsSlice = createSlice({
  name: 'animals',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters(state) {
      state.filters = initialState.filters
    },
    clearAnimalsError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAnimals.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadAnimals.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const payload = Array.isArray(action.payload) ? action.payload : []
        state.items = payload.filter((animal) => animal?.available === true)
      })
      .addCase(loadAnimals.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(loadAnimalDetail.pending, (state) => {
        state.detailStatus = 'loading'
        state.error = null
      })
      .addCase(loadAnimalDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.selectedAnimal = action.payload
      })
      .addCase(loadAnimalDetail.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.error = action.payload
      })
      .addCase(loadFarmerListings.pending, (state) => {
        state.farmerListingsStatus = 'loading'
      })
      .addCase(loadFarmerListings.fulfilled, (state, action) => {
        state.farmerListingsStatus = 'succeeded'
        state.farmerListings = action.payload
      })
      .addCase(loadFarmerListings.rejected, (state, action) => {
        state.farmerListingsStatus = 'failed'
        state.error = action.payload
      })
      .addCase(addAnimal.fulfilled, (state, action) => {
        state.farmerListings.unshift(action.payload)
      })
      .addCase(addAnimal.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(editAnimal.fulfilled, (state, action) => {
        const index = state.farmerListings.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) state.farmerListings[index] = action.payload
      })
      .addCase(editAnimal.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(removeAnimal.fulfilled, (state, action) => {
        state.farmerListings = state.farmerListings.filter((a) => a.id !== action.payload)
      })
      .addCase(removeAnimal.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { setFilters, clearFilters, clearAnimalsError } = animalsSlice.actions
export default animalsSlice.reducer
