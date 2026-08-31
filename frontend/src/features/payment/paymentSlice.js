import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as paymentService from '../../services/paymentService'

const initialState = {
  checkoutRequestId: null,
  phase: 'idle',
  status: null,
  error: null,
}

function getNormalizedPaymentStatus(value) {
  const rawStatus = String(value ?? '').trim().toUpperCase()

  if (['PENDING', 'PROCESSING', 'WAITING', 'INITIATED'].includes(rawStatus)) {
    return 'PENDING'
  }

  if (['SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'PAID'].includes(rawStatus)) {
    return 'COMPLETED'
  }

  if (['FAILED', 'CANCELLED', 'CANCELED', 'TIMEOUT', 'TIMED_OUT', 'EXPIRED'].includes(rawStatus)) {
    return 'FAILED'
  }

  return rawStatus || 'PENDING'
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
      state.status = null
      state.error = null
    },
    paymentTimedOut(state, action) {
      state.phase = 'failed'
      state.status = 'FAILED'
      state.error = action.payload || 'Payment timed out. Please try again.'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startStkPush.pending, (state) => {
        state.phase = 'requesting'
        state.status = 'PENDING'
        state.error = null
      })
      .addCase(startStkPush.fulfilled, (state, action) => {
        const checkoutRequestId = action.payload.checkoutRequestId || action.payload.checkout_request_id
        if (!checkoutRequestId) {
          state.phase = 'failed'
          state.status = 'FAILED'
          state.error = 'The payment request did not return a checkout reference.'
          return
        }
        state.phase = 'pending'
        state.status = 'PENDING'
        state.checkoutRequestId = checkoutRequestId
      })
      .addCase(startStkPush.rejected, (state, action) => {
        state.phase = 'failed'
        state.status = 'FAILED'
        state.error = action.payload
      })
      .addCase(pollPaymentStatus.fulfilled, (state, action) => {
        const normalizedStatus = getNormalizedPaymentStatus(action.payload?.status)
        state.status = normalizedStatus

        if (['COMPLETED'].includes(normalizedStatus)) {
          state.phase = 'success'
          state.error = null
          return
        }

        if (['PENDING'].includes(normalizedStatus)) {
          state.phase = 'pending'
          state.error = null
          return
        }

        state.phase = 'failed'
        state.error = action.payload?.message || 'Payment was not completed. Please try again.'
      })
      .addCase(pollPaymentStatus.rejected, (state, action) => {
        state.phase = 'failed'
        state.status = 'FAILED'
        state.error = action.payload || 'Could not confirm payment status.'
      })
  },
})

export const { resetPayment, paymentTimedOut } = paymentSlice.actions
export default paymentSlice.reducer
