import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { loadBuyerOrders } from '../features/orders/ordersSlice'
import Spinner from '../components/common/Spinner'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

const statusStyles = {
  pending: 'bg-[#facc15]/10 text-[#facc15]',
  confirmed: 'bg-[#2dd4a7]/10 text-[#2dd4a7]',
  rejected: 'bg-[#f87171]/10 text-[#f87171]',
}

function OrdersPage() {
  const dispatch = useDispatch()
  const { buyerOrders, status, error } = useSelector((state) => state.orders)

  useEffect(() => {
    dispatch(loadBuyerOrders())
  }, [dispatch])

  return (
    <div className="px-4 sm:px-6 pt-4 pb-24 sm:pb-10 max-w-xl mx-auto">
      <h1 className="text-base font-medium text-[#f5f5f0] mb-5">My orders</h1>

      {status === 'loading' && <Spinner label="Loading your orders" />}

      {status === 'failed' && <ErrorState message={error} onRetry={() => dispatch(loadBuyerOrders())} />}

      {status === 'succeeded' && buyerOrders.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="Orders you place will show up here."
          action={
            <Link to="/" className="text-sm text-[#04342c] bg-[#2dd4a7] px-4 py-2 rounded-lg font-medium mt-1 outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]">
              Browse animals
            </Link>
          }
        />
      )}

      {status === 'succeeded' && buyerOrders.length > 0 && (
        <div className="flex flex-col gap-3">
          {buyerOrders.map((order) => (
            <div key={order.id} className="bg-[#161b22] border border-[#1f2937] rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-[#f5f5f0]">Order #{order.id}</p>
                <span className={`text-[10px] px-2 py-1 rounded-md capitalize ${statusStyles[order.status] || 'bg-[#1c2129] text-[#8b95a1]'}`}>
                  {order.status}
                </span>
              </div>
              {order.items.map((item) => (
                <p key={item.animalId} className="text-xs text-[#8b95a1] mb-0.5">
                  {item.title} · qty {item.quantity} · KSh {item.price.toLocaleString()}
                </p>
              ))}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#1f2937]">
                <p className="text-[11px] text-[#8b95a1]">Seller: {order.farmerName}</p>
                <p className="text-sm text-[#f5f5f0] font-medium">KSh {order.total.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
