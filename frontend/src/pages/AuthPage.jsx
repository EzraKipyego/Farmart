import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Sprout, User, Tractor, Loader2, AlertCircle } from 'lucide-react'
import { loginUser, registerUser, clearAuthError } from '../features/auth/authSlice'

function AuthPage() {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('buyer')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', county: '' })
  const [formError, setFormError] = useState(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error } = useSelector((state) => state.auth)

  const redirectTo = location.state?.from?.pathname || (role === 'farmer' ? '/farmer/dashboard' : '/')

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate() {
    if (!form.email.trim() || !form.password.trim()) {
      return 'Enter your email and password.'
    }
    if (mode === 'register' && !form.name.trim()) {
      return 'Enter your full name.'
    }
    if (form.password.length < 6) {
      return 'Password must be at least 6 characters.'
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    dispatch(clearAuthError())

    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }

    try {
      if (mode === 'login') {
        await dispatch(loginUser({ email: form.email, password: form.password })).unwrap()
      } else {
        await dispatch(
          registerUser({
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone,
            county: form.county,
            role,
          }),
        ).unwrap()
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      console.error(`[AuthPage] ${mode} failed:`, err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-[#161b22] border border-[#1f2937] rounded-xl p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sprout size={20} className="text-[#2dd4a7]" aria-hidden="true" />
            <span className="font-medium text-lg text-[#f5f5f0]">
              Farm<span className="text-[#2dd4a7]">art</span>
            </span>
          </div>
          <p className="text-xs text-[#8b95a1]">Bridging Kenyan livestock farmers and buyers</p>
        </div>

        <div className="flex bg-[#0d1117] rounded-lg p-1 mb-5">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 text-sm py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${
              mode === 'login' ? 'bg-[#1c2129] text-[#f5f5f0]' : 'text-[#8b95a1]'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 text-sm py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${
              mode === 'register' ? 'bg-[#1c2129] text-[#f5f5f0]' : 'text-[#8b95a1]'
            }`}
          >
            Register
          </button>
        </div>

        <div className="flex gap-2 mb-4" role="radiogroup" aria-label="Account type">
          <button
            type="button"
            role="radio"
            aria-checked={role === 'buyer'}
            onClick={() => setRole('buyer')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-lg border outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${
              role === 'buyer' ? 'border-[#2dd4a7] bg-[#2dd4a7]/10 text-[#2dd4a7]' : 'border-[#1f2937] text-[#8b95a1]'
            }`}
          >
            <User size={14} aria-hidden="true" />
            Buyer
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={role === 'farmer'}
            onClick={() => setRole('farmer')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-lg border outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${
              role === 'farmer' ? 'border-[#2dd4a7] bg-[#2dd4a7]/10 text-[#2dd4a7]' : 'border-[#1f2937] text-[#8b95a1]'
            }`}
          >
            <Tractor size={14} aria-hidden="true" />
            Farmer
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="mb-3">
              <label htmlFor="name" className="text-xs text-[#8b95a1] block mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
              />
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="email" className="text-xs text-[#8b95a1] block mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            />
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="phone" className="text-xs text-[#8b95a1] block mb-1.5">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
                />
              </div>
              <div>
                <label htmlFor="county" className="text-xs text-[#8b95a1] block mb-1.5">
                  County
                </label>
                <input
                  id="county"
                  type="text"
                  value={form.county}
                  onChange={(e) => handleChange('county', e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
                />
              </div>
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="password" className="text-xs text-[#8b95a1] block mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            />
          </div>

          {(formError || error) && (
            <div className="flex items-start gap-2 bg-[#f87171]/10 text-[#f87171] text-xs rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span>{formError || error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 bg-[#2dd4a7] text-[#04342c] font-medium text-sm py-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:opacity-60"
          >
            {status === 'loading' && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-[#8b95a1] mt-5">
          <Link to="/" className="hover:text-[#f5f5f0]">
            Continue browsing without an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AuthPage
