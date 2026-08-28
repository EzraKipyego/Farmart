import { Link } from 'react-router-dom'
import { Star, BadgeCheck } from 'lucide-react'
import AnimalImage from '../../components/common/AnimalImage'

function AnimalCard({ animal }) {
  return (
    <Link
      to={`/animals/${animal.id}`}
      className="block bg-[#161b22] border border-[#1f2937] rounded-xl overflow-hidden hover:border-[#2a323d] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
    >
      <div className="relative h-32 sm:h-36">
        <AnimalImage type={animal.type} src={animal.image} size={32} className="w-full h-full" />
        {animal.verified && (
          <span className="absolute top-2 left-2 flex items-center gap-1 bg-[#0d1117]/80 text-[#2dd4a7] text-[10px] px-2 py-1 rounded-md">
            <BadgeCheck size={11} aria-hidden="true" />
            Verified
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] uppercase tracking-wide text-[#5f6b7a] mb-0.5">{animal.breed}</p>
        <p className="text-sm text-[#f5f5f0] font-medium leading-snug mb-1 line-clamp-2">{animal.title}</p>
        <div className="flex items-center gap-1 text-[11px] text-[#8b95a1] mb-2">
          <span>{animal.location}</span>
          <span aria-hidden="true">·</span>
          <span>{animal.age} {animal.ageUnit}</span>
          {animal.farmerRating && (
            <>
              <span aria-hidden="true">·</span>
              <Star size={10} className="text-[#facc15] fill-[#facc15]" aria-hidden="true" />
              <span>{animal.farmerRating}</span>
            </>
          )}
        </div>
        <p className="text-sm font-medium text-[#f5f5f0]">KSh {Math.round(animal.price).toLocaleString()}</p>
      </div>
    </Link>
  )
}

export default AnimalCard