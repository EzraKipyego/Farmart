import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Loader2, LogOut } from 'lucide-react'
import { updateUserProfile, clearAuthError, logout } from '../features/auth/authSlice'
import { clearCart } from '../features/cart/cartSlice'
import { kenyanCounties } from '../data/mockAnimals'

function ProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, error } = useSelector((state) => state.auth)

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    county: user?.county || kenyanCounties[0],
    farmName: user?.farmName || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleLogout() {
    dispatch(clearCart())
    dispatch(logout())
    navigate('/login')
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    dispatch(clearAuthError())
    setSaved(false)
    setSaving(true)
    try {
      await dispatch(updateUserProfile(form)).unwrap()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('[ProfilePage] update failed:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 pt-4 pb-24 sm:pb-10 max-w-md mx-auto">
      <h1 className="text-base font-medium text-[#f5f5f0] mb-1">Profile</h1>
      <p className="text-xs text-[#8b95a1] mb-5">{user?.email}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="p-name" className="text-xs text-[#8b95a1] block mb-1.5">
            Full name
          </label>
          <input
            id="p-name"
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          />
        </div>

        <div>
          <label htmlFor="p-phone" className="text-xs text-[#8b95a1] block mb-1.5">
            Phone number
          </label>
          <input
            id="p-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          />
        </div>

        <div>
          <label htmlFor="p-county" className="text-xs text-[#8b95a1] block mb-1.5">
            County
          </label>
          <select
            id="p-county"
            value={form.county}
            onChange={(e) => handleChange('county', e.target.value)}
            className="w-full bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          >
            {kenyanCounties.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {user?.role === 'farmer' && (
          <div>
            <label htmlFor="p-farm" className="text-xs text-[#8b95a1] block mb-1.5">
              Farm name
            </label>
            <input
              id="p-farm"
              type="text"
              value={form.farmName}
              onChange={(e) => handleChange('farmName', e.target.value)}
              className="w-full bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-[#f87171]/10 text-[#f87171] text-xs rounded-lg px-3 py-2.5">
            <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 bg-[#2dd4a7]/10 text-[#2dd4a7] text-xs rounded-lg px-3 py-2.5">
            <CheckCircle2 size={14} aria-hidden="true" />
            <span>Profile updated.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#2dd4a7] text-[#04342c] font-medium text-sm py-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:opacity-60"
        >
          {saving && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
          Save changes
        </button>
      </form>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 border border-[#f87171]/50 text-[#f87171] font-medium text-sm py-2.5 rounded-lg mt-4 outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
      >
        <LogOut size={15} aria-hidden="true" />
        Log out
      </button>
    </div>
  )
}

export default ProfilePage
