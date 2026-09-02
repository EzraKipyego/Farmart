import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { loadBuyerOrders } from '../features/orders/ordersSlice'
import Spinner from '../components/common/Spinner'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import { mapBuyerOrderStatus, getBuyerStatusLabel, getStatusStyles } from '../utils/statusMapper'

function OrdersPage() {
  const dispatch = useDispatch()
  const { buyerOrders, status, error } = useSelector((state) => state.orders)

  useEffect(() => {
    dispatch(loadBuyerOrders())
  }, [dispatch])

  return (
    <div className="px-4 sm:px-6 pt-4 pb-24 sm:pb-10 max-w-7xl mx-auto">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {buyerOrders.map((order) => {
            const mappedStatus = mapBuyerOrderStatus(order.status)
            return (
              <div key={order.id} className="bg-[#161b22] border border-[#1f2937] rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-[#f5f5f0]">Order: {order.items?.[0]?.title || order.id}</p>
                    <p className="text-[10px] text-[#5f6b7a]">Reference #{order.id}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-md ${getStatusStyles(mappedStatus)}`}>
                    {getBuyerStatusLabel(order.status)}
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
                      <span className={`text-[10px] px-2 py-1 rounded-md ${getStatusStyles(mapBuyerOrderStatus(item.status || order.status))}`}>
                        {getBuyerStatusLabel(item.status || order.status)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#1f2937]">
                  <p className="text-[11px] text-[#8b95a1]">Seller: {order.farmerName}</p>
                  <p className="text-sm text-[#f5f5f0] font-medium">KSh {Math.round(order.total).toLocaleString()}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
