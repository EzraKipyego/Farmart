import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, PackageSearch } from 'lucide-react'
import { loadFarmerListings, removeAnimal } from '../features/animals/animalsSlice'
import AnimalImage from '../components/common/AnimalImage'
import Spinner from '../components/common/Spinner'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

function FarmerListingsPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { farmerListings, farmerListingsStatus, error } = useSelector((state) => state.animals)

  useEffect(() => {
    if (user?.id) {
      dispatch(loadFarmerListings(user.id))
    }
  }, [dispatch, user?.id])

  async function handleDelete(id, title) {
    if (!window.confirm(`Remove "${title}" from your listings?`)) return
    try {
      await dispatch(removeAnimal(id)).unwrap()
    } catch (err) {
      console.error('[FarmerListingsPage] failed to delete listing:', err)
    }
  }

  return (
    <div className="px-4 sm:px-6 pt-4 pb-24 sm:pb-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-base font-medium text-[#f5f5f0]">My animals</h1>
        <Link
          to="/farmer/listings/new"
          className="flex items-center gap-1.5 bg-[#2dd4a7] text-[#04342c] text-xs font-medium px-3.5 py-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
        >
          <Plus size={14} aria-hidden="true" />
          Add listing
        </Link>
      </div>

      {farmerListingsStatus === 'loading' && <Spinner label="Loading your listings" />}
      {farmerListingsStatus === 'failed' && (
        <ErrorState message={error} onRetry={() => user?.id && dispatch(loadFarmerListings(user.id))} />
      )}
      {farmerListingsStatus === 'succeeded' && farmerListings.length === 0 && (
        <EmptyState
          icon={PackageSearch}
          title="You haven't listed any animals yet"
          description="Add your first listing to start selling directly to buyers."
        />
      )}

      {farmerListingsStatus === 'succeeded' && farmerListings.length > 0 && (
        <div className="flex flex-col gap-2">
          {farmerListings.map((animal) => (
            <div key={animal.id} className="flex items-center gap-3 bg-[#161b22] border border-[#1f2937] rounded-lg p-3">
              <AnimalImage type={animal.type} size={20} className="w-12 h-12 rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#f5f5f0] truncate">{animal.breed} — {animal.title}</p>
                <p className="text-[11px] text-[#8b95a1]">KSh {animal.price.toLocaleString()} · {animal.age} {animal.ageUnit}</p>
              </div>
              <Link
                to={`/farmer/listings/${animal.id}/edit`}
                aria-label={`Edit ${animal.title}`}
                className="text-[#5f6b7a] hover:text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-md p-1.5"
              >
                <Pencil size={16} aria-hidden="true" />
              </Link>
              <button
                onClick={() => handleDelete(animal.id, animal.title)}
                aria-label={`Delete ${animal.title}`}
                className="text-[#5f6b7a] hover:text-[#f87171] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-md p-1.5"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FarmerListingsPage
