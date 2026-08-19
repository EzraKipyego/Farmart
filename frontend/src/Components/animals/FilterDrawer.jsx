import { X, SlidersHorizontal } from 'lucide-react'
import { breedsByType, ageRanges } from '../../data/mockAnimals'

function FilterDrawer({ open, onClose, filters, onChange, activeType }) {
  const breeds = breedsByType[activeType] || []

  function toggleBreed(breed) {
    onChange({ breed: filters.breed === breed ? null : breed })
  }

  function toggleAgeRange(range) {
    const isActive = filters.minAge === range.min && filters.maxAge === range.max
    onChange(isActive ? { minAge: null, maxAge: null } : { minAge: range.min, maxAge: range.max })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex sm:hidden">
      <div className="flex-1 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="w-[86%] max-w-xs bg-[#0d1117] border-l border-[#1f2937] h-full overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-[#2dd4a7]" aria-hidden="true" />
            <h2 className="text-sm font-medium text-[#f5f5f0]">Filters</h2>
          </div>
          <button onClick={onClose} aria-label="Close filters" className="text-[#8b95a1] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-md">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {breeds.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-[#8b95a1] mb-2">Breed</p>
            <div className="flex flex-wrap gap-2">
              {breeds.map((breed) => (
                <button
                  key={breed}
                  onClick={() => toggleBreed(breed)}
                  className={`text-xs px-3 py-1.5 rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${
                    filters.breed === breed
                      ? 'bg-[#2dd4a7]/10 border-[#2dd4a7] text-[#2dd4a7]'
                      : 'border-[#1f2937] text-[#8b95a1]'
                  }`}
                >
                  {breed}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <p className="text-xs text-[#8b95a1] mb-2">Age</p>
          <div className="flex flex-wrap gap-2">
            {ageRanges.map((range) => {
              const isActive = filters.minAge === range.min && filters.maxAge === range.max
              return (
                <button
                  key={range.label}
                  onClick={() => toggleAgeRange(range)}
                  className={`text-xs px-3 py-1.5 rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${
                    isActive ? 'bg-[#2dd4a7]/10 border-[#2dd4a7] text-[#2dd4a7]' : 'border-[#1f2937] text-[#8b95a1]'
                  }`}
                >
                  {range.label}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => {
            onChange({ breed: null, minAge: null, maxAge: null })
          }}
          className="text-xs text-[#8b95a1] underline mb-6"
        >
          Clear all
        </button>

        <button
          onClick={onClose}
          className="w-full bg-[#2dd4a7] text-[#04342c] font-medium text-sm py-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
        >
          Show results
        </button>
      </div>
    </div>
  )
}

export default FilterDrawer
