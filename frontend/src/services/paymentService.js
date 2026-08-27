import api, { normalizeApiError } from './api'

function normalizePaymentError(error) {
  if (error?.status !== undefined && error?.message) {
    return error
  }
  return normalizeApiError(error)
}

export async function initiateStkPush({ orderId, phone, amount }) {
  try {
    const response = await api.post('/payments/stk-push', { order_id: orderId, phone, amount })
    return response.data
  } catch (error) {
    const normalized = normalizePaymentError(error)
    console.error('[paymentService] initiateStkPush failed:', normalized)
    throw normalized
  }
}

export async function checkPaymentStatus(checkoutRequestId) {
  try {
    const response = await api.get(`/payments/${checkoutRequestId}/status`)
    return response.data
  } catch (error) {
    const normalized = normalizePaymentError(error)
    console.error('[paymentService] checkPaymentStatus failed:', normalized)
    throw normalized
  }
}
