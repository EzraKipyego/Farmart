import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Navigate } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import { selectCartItems, selectCartTotal } from '../features/cart/cartSlice'
import { submitCheckout } from '../features/orders/ordersSlice'
import { kenyanCounties } from '../data/mockAnimals'

const configuredDeliveryFee = import.meta.env.VITE_DELIVERY_FEE?.trim()
const DELIVERY_FEE = configuredDeliveryFee ? Number(configuredDeliveryFee) : null

function CheckoutPage() {
  const items = useSelector(selectCartItems)
  const subtotal = useSelector(selectCartTotal)
  const { user } = useSelector((state) => state.auth)
  const { checkoutStatus, error } = useSelector((state) => state.orders)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [details, setDetails] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    county: user?.county || kenyanCounties[0],
    address: '',
  })
  const [formError, setFormError] = useState(null)
  const [idempotencyKey] = useState(
    () => globalThis.crypto?.randomUUID?.() || `checkout-${Math.random().toString(36).slice(2)}`,
  )

  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  const hasDeliveryFee = Number.isFinite(DELIVERY_FEE) && DELIVERY_FEE >= 0
  const estimatedTotal = Math.round(subtotal + (hasDeliveryFee ? DELIVERY_FEE : 0))

  function handleChange(field, value) {
    setDetails((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)

    if (!details.name.trim() || !details.phone.trim() || !details.address.trim()) {
      setFormError('Fill in your name, phone number, and delivery address.')
      return
    }

    try {
      const order = await dispatch(
        submitCheckout({
          items,
          deliveryDetails: details,
          idempotencyKey,
        }),
      ).unwrap()

      const orderAmount = order.amount ?? order.total
      if (!Number.isFinite(Number(orderAmount))) {
        setFormError('The server did not return a valid order total. Please try again.')
        return
      }

      navigate('/payment', {
        state: {
          orderId: order.id || order.orderId,
          amount: Math.round(Number(orderAmount)),
          productName: items[0]?.title,
        },
      })
    } catch (err) {
      const code = err?.code || err?.details?.code
      const message = err?.message || err?.details?.message

      if (code === 'ANIMAL_ALREADY_PURCHASED') {
        setFormError('This animal has already been purchased.')
        return
      }

      if (message && message !== 'Request failed with status code 409') {
        setFormError(message)
        return
      }

      setFormError('This animal has already been purchased.')
    }
  }

  return (
    <div className="px-4 sm:px-6 pt-4 pb-10 max-w-xl mx-auto">
      <h1 className="text-base font-medium text-[#f5f5f0] mb-5">Checkout</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-[#161b22] border border-[#1f2937] rounded-lg p-4 mb-4">
          <p className="text-xs text-[#8b95a1] mb-3">Delivery details</p>

          <div className="mb-3">
            <label htmlFor="ck-name" className="text-xs text-[#8b95a1] block mb-1.5">
              Full name
            </label>
            <input
              id="ck-name"
              type="text"
              value={details.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="ck-phone" className="text-xs text-[#8b95a1] block mb-1.5">
              Phone number
            </label>
            <input
              id="ck-phone"
              type="tel"
              value={details.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="ck-county" className="text-xs text-[#8b95a1] block mb-1.5">
              County
            </label>
            <select
              id="ck-county"
              value={details.county}
              onChange={(e) => handleChange('county', e.target.value)}
              className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            >
              {kenyanCounties.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ck-address" className="text-xs text-[#8b95a1] block mb-1.5">
              Delivery address
            </label>
            <input
              id="ck-address"
              type="text"
              value={details.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            />
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#1f2937] rounded-lg p-4 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#8b95a1]">Subtotal</span>
            <span className="text-[#f5f5f0]">KSh {Math.round(subtotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#8b95a1]">Delivery</span>
            <span className="text-[#f5f5f0]">
              {hasDeliveryFee ? `KSh ${Math.round(DELIVERY_FEE).toLocaleString()}` : 'Calculated at checkout'}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-[#1f2937]">
            <span className="text-[#f5f5f0] font-medium">Total</span>
            <span className="text-[#2dd4a7] font-medium">
              {hasDeliveryFee ? `KSh ${estimatedTotal.toLocaleString()}` : 'Calculated at checkout'}
            </span>
          </div>
        </div>

        {(formError || error) && (
          <div className="flex items-start gap-2 bg-[#f87171]/10 text-[#f87171] text-xs rounded-lg px-3 py-2.5 mb-4">
            <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span>{formError || error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={checkoutStatus === 'loading'}
          className="w-full flex items-center justify-center gap-2 bg-[#2dd4a7] text-[#04342c] font-medium text-sm py-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:opacity-60"
        >
          {checkoutStatus === 'loading' && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
          Continue to payment
        </button>
      </form>
    </div>
  )
}

export default CheckoutPage
