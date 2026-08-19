import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ClipboardList, Loader2 } from 'lucide-react'
import { loadFarmerOrders, respondToOrder } from '../features/orders/ordersSlice'
import Spinner from '../components/common/Spinner'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

const statusStyles = {
  pending: 'bg-[#facc15]/10 text-[#facc15]',
  confirmed: 'bg-[#2dd4a7]/10 text-[#2dd4a7]',
  rejected: 'bg-[#f87171]/10 text-[#f87171]',
}

function FarmerOrdersPage() {
  const dispatch = useDispatch()
  const { farmerOrders, farmerOrdersStatus, error } = useSelector((state) => state.orders)
  const [respondingId, setRespondingId] = useState(null)

  useEffect(() => {
    dispatch(loadFarmerOrders())
  }, [dispatch])

  async function handleRespond(orderId, status) {
    setRespondingId(orderId)
    try {
      await dispatch(respondToOrder({ orderId, status })).unwrap()
    } catch (err) {
      console.error(`[FarmerOrdersPage] failed to ${status} order ${orderId}:`, err)
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
          {farmerOrders.map((order) => (
            <div key={order.id} className="bg-[#161b22] border border-[#1f2937] rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-[#f5f5f0]">Order #{order.id}</p>
                  <p className="text-[11px] text-[#8b95a1]">{order.buyerName}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-md capitalize ${statusStyles[order.status] || 'bg-[#1c2129] text-[#8b95a1]'}`}>
                  {order.status}
                </span>
              </div>

              {order.items.map((item) => (
                <p key={item.animalId} className="text-xs text-[#8b95a1] mb-0.5">
                  {item.title} · qty {item.quantity}
                </p>
              ))}

              <p className="text-sm text-[#f5f5f0] font-medium mt-2 mb-3">KSh {order.total.toLocaleString()}</p>

              {order.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(order.id, 'confirmed')}
                    disabled={respondingId === order.id}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-[#2dd4a7] text-[#2dd4a7] text-xs font-medium py-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:opacity-60"
                  >
                    {respondingId === order.id && <Loader2 size={12} className="animate-spin" aria-hidden="true" />}
                    Confirm
                  </button>
                  <button
                    onClick={() => handleRespond(order.id, 'rejected')}
                    disabled={respondingId === order.id}
                    className="flex-1 border border-[#f87171]/60 text-[#f87171] text-xs font-medium py-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FarmerOrdersPage
