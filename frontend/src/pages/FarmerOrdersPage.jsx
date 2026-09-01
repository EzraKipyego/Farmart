import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ClipboardList, Loader2, Check, X } from 'lucide-react'
import { loadFarmerOrders, respondToOrder } from '../features/orders/ordersSlice'
import Spinner from '../components/common/Spinner'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import { getStatusStyles } from '../utils/statusMapper'

function FarmerOrdersPage() {
  const dispatch = useDispatch()
  const { farmerOrders, farmerOrdersStatus, error } = useSelector((state) => state.orders)
  const [respondingId, setRespondingId] = useState(null)

  useEffect(() => {
    dispatch(loadFarmerOrders())
  }, [dispatch])

  async function handleRespond(orderId, responseStatus) {
    setRespondingId(orderId)
    try {
      await dispatch(respondToOrder({ orderId, status: responseStatus })).unwrap()
    } catch (err) {
      console.error(`[FarmerOrdersPage] failed to ${responseStatus} order ${orderId}:`, err)
    } finally {
      setRespondingId(null)
    }
  }

  return (
    <div className="px-4 sm:px-6 pt-4 pb-24 sm:pb-10 max-w-xl mx-auto">
      <h1 className="text-base font-medium text-[#f5f5f0] mb-5">Orders</h1>

      {farmerOrdersStatus === 'loading' && <Spinner label="Loading orders" />}

      {farmerOrdersStatus === 'failed' && <ErrorState message={error} onRetry={() => dispatch(loadFarmerOrders())} />}

      {farmerOrdersStatus === 'succeeded' && farmerOrders.length === 0 && (
        <EmptyState icon={ClipboardList} title="No orders yet" description="Orders from buyers will appear here." />
      )}

      {farmerOrdersStatus === 'succeeded' && farmerOrders.length > 0 && (
        <div className="flex flex-col gap-3">
          {farmerOrders.map((order) => {
            const isAwaitingDecision = ['pending', 'pending_payment', 'processing'].includes(String(order.status || '').toLowerCase())
            return (
              <div key={order.id} className="bg-[#161b22] border border-[#1f2937] rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-[#f5f5f0]">Order: {order.items?.[0]?.title || order.id}</p>
                    <p className="text-[10px] text-[#5f6b7a]">Reference #{order.id}</p>
                    <p className="text-[11px] text-[#8b95a1]">{order.buyerName}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-md capitalize ${getStatusStyles(order.status)}`}>
                    {String(order.status || '').replace(/_/g, ' ')}
                  </span>
                </div>

                {order.items.map((item) => (
                  <div key={item.animalId || item.id || `${order.id}-${item.title}`} className="py-2 border-t border-[#1f2937] first:border-t-0">
                    {item.image && <img src={item.image} alt={item.title || 'Order item'} className="w-full h-32 object-cover rounded mb-2" />}
                    <p className="text-sm text-[#f5f5f0] font-medium">{item.title}</p>
                    {item.description && <p className="text-xs text-[#8b95a1] mt-0.5">{item.description}</p>}
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-[#8b95a1]">Qty: {item.quantity}</span>
                      <span className="text-sm text-[#f5f5f0] font-medium">KSh {Math.round(item.price).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#1f2937]">
                      <span className="text-[10px] text-[#8b95a1]">Status</span>
                      <span className={`text-[10px] px-2 py-1 rounded-md ${getStatusStyles(item.status || order.status)}`}>
                        {String(item.status || order.status || 'pending').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}

                <p className="text-sm text-[#f5f5f0] font-medium mt-3 mb-3">KSh {Math.round(order.total).toLocaleString()}</p>

                {isAwaitingDecision && (
                  <div className="flex gap-2 pt-3 border-t border-[#1f2937]">
                    <button
                      onClick={() => handleRespond(order.id, 'accepted')}
                      disabled={respondingId === order.id}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#2dd4a7]/20 border border-[#2dd4a7] text-[#2dd4a7] text-xs font-medium py-2 rounded-lg outline-none hover:bg-[#2dd4a7]/30 transition-colors focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {respondingId === order.id && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                      {respondingId !== order.id && <Check size={14} aria-hidden="true" />}
                      Accept Order
                    </button>
                    <button
                      onClick={() => handleRespond(order.id, 'rejected')}
                      disabled={respondingId === order.id}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#f87171]/20 border border-[#f87171]/60 text-[#f87171] text-xs font-medium py-2 rounded-lg outline-none hover:bg-[#f87171]/30 transition-colors focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {respondingId === order.id && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                      {respondingId !== order.id && <X size={14} aria-hidden="true" />}
                      Reject Order
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FarmerOrdersPage
