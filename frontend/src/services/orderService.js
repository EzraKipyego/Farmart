import api, { normalizeApiError } from './api'

export async function checkout({ items, deliveryDetails, idempotencyKey }) {
  try {
    const response = await api.post(
      '/checkout',
      { items, delivery_details: deliveryDetails },
      { headers: { 'Idempotency-Key': idempotencyKey } },
    )
    return response.data
  } catch (error) {
    console.error('[orderService] checkout failed:', error)
    throw normalizeApiError(error)
  }
}

export async function fetchBuyerOrders() {
  try {
    const response = await api.get('/orders')
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    console.error('[orderService] fetchBuyerOrders failed:', normalized)
    throw normalized
  }
}

export async function fetchFarmerOrders() {
  try {
    const response = await api.get('/farmer/orders')
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    console.error('[orderService] fetchFarmerOrders failed:', normalized)
    throw normalized
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const response = await api.patch(`/orders/${orderId}`, { status })
    return response.data
  } catch (error) {
    const normalized = normalizeApiError(error)
    console.error('[orderService] updateOrderStatus failed:', normalized)
    throw normalized
  }
}
