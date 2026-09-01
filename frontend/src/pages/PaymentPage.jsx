import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { Smartphone, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import {
  startStkPush,
  pollPaymentStatus,
  resetPayment,
  restorePendingCheckout,
  paymentTimedOut,
} from '../features/payment/paymentSlice'
import { clearCart } from '../features/cart/cartSlice'
import { loadAnimals } from '../features/animals/animalsSlice'

const POLL_INTERVAL_MS = 5000
const PAYMENT_TIMEOUT_MS = 40000
const PAYMENT_STORAGE_KEY = 'farmart_pending_checkout'

function readPendingCheckout() {
  try {
    const raw = localStorage.getItem(PAYMENT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.error('[PaymentPage] could not read pending checkout state:', error)
    return null
  }
}

function writePendingCheckout(payload) {
  try {
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payload))
  } catch (error) {
    console.error('[PaymentPage] could not persist pending checkout state:', error)
  }
}

function clearPendingCheckout() {
  try {
    localStorage.removeItem(PAYMENT_STORAGE_KEY)
  } catch (error) {
    console.error('[PaymentPage] could not clear pending checkout state:', error)
  }
}

function normalizePaymentStatus(value) {
  const rawStatus = String(value ?? '').trim().toUpperCase()

  if (['PENDING', 'PROCESSING', 'WAITING', 'INITIATED'].includes(rawStatus)) return 'PENDING'
  if (['SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'PAID'].includes(rawStatus)) return 'COMPLETED'
  if (['FAILED', 'CANCELLED', 'CANCELED', 'TIMEOUT', 'TIMED_OUT', 'EXPIRED'].includes(rawStatus)) return 'FAILED'

  return rawStatus || 'PENDING'
}

function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { phase, status, checkoutRequestId, error } = useSelector((state) => state.payment)
  const { filters } = useSelector((state) => state.animals)
  const pollingRef = useRef(null)
  const timeoutRef = useRef(null)
  const pollStartedAtRef = useRef(0)

  const orderId = location.state?.orderId
  const productName = location.state?.productName
  const amount = Number(location.state?.amount)

  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState(null)

  useEffect(() => {
    const saved = readPendingCheckout()
    if (!saved?.checkoutRequestId) return

    if (!checkoutRequestId) {
      dispatch(
        restorePendingCheckout({
          checkoutRequestId: saved.checkoutRequestId,
        }),
      )
      pollStartedAtRef.current = Number(saved.startedAt || Date.now())
    }
  }, [checkoutRequestId, dispatch])

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      pollStartedAtRef.current = 0
      dispatch(resetPayment())
    }
  }, [dispatch])

  useEffect(() => {
    if (phase !== 'pending' || !checkoutRequestId) {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      return
    }

    if (!pollStartedAtRef.current) {
      pollStartedAtRef.current = Date.now()
    }

    const pollStatus = async () => {
      try {
        const result = await dispatch(pollPaymentStatus(checkoutRequestId)).unwrap()
        const normalizedStatus = normalizePaymentStatus(result?.status)

        if (normalizedStatus === 'COMPLETED') return

        if (normalizedStatus === 'FAILED') {
          const elapsed = Date.now() - pollStartedAtRef.current
          if (elapsed >= PAYMENT_TIMEOUT_MS) {
            dispatch(
              paymentTimedOut(
                'Payment unconfirmed or canceled. If money was deducted, please wait a moment or contact support.',
              ),
            )
          }
        }
      } catch (err) {
        const statusCode = Number(err?.status)
        const message = String(err?.message || '')
        const isTemporaryNetworkFailure =
          statusCode === 502 || statusCode === 504 || /502|504|Bad Gateway|Gateway Timeout|timeout/i.test(message)

        if (isTemporaryNetworkFailure) {
          return
        }

        const elapsed = Date.now() - pollStartedAtRef.current
        if (elapsed >= PAYMENT_TIMEOUT_MS) {
          dispatch(
            paymentTimedOut(
              'Payment unconfirmed or canceled. If money was deducted, please wait a moment or contact support.',
            ),
          )
        }
      }
    }

    pollStatus()
    pollingRef.current = setInterval(pollStatus, POLL_INTERVAL_MS)

    timeoutRef.current = setTimeout(() => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      dispatch(
        paymentTimedOut(
          'Payment unconfirmed or canceled. If money was deducted, please wait a moment or contact support.',
        ),
      )
    }, PAYMENT_TIMEOUT_MS)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [phase, checkoutRequestId, dispatch])

  useEffect(() => {
    if (phase === 'success') {
      clearPendingCheckout()
      dispatch(clearCart())
      dispatch(loadAnimals(filters))
      const doneTimer = setTimeout(() => {
        navigate('/orders', { replace: true })
      }, 1200)
      return () => clearTimeout(doneTimer)
    }
  }, [phase, dispatch, navigate, filters])

  if (!Number.isFinite(amount) || amount <= 0) {
    return <Navigate to="/" replace />
  }

  function validatePhone(value) {
    return /^(?:0[71]\d{8}|254[71]\d{8})$/.test(normalizePhone(value))
  }

  function normalizePhone(value) {
    const compact = value.replace(/\s+/g, '')
    const withoutPlus = compact.startsWith('+') ? compact.slice(1) : compact
    if (withoutPlus.startsWith('0')) return `254${withoutPlus.slice(1)}`
    return withoutPlus
  }

  async function handlePay(e) {
    e.preventDefault()
    setPhoneError(null)

    if (!validatePhone(phone)) {
      setPhoneError('Enter a valid Safaricom number, e.g. 0712345678')
      return
    }

    try {
      const normalizedPhone = normalizePhone(phone)
      const roundedAmount = Math.round(amount)
      const payload = { order_id: orderId, phone: normalizedPhone, amount: roundedAmount }
      console.log('Sending Payload:', payload)

      const result = await dispatch(startStkPush({ orderId, phone: normalizedPhone, amount: roundedAmount })).unwrap()
      const requestId = result?.checkoutRequestId || result?.checkout_request_id

      if (requestId) {
        writePendingCheckout({
          checkoutRequestId: requestId,
          orderId,
          productName,
          amount: roundedAmount,
          startedAt: Date.now(),
        })
      }
    } catch (err) {
      console.error('[PaymentPage] STK push failed:', err)
    }
  }

  function handleDone() {
    navigate('/orders')
  }

  function handleRetry() {
    pollStartedAtRef.current = 0
    clearPendingCheckout()
    dispatch(resetPayment())
    setPhone('')
  }

  function handleCheckStatus() {
    if (!checkoutRequestId) return

    dispatch(pollPaymentStatus(checkoutRequestId))
  }

  const isCheckingPayment = status === 'PENDING' || phase === 'pending'

  return (
    <div className="px-4 sm:px-6 pt-4 pb-10 max-w-sm mx-auto">
      <h1 className="text-base font-medium text-[#f5f5f0] mb-5">Payment</h1>

      <div className="bg-[#161b22] border border-[#1f2937] rounded-lg p-4 mb-5">
        <p className="text-xs text-[#8b95a1] mb-1">Amount due</p>
        <p className="text-xl font-medium text-[#f5f5f0]">KSh {Math.round(amount).toLocaleString()}</p>
        {productName ? <p className="text-[11px] text-[#8b95a1] mt-1">Order: {productName}</p> : null}
        {orderId && <p className="text-[10px] text-[#5f6b7a] mt-1">Reference #{orderId}</p>}
      </div>

      {(phase === 'idle' || phase === 'requesting') && (
        <form onSubmit={handlePay}>
          <div className="bg-[#161b22] border border-[#1f2937] rounded-lg p-4 mb-4">
            <p className="flex items-center gap-2 text-xs text-[#8b95a1] mb-3">
              <Smartphone size={14} className="text-[#2dd4a7]" aria-hidden="true" />
              Pay with M-Pesa via Daraja
            </p>
            <label htmlFor="phone" className="text-xs text-[#8b95a1] block mb-1.5">
              M-Pesa phone number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            />
            {phoneError && <p className="text-xs text-[#f87171] mt-2">{phoneError}</p>}
          </div>

          <button
            type="submit"
            disabled={phase === 'requesting'}
            className="w-full flex items-center justify-center gap-2 bg-[#2dd4a7] text-[#04342c] font-medium text-sm py-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:opacity-60"
          >
            {phase === 'requesting' && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            Send STK push
          </button>
        </form>
      )}

      {isCheckingPayment && (
        <div className="bg-[#161b22] border border-[#1f2937] rounded-lg p-6 text-center">
          <div className="w-11 h-11 rounded-full bg-[#facc15]/10 flex items-center justify-center mx-auto mb-3">
            {phase === 'pending' ? (
              <Loader2 size={20} className="text-[#facc15] animate-spin" aria-hidden="true" />
            ) : (
              <Clock size={20} className="text-[#facc15]" aria-hidden="true" />
            )}
          </div>
          <p className="text-sm text-[#f5f5f0] mb-1">Checking your payment</p>
          <p className="text-xs text-[#8b95a1] mb-4">We are confirming your M-Pesa payment. This usually takes a few seconds.</p>
          <button
            type="button"
            onClick={handleCheckStatus}
            className="w-full border border-[#1f2937] text-[#f5f5f0] font-medium text-sm py-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:opacity-60"
            disabled={phase === 'pending'}
          >
            {phase === 'pending' ? 'Checking payment…' : 'I have completed payment'}
          </button>
        </div>
      )}

      {phase === 'success' && (
        <div className="bg-[#161b22] border border-[#1f2937] rounded-lg p-6 text-center">
          <div className="w-11 h-11 rounded-full bg-[#2dd4a7]/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={20} className="text-[#2dd4a7]" aria-hidden="true" />
          </div>
          <p className="text-sm text-[#f5f5f0] mb-1">Payment received</p>
          <p className="text-xs text-[#8b95a1] mb-4">Your order has been confirmed with the farmer.</p>
          <button
            onClick={handleDone}
            className="w-full bg-[#2dd4a7] text-[#04342c] font-medium text-sm py-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          >
            View my orders
          </button>
        </div>
      )}

      {phase === 'failed' && (
        <div className="bg-[#161b22] border border-[#1f2937] rounded-lg p-6 text-center">
          <div className="w-11 h-11 rounded-full bg-[#f87171]/10 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={20} className="text-[#f87171]" aria-hidden="true" />
          </div>
          <p className="text-sm text-[#f5f5f0] mb-1">Payment failed</p>
          <p className="text-xs text-[#8b95a1] mb-4">
            {error || 'Payment unconfirmed or canceled. If money was deducted, please wait a moment or contact support.'}
          </p>
          <button
            type="button"
            onClick={handleCheckStatus}
            className="w-full border border-[#1f2937] text-[#f5f5f0] font-medium text-sm py-2.5 rounded-lg mb-3 outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          >
            Re-check Payment Status
          </button>
          <button
            onClick={handleRetry}
            className="w-full bg-[#2dd4a7] text-[#04342c] font-medium text-sm py-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}

export default PaymentPage
