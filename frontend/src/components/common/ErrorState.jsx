import { AlertCircle, RefreshCw } from 'lucide-react'

function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 py-12 text-center px-4">
      <AlertCircle size={22} className="text-[#f87171]" aria-hidden="true" />
      <p className="text-sm text-[#8b95a1] max-w-xs">{message || 'Something went wrong. Try again.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 text-sm text-[#2dd4a7] border border-[#1f2937] px-3 py-1.5 rounded-lg hover:bg-[#161b22] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  )
}

export default ErrorState
