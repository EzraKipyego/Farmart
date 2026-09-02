import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Home, Search, ShoppingCart, ClipboardList, User, PlusCircle } from 'lucide-react'
import { selectCartCount } from '../../features/cart/cartSlice'

const tabClass = ({ isActive }) =>
  `flex flex-col items-center justify-center gap-1 flex-1 py-2 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-lg ${
    isActive ? 'text-[#2dd4a7]' : 'text-[#8b95a1]'
  }`

function MobileTabBar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const cartCount = useSelector(selectCartCount)
  const isFarmer = isAuthenticated && user?.role === 'farmer'

  if (isFarmer) {
    return (
      <nav
        aria-label="Farmer navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex bg-[#161b22] border-t border-[#1f2937] sm:hidden"
      >
        <NavLink to="/" end className={tabClass}>
          <Home size={20} aria-hidden="true" />
          Dashboard
        </NavLink>
        <NavLink to="/my-animals" className={tabClass}>
          <PlusCircle size={20} aria-hidden="true" />
          Add listing
        </NavLink>
        <NavLink to="/farmer/orders" className={tabClass}>
          <ClipboardList size={20} aria-hidden="true" />
          Orders
        </NavLink>
        <NavLink to="/profile" className={tabClass}>
          <User size={20} aria-hidden="true" />
          Profile
        </NavLink>
      </nav>
    )
  }

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex bg-[#161b22] border-t border-[#1f2937] sm:hidden"
    >
      <NavLink to="/" end className={tabClass}>
        <Home size={20} aria-hidden="true" />
        Browse
      </NavLink>
      <NavLink to="/search" className={tabClass}>
        <Search size={20} aria-hidden="true" />
        Search
      </NavLink>
      <NavLink to="/cart" className={tabClass}>
        <span className="relative">
          <ShoppingCart size={20} aria-hidden="true" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#f87171] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </span>
        Cart
      </NavLink>
      <NavLink to={isAuthenticated ? '/orders' : '/login'} className={tabClass}>
        <ClipboardList size={20} aria-hidden="true" />
        Orders
      </NavLink>
      <NavLink to={isAuthenticated ? '/profile' : '/login'} className={tabClass}>
        <User size={20} aria-hidden="true" />
        Profile
      </NavLink>
    </nav>
  )
}

export default MobileTabBar
