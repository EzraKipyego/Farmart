import { Beef, Rabbit, Bird } from 'lucide-react'

const iconByType = {
  Cattle: Beef,
  Goats: Beef,
  Sheep: Beef,
  Pigs: Beef,
  Poultry: Bird,
  Rabbits: Rabbit,
}

const bgByType = {
  Cattle: 'bg-emerald-500/10 text-emerald-400',
  Goats: 'bg-amber-500/10 text-amber-400',
  Sheep: 'bg-sky-500/10 text-sky-400',
  Pigs: 'bg-pink-500/10 text-pink-400',
  Poultry: 'bg-orange-500/10 text-orange-400',
  Rabbits: 'bg-violet-500/10 text-violet-400',
}

function AnimalImage({ type, size = 28, className = '' }) {
  const Icon = iconByType[type] || Beef
  const colors = bgByType[type] || 'bg-[#161b22] text-[#8b95a1]'
  return (
    <div className={`flex items-center justify-center ${colors} ${className}`}>
      <Icon size={size} aria-hidden="true" />
    </div>
  )
}

export default AnimalImage
