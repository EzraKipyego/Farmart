import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Search, ShoppingCart, Sprout, LogOut, ClipboardList, User } from 'lucide-react'
import { clearCart, selectCartCount } from '../../features/cart/cartSlice'
import { logout } from '../../features/auth/authSlice'

function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const cartCount = useSelector(selectCartCount)

  function handleLogout() {
    dispatch(clearCart())
    dispatch(logout())
    navigate('/login')
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') {
      const trimmed = e.currentTarget.value.trim()
      navigate(trimmed ? `/?search=${encodeURIComponent(trimmed)}` : '/')
    }
  }

  return (
    <header className="hidden sm:flex items-center gap-6 px-6 py-3 bg-[#0d1117] border-b border-[#1f2937]">
      <Link to="/" className="flex items-center gap-2 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-md">
        <Sprout size={20} className="text-[#2dd4a7]" aria-hidden="true" />
        <span className="font-medium text-[#f5f5f0] text-lg">
          Farm<span className="text-[#2dd4a7]">art</span>
        </span>
      </Link>

      <div className="flex items-center gap-2 w-56 bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-1.5">
        <Search size={14} className="text-[#5f6b7a]" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search"
          onKeyDown={handleSearchKeyDown}
          className="bg-transparent flex-1 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none min-w-0"
        />
      </div>

      <nav className="flex items-center gap-5 text-sm text-[#8b95a1]">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'text-[#f5f5f0]' : 'hover:text-[#f5f5f0]')}>
          Browse
        </NavLink>
        {isAuthenticated && user?.role === 'farmer' && (
          <NavLink to="/farmer/dashboard" className={({ isActive }) => (isActive ? 'text-[#f5f5f0]' : 'hover:text-[#f5f5f0]')}>
            Dashboard
          </NavLink>
        )}
        {isAuthenticated && (
          <NavLink to={user?.role === 'farmer' ? '/farmer/orders' : '/orders'} className={({ isActive }) => (isActive ? 'text-[#f5f5f0]' : 'hover:text-[#f5f5f0]')}>
            Orders
          </NavLink>
        )}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <Link to="/cart" aria-label="Cart" className="relative text-[#8b95a1] hover:text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-md">
          <ShoppingCart size={18} aria-hidden="true" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#f87171] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
        {isAuthenticated && (
          <Link to="/profile" aria-label="Profile" className="text-[#8b95a1] hover:text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-md">
            <User size={18} aria-hidden="true" />
          </Link>
        )}
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 border border-[#1f2937] text-[#f5f5f0] text-sm px-3 py-1.5 rounded-lg hover:bg-[#161b22] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          >
            <LogOut size={14} aria-hidden="true" />
            Log out
          </button>
        ) : (
          <Link
            to="/login"
            className="border border-[#1f2937] text-[#f5f5f0] text-sm px-4 py-1.5 rounded-lg hover:bg-[#161b22] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}

export default Navbar
