import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as orderService from '../../services/orderService'

const initialState = {
  buyerOrders: [],
  farmerOrders: [],
  lastCheckoutOrder: null,
  status: 'idle',
  farmerOrdersStatus: 'idle',
  checkoutStatus: 'idle',
  error: null,
}

export const submitCheckout = createAsyncThunk('orders/checkout', async (payload, { rejectWithValue }) => {
  try {
    return await orderService.checkout(payload)
  } catch (error) {
    return rejectWithValue(error.message || 'Checkout failed, try again')
  }
})

export const loadBuyerOrders = createAsyncThunk('orders/loadBuyer', async (_, { rejectWithValue }) => {
  try {
    return await orderService.fetchBuyerOrders()
  } catch (error) {
    return rejectWithValue(error.message || 'Could not load your orders')
  }
})

export const loadFarmerOrders = createAsyncThunk('orders/loadFarmer', async (_, { rejectWithValue }) => {
  try {
    return await orderService.fetchFarmerOrders()
  } catch (error) {
    return rejectWithValue(error.message || 'Could not load orders')
  }
})

export const respondToOrder = createAsyncThunk(
  'orders/respond',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      return await orderService.updateOrderStatus(orderId, status)
    } catch (error) {
      return rejectWithValue(error.message || 'Could not update this order')
    }
  },
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrdersError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitCheckout.pending, (state) => {
        state.checkoutStatus = 'loading'
        state.error = null
      })
      .addCase(submitCheckout.fulfilled, (state, action) => {
        state.checkoutStatus = 'succeeded'
        state.lastCheckoutOrder = action.payload
      })
      .addCase(submitCheckout.rejected, (state, action) => {
        state.checkoutStatus = 'failed'
        const payload = action.payload || {}
        const code = payload.code || payload?.details?.code
        const message = payload.message || payload?.details?.message || 'Could not complete checkout'

        if (code === 'ANIMAL_ALREADY_PURCHASED') {
          state.error = 'This animal has already been purchased.'
          return
        }

        state.error = message
      })
      .addCase(loadBuyerOrders.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(loadBuyerOrders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.buyerOrders = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.orders)
            ? action.payload.orders
            : Array.isArray(action.payload?.data)
              ? action.payload.data
              : []
      })
      .addCase(loadBuyerOrders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(loadFarmerOrders.pending, (state) => {
        state.farmerOrdersStatus = 'loading'
      })
      .addCase(loadFarmerOrders.fulfilled, (state, action) => {
        state.farmerOrdersStatus = 'succeeded'
        state.farmerOrders = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.orders)
            ? action.payload.orders
            : Array.isArray(action.payload?.data)
              ? action.payload.data
              : []
      })
      .addCase(loadFarmerOrders.rejected, (state, action) => {
        state.farmerOrdersStatus = 'failed'
        state.error = action.payload
      })
      .addCase(respondToOrder.fulfilled, (state, action) => {
        const updatedOrder = action.payload?.order || action.payload
        const orderId = updatedOrder?.id || action.payload?.orderId || action.payload?.order_id

        if (!orderId) return

        const order = state.farmerOrders.find((o) => o.id === orderId)
        if (order) {
          order.status = updatedOrder.status || order.status
        }
      })
      .addCase(respondToOrder.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearOrdersError } = ordersSlice.actions
export default ordersSlice.reducer
