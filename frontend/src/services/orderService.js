import api, { normalizeApiError } from './api'
import { mockBuyerOrders, mockFarmerOrders } from '../data/mockOrders'

function isBackendUnreachable(error) {
  return error?.status === null
}

export async function checkout({ items, deliveryDetails }) {
  try {
    const response = await api.post('/checkout', { items, delivery_details: deliveryDetails })
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
    if (isBackendUnreachable(normalized)) {
      console.warn('[orderService] backend unreachable, using local sample data:', normalized.message)
      return mockBuyerOrders
    }
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
    if (isBackendUnreachable(normalized)) {
      console.warn('[orderService] backend unreachable, using local sample data:', normalized.message)
      return mockFarmerOrders
    }
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
    if (isBackendUnreachable(normalized)) {
      console.warn('[orderService] backend unreachable, simulating status update locally:', normalized.message)
      return { id: orderId, status }
    }
    console.error('[orderService] updateOrderStatus failed:', normalized)
    throw normalized
  }
}
