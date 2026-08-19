import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, PackageSearch } from 'lucide-react'
import { loadAnimals, setFilters } from '../features/animals/animalsSlice'
import { animalTypes } from '../data/mockAnimals'
import AnimalCard from '../components/animals/AnimalCard'
import FilterDrawer from '../components/animals/FilterDrawer'
import Spinner from '../components/common/Spinner'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

function BrowsePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { items, filters, status, error } = useSelector((state) => state.animals)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const searchInputRef = useRef(null)
  const currentSearch = searchParams.get('search') || ''

  useEffect(() => {
    dispatch(setFilters({ search: currentSearch }))
  }, [dispatch, currentSearch])

  useEffect(() => {
    dispatch(loadAnimals(filters))
  }, [dispatch, filters])

  function handleSearchSubmit(e) {
    e.preventDefault()
    const trimmed = (searchInputRef.current?.value || '').trim()
    navigate(trimmed ? `/?search=${encodeURIComponent(trimmed)}` : '/')
  }

  function handleTypeChange(type) {
    dispatch(setFilters({ type, breed: null }))
  }

  function handleFilterChange(partialFilters) {
    dispatch(setFilters(partialFilters))
  }

  function handleRetry() {
    dispatch(loadAnimals(filters))
  }

  const activeFilterCount = [filters.breed, filters.minAge].filter((v) => v != null).length

  return (
    <div className="px-4 sm:px-6 pt-4 pb-24 sm:pb-10 max-w-6xl mx-auto">
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 mb-4 sm:hidden">
        <div className="flex-1 flex items-center gap-2 bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2">
          <Search size={15} className="text-[#5f6b7a]" aria-hidden="true" />
          <input
            key={currentSearch}
            ref={searchInputRef}
            type="text"
            defaultValue={currentSearch}
            placeholder="Search"
            className="bg-transparent flex-1 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open filters"
          className="relative w-10 h-10 shrink-0 flex items-center justify-center bg-[#161b22] border border-[#1f2937] rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#2dd4a7] text-[#04342c] text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {animalTypes.map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`shrink-0 text-xs px-3.5 py-1.5 rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${
              filters.type === type
                ? 'bg-[#2dd4a7]/10 border-[#2dd4a7] text-[#2dd4a7]'
                : 'border-[#1f2937] text-[#8b95a1]'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {currentSearch && status === 'succeeded' && (
        <p className="text-xs text-[#8b95a1] mb-3">
          {items.length > 0
            ? `${items.length} result${items.length !== 1 ? 's' : ''} for "${currentSearch}"`
            : `No results for "${currentSearch}"`}
        </p>
      )}

      {status === 'loading' && <Spinner label="Loading listings" />}

      {status === 'failed' && <ErrorState message={error} onRetry={handleRetry} />}

      {status === 'succeeded' && items.length === 0 && (
        <EmptyState
          icon={PackageSearch}
          title={currentSearch ? `No animals matched "${currentSearch}"` : 'No animals match your filters'}
          description="Try a different breed, type, or clear your filters."
        />
      )}

      {status === 'succeeded' && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      )}

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={handleFilterChange}
        activeType={filters.type}
      />
    </div>
  )
}

export default BrowsePage
