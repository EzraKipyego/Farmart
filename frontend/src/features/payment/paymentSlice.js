import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as paymentService from '../../services/paymentService'

const initialState = {
  checkoutRequestId: null,
  phase: 'idle',
  error: null,
}

export const startStkPush = createAsyncThunk(
  'payment/startStkPush',
  async ({ orderId, phone, amount }, { rejectWithValue }) => {
    try {
      return await paymentService.initiateStkPush({ orderId, phone, amount })
    } catch (error) {
      return rejectWithValue(error.message || 'Could not start the payment request')
    }
  },
)

export const pollPaymentStatus = createAsyncThunk(
  'payment/pollStatus',
  async (checkoutRequestId, { rejectWithValue }) => {
    try {
      return await paymentService.checkPaymentStatus(checkoutRequestId)
    } catch (error) {
      return rejectWithValue(error.message || 'Could not confirm payment status')
    }
  },
)

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPayment(state) {
      state.checkoutRequestId = null
      state.phase = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startStkPush.pending, (state) => {
        state.phase = 'requesting'
        state.error = null
      })
      .addCase(startStkPush.fulfilled, (state, action) => {
        state.phase = 'pending'
        state.checkoutRequestId = action.payload.checkoutRequestId
      })
      .addCase(startStkPush.rejected, (state, action) => {
        state.phase = 'failed'
        state.error = action.payload
      })
      .addCase(pollPaymentStatus.fulfilled, (state, action) => {
        state.phase = action.payload.status === 'success' ? 'success' : 'failed'
        if (action.payload.status !== 'success') {
          state.error = 'Payment was not completed. Try again.'
        }
      })
      .addCase(pollPaymentStatus.rejected, (state, action) => {
        state.phase = 'failed'
        state.error = action.payload
      })
  },
})

export const { resetPayment } = paymentSlice.actions
export default paymentSlice.reducer
