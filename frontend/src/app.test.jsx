import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import cartReducer, {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} from './features/cart/cartSlice'
import animalsReducer, { setFilters, clearFilters } from './features/animals/animalsSlice'
import AnimalCard from './Components/animals/AnimalCard'

const sampleAnimal = {
  id: 'an_1042',
  type: 'Cattle',
  breed: 'Friesian',
  title: 'High-yield dairy cow',
  age: 3,
  ageUnit: 'years',
  price: 85000,
  location: 'Nakuru county',
  verified: true,
  farmerRating: 4.9,
}

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('cartSlice', () => {
  it('adds a new animal to an empty cart', () => {
    const state = cartReducer({ items: [] }, addToCart(sampleAnimal))
    expect(state.items).toHaveLength(1)
    expect(state.items[0]).toMatchObject({ animalId: 'an_1042', quantity: 1 })
  })

  it('increments quantity instead of duplicating when adding the same animal twice', () => {
    let state = cartReducer({ items: [] }, addToCart(sampleAnimal))
    state = cartReducer(state, addToCart(sampleAnimal))
    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(2)
  })

  it('does not let quantity drop below 1', () => {
    let state = cartReducer({ items: [] }, addToCart(sampleAnimal))
    state = cartReducer(state, decrementQuantity('an_1042'))
    expect(state.items[0].quantity).toBe(1)
  })

  it('removes an item from the cart', () => {
    let state = cartReducer({ items: [] }, addToCart(sampleAnimal))
    state = cartReducer(state, removeFromCart('an_1042'))
    expect(state.items).toHaveLength(0)
  })

  it('increments quantity via incrementQuantity', () => {
    let state = cartReducer({ items: [] }, addToCart(sampleAnimal))
    state = cartReducer(state, incrementQuantity('an_1042'))
    expect(state.items[0].quantity).toBe(2)
  })
})

describe('animalsSlice', () => {
  const baseState = {
    items: [],
    selectedAnimal: null,
    farmerListings: [],
    filters: { type: 'All animals', breed: null, search: '', minAge: null, maxAge: null },
    status: 'idle',
    detailStatus: 'idle',
    farmerListingsStatus: 'idle',
    error: null,
  }

  it('merges partial filter updates without dropping existing filters', () => {
    const state = animalsReducer(baseState, setFilters({ type: 'Cattle' }))
    expect(state.filters.type).toBe('Cattle')
    expect(state.filters.search).toBe('')
  })

  it('resets filters back to defaults on clearFilters', () => {
    const withFilters = animalsReducer(baseState, setFilters({ type: 'Goats', breed: 'Boer' }))
    const cleared = animalsReducer(withFilters, clearFilters())
    expect(cleared.filters).toEqual(baseState.filters)
  })
})

describe('AnimalCard', () => {
  it('renders the animal title, breed, and formatted price', () => {
    renderWithRouter(<AnimalCard animal={sampleAnimal} />)
    expect(screen.getByText('High-yield dairy cow')).toBeInTheDocument()
    expect(screen.getByText('Friesian')).toBeInTheDocument()
    expect(screen.getByText('KSh 85,000')).toBeInTheDocument()
  })

  it('links to the animal detail page', () => {
    renderWithRouter(<AnimalCard animal={sampleAnimal} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/animals/an_1042')
  })

  it('shows a verified badge when the listing is verified', () => {
    renderWithRouter(<AnimalCard animal={sampleAnimal} />)
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })
})
