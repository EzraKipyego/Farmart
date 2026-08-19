import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import animalsReducer from '../features/animals/animalsSlice'
import cartReducer from '../features/cart/cartSlice'
import ordersReducer from '../features/orders/ordersSlice'
import paymentReducer from '../features/payment/paymentSlice'
import { IS_DEV } from '../config/env'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    animals: animalsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    payment: paymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['auth.error', 'orders.error', 'animals.error'],
      },
    }),
})

if (IS_DEV) {
  store.subscribe(() => {
    const state = store.getState()
    if (state.auth.error) console.error('[store] auth error:', state.auth.error)
    if (state.animals.error) console.error('[store] animals error:', state.animals.error)
    if (state.orders.error) console.error('[store] orders error:', state.orders.error)
    if (state.payment.error) console.error('[store] payment error:', state.payment.error)
  })
}
