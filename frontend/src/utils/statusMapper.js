/**
 * Normalize backend order statuses to the buyer-facing values the UI needs.
 * Backend contract: accepted, dispatched, delivered, cancelled, pending_payment, processing
 */
export function normalizeBackendOrderStatus(backendStatus) {
  if (backendStatus === null || backendStatus === undefined) return 'pending'

  const normalized = String(backendStatus).trim().toLowerCase().replace(/\s+/g, '_')

  if (['accepted', 'dispatched', 'delivered'].includes(normalized)) return 'completed'
  if (['cancelled', 'rejected'].includes(normalized)) return 'rejected'
  if (normalized === 'pending_payment') return 'pending payment'
  if (normalized === 'processing') return 'processing'
  if (normalized === 'pending') return 'pending'

  return normalized || 'pending'
}

export function mapBuyerOrderStatus(backendStatus) {
  return normalizeBackendOrderStatus(backendStatus)
}

export function getBuyerStatusLabel(backendStatus) {
  const mapped = mapBuyerOrderStatus(backendStatus)

  const labelMap = {
    completed: 'Completed',
    rejected: 'Rejected',
    'pending payment': 'Pending payment',
    processing: 'Processing',
    pending: 'Pending',
  }

  return labelMap[mapped] || mapped.charAt(0).toUpperCase() + mapped.slice(1)
}

export function getStatusStyles(status) {
  const statusMap = {
    completed: 'bg-[#2dd4a7]/10 text-[#2dd4a7]',
    rejected: 'bg-[#f87171]/10 text-[#f87171]',
    'pending payment': 'bg-[#facc15]/10 text-[#facc15]',
    processing: 'bg-[#facc15]/10 text-[#facc15]',
    pending: 'bg-[#facc15]/10 text-[#facc15]',
    accepted: 'bg-[#2dd4a7]/10 text-[#2dd4a7]',
  }

  return statusMap[String(status || '').toLowerCase()] || 'bg-[#1c2129] text-[#8b95a1]'
}
