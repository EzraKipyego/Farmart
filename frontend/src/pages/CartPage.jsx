import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'
import {
  selectCartItems,
  selectCartTotal,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} from '../features/cart/cartSlice'
import AnimalImage from '../components/common/AnimalImage'
import EmptyState from '../components/common/EmptyState'

function CartPage() {
  const items = useSelector(selectCartItems)
  const total = useSelector(selectCartTotal)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="px-4 pt-4 pb-24 sm:pb-10">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse listings and add animals you'd like to buy."
          action={
            <Link
              to="/"
              className="text-sm text-[#04342c] bg-[#2dd4a7] px-4 py-2 rounded-lg font-medium mt-1 outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            >
              Browse animals
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 pt-4 pb-32 sm:pb-10 max-w-xl mx-auto">
      <h1 className="text-base font-medium text-[#f5f5f0] mb-1">Your cart</h1>
      <p className="text-xs text-[#8b95a1] mb-5">
        {items.reduce((sum, i) => sum + i.quantity, 0)} item{items.length !== 1 ? 's' : ''}
      </p>

      <div className="flex flex-col gap-3 mb-6">
        {items.map((item) => (
          <div key={item.animalId} className="flex gap-3 bg-[#161b22] border border-[#1f2937] rounded-lg p-3">
            <AnimalImage type={item.type} src={item.image} size={22} className="w-14 h-14 rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#f5f5f0] truncate">{item.title}</p>
              <p className="text-[11px] text-[#8b95a1] mb-2">{item.location}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch(decrementQuantity(item.animalId))}
                  aria-label={`Decrease quantity of ${item.title}`}
                  className="w-6 h-6 flex items-center justify-center bg-[#0d1117] border border-[#1f2937] rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
                >
                  <Minus size={12} aria-hidden="true" />
                </button>
                <span className="text-xs text-[#f5f5f0] w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => dispatch(incrementQuantity(item.animalId))}
                  aria-label={`Increase quantity of ${item.title}`}
                  className="w-6 h-6 flex items-center justify-center bg-[#0d1117] border border-[#1f2937] rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
                >
                  <Plus size={12} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between shrink-0">
              <button
                onClick={() => dispatch(removeFromCart(item.animalId))}
                aria-label={`Remove ${item.title} from cart`}
                className="text-[#5f6b7a] hover:text-[#f87171] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-md"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
              <p className="text-sm text-[#f5f5f0] font-medium">
                KSh {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[#8b95a1]">Total</p>
        <p className="text-lg font-medium text-[#f5f5f0]">KSh {total.toLocaleString()}</p>
      </div>

      <button
        onClick={() => navigate('/checkout')}
        className="w-full bg-[#2dd4a7] text-[#04342c] font-medium text-sm py-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
      >
        Checkout
      </button>
    </div>
  )
}

export default CartPage