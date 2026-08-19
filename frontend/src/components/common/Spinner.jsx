import { Loader2 } from 'lucide-react'

function Spinner({ label = 'Loading' }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-2 py-12 text-[#8b95a1]">
      <Loader2 size={22} className="animate-spin text-[#2dd4a7]" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export default Spinner
