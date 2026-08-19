import api, { normalizeApiError } from './api'

function isBackendUnreachable(error) {
  return error?.status === null
}

// TODO: drop once /api/payments/stk-push is live
function simulateStkPush({ phone, amount }) {
  return new Promise((resolve, reject) => {
    if (!/^0[71]\d{8}$/.test(phone)) {
      reject({ message: 'Enter a valid Safaricom number, e.g. 0712345678', status: 400 })
      return
    }
    setTimeout(() => {
      resolve({
        checkoutRequestId: `sim_${Date.now()}`,
        status: 'pending',
        amount,
        phone,
      })
    }, 900)
  })
}

function simulatePaymentStatus(checkoutRequestId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ checkoutRequestId, status: 'success' })
    }, 3000)
  })
}

export async function initiateStkPush({ orderId, phone, amount }) {
  try {
    const response = await api.post('/payments/stk-push', { order_id: orderId, phone, amount })
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    if (isBackendUnreachable(normalized)) {
      console.warn('[paymentService] backend unreachable, simulating Daraja STK push:', normalized.message)
      return simulateStkPush({ phone, amount })
    }
    console.error('[paymentService] initiateStkPush failed:', normalized)
    throw normalized
  }
}

export async function checkPaymentStatus(checkoutRequestId) {
  try {
    const response = await api.get(`/payments/${checkoutRequestId}/status`)
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    if (isBackendUnreachable(normalized)) {
      console.warn('[paymentService] backend unreachable, simulating payment status check:', normalized.message)
      return simulatePaymentStatus(checkoutRequestId)
    }
    console.error('[paymentService] checkPaymentStatus failed:', normalized)
    throw normalized
  }
}
