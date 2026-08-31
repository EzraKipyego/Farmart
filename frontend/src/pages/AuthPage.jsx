import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Sprout, User, Tractor, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { loginUser, registerUser, requestPasswordReset, confirmPasswordReset, clearAuthError } from '../features/auth/authSlice'

const passwordMessage = 'Password must be at least 6 characters and contain a letter, number, and special character.'

function PasswordField({ field, label, value, isVisible, onChange, onToggle }) {
  return <div className="mb-3"><label htmlFor={field} className="text-xs text-[#8b95a1] block mb-1.5">{label}</label><div className="relative"><input id={field} type={isVisible ? 'text' : 'password'} value={value} onChange={(e) => onChange(field, e.target.value)} className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 pr-10 text-sm text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]" /><button type="button" onClick={() => onToggle(field)} aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="absolute inset-y-0 right-0 px-3 text-[#8b95a1] hover:text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] rounded-r-lg">{isVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}</button></div></div>
}

function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { status, error } = useSelector((state) => state.auth)
  const [mode, setMode] = useState(() => (location.pathname === '/reset-password' ? 'reset' : 'login'))
  const [role, setRole] = useState('buyer')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', county: '' })
  const [formError, setFormError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [visiblePasswords, setVisiblePasswords] = useState({ password: false, confirmPassword: false })
  const resetParams = new URLSearchParams(location.search)
  const redirectTo = location.state?.from?.pathname || (role === 'farmer' ? '/farmer/dashboard' : '/')
  const isPasswordMode = mode === 'login' || mode === 'register' || mode === 'reset'

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setFormError(null)
    setSuccessMessage(null)
    dispatch(clearAuthError())
  }

  function hasStrongPassword(password) {
    return password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)
  }

  function validate() {
    if (mode === 'forgot') return form.email.trim() ? null : 'Enter your email.'
    if (mode === 'reset') {
      if (!resetParams.get('uid') || !resetParams.get('token')) return 'The password reset link is invalid or has expired.'
      if (!hasStrongPassword(form.password)) return passwordMessage
      return form.password === form.confirmPassword ? null : 'Passwords do not match.'
    }
    if (!form.email.trim() || !form.password) return 'Enter your email and password.'
    if (mode === 'register' && !form.name.trim()) return 'Enter your full name.'
    if (mode === 'register' && !hasStrongPassword(form.password)) return passwordMessage
    if (mode === 'register' && form.password !== form.confirmPassword) return 'Passwords do not match.'
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)
    setSuccessMessage(null)
    dispatch(clearAuthError())
    const validationError = validate()
    if (validationError) return setFormError(validationError)

    try {
      if (mode === 'login') {
        await dispatch(loginUser({ email: form.email, password: form.password, role })).unwrap()
        navigate(redirectTo, { replace: true })
      } else if (mode === 'register') {
        const result = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password, phone: form.phone, county: form.county, role })).unwrap()
        setSuccessMessage(result.message || 'Account created successfully.')
        window.setTimeout(() => navigate(redirectTo, { replace: true }), 800)
      } else if (mode === 'forgot') {
        const result = await dispatch(requestPasswordReset({ email: form.email, role })).unwrap()
        setSuccessMessage(result.message || 'Password reset email sent successfully.')
      } else {
        const result = await dispatch(confirmPasswordReset({ uid: resetParams.get('uid'), token: resetParams.get('token'), password: form.password })).unwrap()
        setSuccessMessage(result.message || 'Password changed successfully.')
        setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }))
      }
    } catch (err) {
      setFormError(typeof err === 'string' ? err : err?.message || 'Something went wrong. Try again.')
    }
  }

  const resetTitle = mode === 'forgot' ? 'Reset your password' : mode === 'reset' ? 'Choose a new password' : 'Bridging Kenyan livestock farmers and buyers'
  return <div className="min-h-screen flex items-center justify-center px-4 py-10"><div className="w-full max-w-sm bg-[#161b22] border border-[#1f2937] rounded-xl p-6">
    <div className="text-center mb-6"><div className="flex items-center justify-center gap-2 mb-1"><Sprout size={20} className="text-[#2dd4a7]" aria-hidden="true" /><span className="font-medium text-lg text-[#f5f5f0]">Farm<span className="text-[#2dd4a7]">art</span></span></div><p className="text-xs text-[#8b95a1]">{resetTitle}</p></div>
    {(mode === 'login' || mode === 'register') && <div className="flex bg-[#0d1117] rounded-lg p-1 mb-5"><button type="button" onClick={() => changeMode('login')} className={`flex-1 text-sm py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${mode === 'login' ? 'bg-[#1c2129] text-[#f5f5f0]' : 'text-[#8b95a1]'}`}>Log in</button><button type="button" onClick={() => changeMode('register')} className={`flex-1 text-sm py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${mode === 'register' ? 'bg-[#1c2129] text-[#f5f5f0]' : 'text-[#8b95a1]'}`}>Register</button></div>}
    {mode !== 'reset' && <div className="flex gap-2 mb-4" role="radiogroup" aria-label="Account type">{['buyer', 'farmer'].map((accountRole) => { const Icon = accountRole === 'buyer' ? User : Tractor; return <button key={accountRole} type="button" role="radio" aria-checked={role === accountRole} onClick={() => setRole(accountRole)} className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-lg border outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${role === accountRole ? 'border-[#2dd4a7] bg-[#2dd4a7]/10 text-[#2dd4a7]' : 'border-[#1f2937] text-[#8b95a1]'}`}><Icon size={14} aria-hidden="true" />{accountRole === 'buyer' ? 'Buyer' : 'Farmer'}</button> })}</div>}
    <form onSubmit={handleSubmit} noValidate>
      {mode === 'register' && <div className="mb-3"><label htmlFor="name" className="text-xs text-[#8b95a1] block mb-1.5">Full name</label><input id="name" type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]" /></div>}
      {mode !== 'reset' && <div className="mb-3"><label htmlFor="email" className="text-xs text-[#8b95a1] block mb-1.5">Email</label><input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]" /></div>}
      {mode === 'register' && <div className="grid grid-cols-2 gap-3 mb-3"><div><label htmlFor="phone" className="text-xs text-[#8b95a1] block mb-1.5">Phone</label><input id="phone" type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]" /></div><div><label htmlFor="county" className="text-xs text-[#8b95a1] block mb-1.5">County</label><input id="county" type="text" value={form.county} onChange={(e) => handleChange('county', e.target.value)} className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]" /></div></div>}
      {isPasswordMode && <PasswordField field="password" label={mode === 'reset' ? 'New password' : 'Password'} value={form.password} isVisible={visiblePasswords.password} onChange={handleChange} onToggle={(field) => setVisiblePasswords((prev) => ({ ...prev, [field]: !prev[field] }))} />}
      {(mode === 'register' || mode === 'reset') && <><PasswordField field="confirmPassword" label="Confirm password" value={form.confirmPassword} isVisible={visiblePasswords.confirmPassword} onChange={handleChange} onToggle={(field) => setVisiblePasswords((prev) => ({ ...prev, [field]: !prev[field] }))} /><p className="text-xs text-[#8b95a1] -mt-1 mb-4">Use 6+ characters with a letter, number, and special character.</p></>}
      {(formError || error) && <div role="alert" aria-live="assertive" className="flex items-start gap-2 bg-[#f87171]/10 text-[#f87171] text-xs rounded-lg px-3 py-2.5 mb-4"><AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" /><span>{formError || error}</span></div>}
      {successMessage && <div role="status" aria-live="polite" className="flex items-start gap-2 bg-[#2dd4a7]/10 text-[#2dd4a7] text-xs rounded-lg px-3 py-2.5 mb-4"><CheckCircle2 size={14} className="shrink-0 mt-0.5" aria-hidden="true" /><span>{successMessage}</span></div>}
      <button type="submit" disabled={status === 'loading'} className="w-full flex items-center justify-center gap-2 bg-[#2dd4a7] text-[#04342c] font-medium text-sm py-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:opacity-60">{status === 'loading' && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}{mode === 'login' ? 'Log in' : mode === 'register' ? 'Create account' : mode === 'forgot' ? 'Send reset email' : 'Change password'}</button>
    </form>
    {mode === 'login' && <button type="button" onClick={() => changeMode('forgot')} className="w-full text-center text-xs text-[#2dd4a7] hover:text-[#f5f5f0] mt-4">Forgot password?</button>}
    {(mode === 'forgot' || mode === 'reset') && <button type="button" onClick={() => { changeMode('login'); navigate('/login') }} className="w-full text-center text-xs text-[#2dd4a7] hover:text-[#f5f5f0] mt-4">Back to login</button>}
    <p className="text-center text-xs text-[#8b95a1] mt-5"><Link to="/" className="hover:text-[#f5f5f0]">Continue browsing without an account</Link></p>
  </div></div>
}

export default AuthPage
