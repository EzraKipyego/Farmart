import api, { normalizeApiError } from './api'

function normalizePaymentError(error) {
  if (error?.status !== undefined && error?.message) {
    return error
  }
  return normalizeApiError(error)
}

export async function initiateStkPush({ orderId, phone, amount }) {
  try {
    // Ensure payload conforms to backend expectations: clean phone and integer amount
    const normalizedPhone = String(phone || '').replace(/\s+/g, '').replace(/^\+/, '')
    const cleanedPhone = normalizedPhone.startsWith('0') ? `254${normalizedPhone.slice(1)}` : normalizedPhone
    const roundedAmount = Math.round(Number(amount))

    const payload = { order_id: orderId, phone: cleanedPhone, amount: roundedAmount }
    console.log('Sending Payload:', payload)

    const response = await api.post('/payments/stk-push', payload)
    return response.data
  } catch (error) {
    const normalized = normalizePaymentError(error)
    // Log backend 400 details for easier diagnosis in production
    console.error('[paymentService] initiateStkPush failed:', normalized)
    console.error('Backend 400 Error Details:', error.response?.data)
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
