import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, PackageSearch, ChevronDown } from 'lucide-react'
import { loadAnimals, setFilters } from '../features/animals/animalsSlice'
import { animalTypes, breedsByType, ageRanges } from '../data/mockAnimals'
import AnimalCard from '../Components/animals/AnimalCard'
import FilterDrawer from '../Components/animals/FilterDrawer'
import Spinner from '../components/common/Spinner'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

function BrowsePage() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items, filters, status, error } = useSelector((state) => state.animals)
  const availableItems = items.filter((animal) => animal?.available === true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expandedFilters, setExpandedFilters] = useState({
    type: true,
    breed: false,
    age: false,
  })
  const searchInputRef = useRef(null)
  const currentSearch = searchParams.get('q') || searchParams.get('search') || ''
  const [searchInput, setSearchInput] = useState(currentSearch)

  useEffect(() => {
    setSearchInput(currentSearch)
  }, [currentSearch])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim()
      dispatch(setFilters({ search: trimmed }))
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous)
        if (trimmed) next.set('q', trimmed)
        else next.delete('q')
        next.delete('search')
        return next
      }, { replace: true })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [dispatch, searchInput, setSearchParams])

  function toggleFilterSection(section) {
    setExpandedFilters((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  useEffect(() => {
    dispatch(loadAnimals(filters))
  }, [dispatch, filters])

  const normalizedSearch = searchInput.trim().toLowerCase()
  const displayedItems = normalizedSearch
    ? availableItems.filter((animal) => [animal.title, animal.type, animal.breed, animal.description]
      .some((value) => String(value || '').toLowerCase().includes(normalizedSearch)))
    : availableItems

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
    <div className="px-4 sm:px-6 pt-4 pb-24 sm:pb-10 max-w-7xl mx-auto">
      {/* Mobile: Search + Filter Drawer */}
      <div className="flex items-center gap-2 mb-4 sm:hidden">
        <div className="flex-1 flex items-center gap-2 bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2">
          <Search size={15} className="text-[#5f6b7a]" aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
      </div>

      {/* Mobile: Type Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:hidden">
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

      {/* Desktop: Two-column layout with sidebar */}
      <div className="hidden sm:grid sm:grid-cols-4 gap-6">
        {/* Left Sidebar - Filters */}
        <div className="col-span-1">
          <div className="sticky top-4 bg-[#161b22] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1f2937]">
              <SlidersHorizontal size={16} className="text-[#2dd4a7]" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-[#f5f5f0]">Filters</h3>
            </div>

            <div className="space-y-2">
              <div className="rounded-lg border border-[#1f2937] bg-[#0d1117] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleFilterSection('type')}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[#8b95a1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
                >
                  <span>Animal Type</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${expandedFilters.type ? 'rotate-180 text-[#2dd4a7]' : ''}`}
                  />
                </button>

                {expandedFilters.type && (
                  <div className="border-t border-[#1f2937] p-2 space-y-2">
                    {animalTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleTypeChange(type)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${
                          filters.type === type
                            ? 'bg-[#2dd4a7]/10 border-[#2dd4a7] text-[#2dd4a7] font-medium'
                            : 'border-[#1f2937] text-[#8b95a1] hover:border-[#2a323d] hover:text-[#f5f5f0]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {(breedsByType[filters.type] || []).length > 0 && (
                <div className="rounded-lg border border-[#1f2937] bg-[#0d1117] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleFilterSection('breed')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[#8b95a1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
                  >
                    <span>Breed</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${expandedFilters.breed ? 'rotate-180 text-[#2dd4a7]' : ''}`}
                    />
                  </button>

                  {expandedFilters.breed && (
                    <div className="border-t border-[#1f2937] p-2 space-y-2 max-h-56 overflow-y-auto">
                      {(breedsByType[filters.type] || []).map((breed) => (
                        <button
                          key={breed}
                          onClick={() => handleFilterChange({ breed: filters.breed === breed ? null : breed })}
                          className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${
                            filters.breed === breed
                              ? 'bg-[#2dd4a7]/10 border-[#2dd4a7] text-[#2dd4a7] font-medium'
                              : 'border-[#1f2937] text-[#8b95a1] hover:border-[#2a323d] hover:text-[#f5f5f0]'
                          }`}
                        >
                          {breed}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-lg border border-[#1f2937] bg-[#0d1117] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleFilterSection('age')}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[#8b95a1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
                >
                  <span>Age Range</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${expandedFilters.age ? 'rotate-180 text-[#2dd4a7]' : ''}`}
                  />
                </button>

                {expandedFilters.age && (
                  <div className="border-t border-[#1f2937] p-2 space-y-2">
                    {ageRanges.map((range) => {
                      const isActive = filters.minAge === range.min && filters.maxAge === range.max
                      return (
                        <button
                          key={range.label}
                          onClick={() => handleFilterChange(isActive ? { minAge: null, maxAge: null } : { minAge: range.min, maxAge: range.max })}
                          className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${
                            isActive
                              ? 'bg-[#2dd4a7]/10 border-[#2dd4a7] text-[#2dd4a7] font-medium'
                              : 'border-[#1f2937] text-[#8b95a1] hover:border-[#2a323d] hover:text-[#f5f5f0]'
                          }`}
                        >
                          {range.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {(filters.breed || filters.minAge || filters.type !== 'All animals') && (
              <button
                onClick={() => {
                  handleTypeChange('All animals')
                  handleFilterChange({ breed: null, minAge: null, maxAge: null })
                }}
                className="w-full text-sm text-[#f87171] hover:text-[#f5f5f0] py-2.5 border border-[#f87171]/30 hover:border-[#f87171]/60 rounded-lg transition-all"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Right Side - Results */}
        <div className="col-span-3">
          {currentSearch && status === 'succeeded' && (
            <p className="text-sm text-[#8b95a1] mb-4">
              {displayedItems.length > 0
                ? `${displayedItems.length} result${displayedItems.length !== 1 ? 's' : ''} for "${currentSearch}"`
                : `No results for "${currentSearch}"`}
            </p>
          )}

          {status === 'loading' && <Spinner label="Loading listings" />}

          {status === 'failed' && <ErrorState message={error} onRetry={handleRetry} />}

          {status === 'succeeded' && displayedItems.length === 0 && (
            <EmptyState
              icon={PackageSearch}
              title={currentSearch ? `No animals matched "${currentSearch}"` : 'No animals match your filters'}
              description="Try a different breed, type, or clear your filters."
            />
          )}

          {status === 'succeeded' && displayedItems.length > 0 && (
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedItems.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Only: Results */}
      <div className="sm:hidden">
        {currentSearch && status === 'succeeded' && (
          <p className="text-xs text-[#8b95a1] mb-3">
            {displayedItems.length > 0
              ? `${displayedItems.length} result${displayedItems.length !== 1 ? 's' : ''} for "${currentSearch}"`
              : `No results for "${currentSearch}"`}
          </p>
        )}

        {status === 'loading' && <Spinner label="Loading listings" />}

        {status === 'failed' && <ErrorState message={error} onRetry={handleRetry} />}

        {status === 'succeeded' && displayedItems.length === 0 && (
          <EmptyState
            icon={PackageSearch}
            title={currentSearch ? `No animals matched "${currentSearch}"` : 'No animals match your filters'}
            description="Try a different breed, type, or clear your filters."
          />
        )}

        {status === 'succeeded' && displayedItems.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {displayedItems.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        )}
      </div>

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
