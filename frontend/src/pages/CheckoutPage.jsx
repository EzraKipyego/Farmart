import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Navigate } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import { selectCartItems, selectCartTotal, clearCart } from '../features/cart/cartSlice'
import { submitCheckout } from '../features/orders/ordersSlice'
import { kenyanCounties } from '../data/mockAnimals'

const DELIVERY_FEE = 2500

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

  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  const total = subtotal + DELIVERY_FEE

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
        }),
      ).unwrap()

      dispatch(clearCart())
      navigate('/payment', { state: { orderId: order.id || order.orderId, amount: total } })
    } catch (err) {
      console.error('[CheckoutPage] checkout failed:', err)
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
            <span className="text-[#f5f5f0]">KSh {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#8b95a1]">Delivery</span>
            <span className="text-[#f5f5f0]">KSh {DELIVERY_FEE.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-[#1f2937]">
            <span className="text-[#f5f5f0] font-medium">Total</span>
            <span className="text-[#2dd4a7] font-medium">KSh {total.toLocaleString()}</span>
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
