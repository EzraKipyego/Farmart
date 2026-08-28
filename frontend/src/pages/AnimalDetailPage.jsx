import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Star, BadgeCheck, ShieldCheck, Syringe, Plus, Minus } from 'lucide-react'
import { loadAnimalDetail } from '../features/animals/animalsSlice'
import { addToCart } from '../features/cart/cartSlice'
import AnimalImage from '../components/common/AnimalImage'
import Spinner from '../components/common/Spinner'
import ErrorState from '../components/common/ErrorState'

function AnimalDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selectedAnimal: animal, detailStatus, error } = useSelector((state) => state.animals)
  const [quantity, setQuantity] = useState(1)
  const [addedMessage, setAddedMessage] = useState(false)

  useEffect(() => {
    dispatch(loadAnimalDetail(id))
  }, [dispatch, id])

  function handleAddToCart() {
    if (!animal) return
    for (let i = 0; i < quantity; i += 1) {
      dispatch(addToCart(animal))
    }
    setAddedMessage(true)
    setTimeout(() => setAddedMessage(false), 2000)
  }

  function handleBuyNow() {
    if (!animal) return
    dispatch(addToCart(animal))
    navigate('/cart')
  }

  if (detailStatus === 'loading') return <Spinner label="Loading listing" />
  if (detailStatus === 'failed') return <ErrorState message={error} onRetry={() => dispatch(loadAnimalDetail(id))} />
  if (!animal) return null

  return (
    <div className="px-4 sm:px-6 pt-4 pb-28 sm:pb-10 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-[#8b95a1] mb-4 outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-md"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Back
      </button>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <AnimalImage type={animal.type} src={animal.image} size={56} className="w-full h-56 sm:h-72 rounded-xl" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-[#5f6b7a] mb-1">
            {animal.breed} · {animal.type}
          </p>
          <h1 className="text-xl font-medium text-[#f5f5f0] mb-1">{animal.title}</h1>
          <p className="text-xs text-[#8b95a1] mb-4">Listed by {animal.farmerName}</p>

          <div className="flex flex-wrap gap-2 mb-5">
            {animal.verified && (
              <span className="flex items-center gap-1 bg-[#2dd4a7]/10 text-[#2dd4a7] text-[11px] px-2.5 py-1 rounded-md">
                <BadgeCheck size={11} aria-hidden="true" />
                Verified farmer
              </span>
            )}
            {animal.vaccinated && (
              <span className="flex items-center gap-1 bg-[#161b22] text-[#8b95a1] text-[11px] px-2.5 py-1 rounded-md border border-[#1f2937]">
                <Syringe size={11} aria-hidden="true" />
                Vaccinated
              </span>
            )}
            {animal.healthCertified && (
              <span className="flex items-center gap-1 bg-[#161b22] text-[#8b95a1] text-[11px] px-2.5 py-1 rounded-md border border-[#1f2937]">
                <ShieldCheck size={11} aria-hidden="true" />
                Health certified
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#161b22] border border-[#1f2937] rounded-lg p-3">
              <p className="text-[11px] text-[#8b95a1] mb-0.5">Age</p>
              <p className="text-sm text-[#f5f5f0] font-medium">{animal.age} {animal.ageUnit}</p>
            </div>
            <div className="bg-[#161b22] border border-[#1f2937] rounded-lg p-3">
              <p className="text-[11px] text-[#8b95a1] mb-0.5">Weight</p>
              <p className="text-sm text-[#f5f5f0] font-medium">{animal.weight} kg</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#161b22] border border-[#1f2937] rounded-lg p-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-[#2dd4a7]/10 text-[#2dd4a7] flex items-center justify-center text-xs font-medium shrink-0">
              {animal.farmerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#f5f5f0]">{animal.farmerName}</p>
              <p className="text-[11px] text-[#8b95a1]">{animal.location}</p>
            </div>
            {animal.farmerRating && (
              <div className="flex items-center gap-1 text-xs text-[#f5f5f0]">
                <Star size={12} className="text-[#facc15] fill-[#facc15]" aria-hidden="true" />
                {animal.farmerRating}
              </div>
            )}
          </div>

          {animal.description && <p className="text-sm text-[#8b95a1] mb-5 leading-relaxed">{animal.description}</p>}

          <p className="text-[11px] text-[#8b95a1] mb-1">Price</p>
          <p className="text-2xl font-medium text-[#f5f5f0] mb-4">KSh {Math.round(animal.price).toLocaleString()}</p>

          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs text-[#8b95a1]">Quantity</span>
            <div className="flex items-center gap-3 bg-[#161b22] border border-[#1f2937] rounded-lg px-2 py-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-7 h-7 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-md"
              >
                <Minus size={14} aria-hidden="true" />
              </button>
              <span className="text-sm text-[#f5f5f0] w-4 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="w-7 h-7 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-md"
              >
                <Plus size={14} aria-hidden="true" />
              </button>
            </div>
          </div>

          {addedMessage && <p className="text-xs text-[#2dd4a7] mb-3">Added to cart.</p>}

          <div className="hidden sm:flex gap-3">
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-[#2dd4a7] text-[#04342c] font-medium text-sm py-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            >
              Buy now
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 border border-[#1f2937] text-[#f5f5f0] font-medium text-sm py-3 rounded-lg hover:bg-[#161b22] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-[#0d1117] border-t border-[#1f2937] p-3 flex gap-3 z-40">
        <button
          onClick={handleBuyNow}
          className="flex-1 bg-[#2dd4a7] text-[#04342c] font-medium text-sm py-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
        >
          Buy now
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-1 border border-[#1f2937] text-[#f5f5f0] font-medium text-sm py-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}

export default AnimalDetailPage
