import { createSlice } from '@reduxjs/toolkit'

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem('farmart_cart')
    const items = raw ? JSON.parse(raw) : []
    return Array.isArray(items) ? items.filter((item) => item?.available !== false) : []
  } catch (error) {
    console.error('[cartSlice] failed to parse stored cart, resetting it:', error)
    return []
  }
}

function persistCart(items) {
  try {
    localStorage.setItem('farmart_cart', JSON.stringify(items))
  } catch (error) {
    console.error('[cartSlice] failed to persist cart:', error)
  }
}

const initialState = {
  items: loadCartFromStorage(),
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const animal = action.payload
      if (animal?.available === false) {
        state.items = state.items.filter((item) => item.animalId !== animal.id)
        persistCart(state.items)
        return
      }

      const existing = state.items.find((item) => item.animalId === animal.id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({
          animalId: animal.id,
          title: animal.title,
          breed: animal.breed,
          type: animal.type,
          price: animal.price,
          location: animal.location,
          farmerId: animal.farmerId,
          image: animal.image || '',
          available: animal.available,
          quantity: 1,
        })
      }
      persistCart(state.items)
    },
    incrementQuantity(state, action) {
      const item = state.items.find((i) => i.animalId === action.payload)
      if (item) item.quantity += 1
      persistCart(state.items)
    },
    decrementQuantity(state, action) {
      const item = state.items.find((i) => i.animalId === action.payload)
      if (item && item.quantity > 1) item.quantity -= 1
      persistCart(state.items)
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.animalId !== action.payload)
      persistCart(state.items)
    },
    clearCart(state) {
      state.items = []
      persistCart(state.items)
    },
  },
})

export const { addToCart, incrementQuantity, decrementQuantity, removeFromCart, clearCart } = cartSlice.actions

export const selectCartItems = (state) => state.cart.items
export const selectCartCount = (state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
export const selectCartTotal = (state) => state.cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0)

export default cartSlice.reducer