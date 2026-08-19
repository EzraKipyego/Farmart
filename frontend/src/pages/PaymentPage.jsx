import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { Smartphone, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { startStkPush, pollPaymentStatus, resetPayment } from '../features/payment/paymentSlice'

function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { phase, checkoutRequestId, error } = useSelector((state) => state.payment)

  const orderId = location.state?.orderId
  const amount = location.state?.amount

  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState(null)

  useEffect(() => {
    return () => {
      dispatch(resetPayment())
    }
  }, [dispatch])

  useEffect(() => {
    if (phase === 'pending' && checkoutRequestId) {
      dispatch(pollPaymentStatus(checkoutRequestId))
    }
  }, [phase, checkoutRequestId, dispatch])

  if (!amount) {
    return <Navigate to="/" replace />
  }

  function validatePhone(value) {
    return /^0[71]\d{8}$/.test(value)
  }

  async function handlePay(e) {
    e.preventDefault()
    setPhoneError(null)

    if (!validatePhone(phone)) {
      setPhoneError('Enter a valid Safaricom number, e.g. 0712345678')
      return
    }

    try {
      await dispatch(startStkPush({ orderId, phone, amount })).unwrap()
    } catch (err) {
      console.error('[PaymentPage] STK push failed:', err)
    }
  }

  function handleDone() {
    navigate('/orders')
  }

  function handleRetry() {
    dispatch(resetPayment())
  }

  return (
    <div className="px-4 sm:px-6 pt-4 pb-10 max-w-sm mx-auto">
      <h1 className="text-base font-medium text-[#f5f5f0] mb-5">Payment</h1>

      <div className="bg-[#161b22] border border-[#1f2937] rounded-lg p-4 mb-5">
        <p className="text-xs text-[#8b95a1] mb-1">Amount due</p>
        <p className="text-xl font-medium text-[#f5f5f0]">KSh {amount.toLocaleString()}</p>
        {orderId && <p className="text-[11px] text-[#8b95a1] mt-1">Order #{orderId}</p>}
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

      {phase === 'pending' && (
        <div className="bg-[#161b22] border border-[#1f2937] rounded-lg p-6 text-center">
          <div className="w-11 h-11 rounded-full bg-[#facc15]/10 flex items-center justify-center mx-auto mb-3">
            <Clock size={20} className="text-[#facc15]" aria-hidden="true" />
          </div>
          <p className="text-sm text-[#f5f5f0] mb-1">Check your phone</p>
          <p className="text-xs text-[#8b95a1]">Enter your M-Pesa PIN on the prompt to complete payment.</p>
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
          <p className="text-xs text-[#8b95a1] mb-4">{error || 'The payment could not be completed.'}</p>
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
