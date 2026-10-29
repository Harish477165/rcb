import { Star } from 'lucide-react'
import { getStars } from '../../lib/utils'

export default function StarRating({ rating = 0, count, size = 'sm', interactive = false, onChange }) {
  const stars = getStars(rating)
  const sizeClass = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'

  return (
    <div className="star-rating">
      {stars.map((type, i) => (
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          disabled={!interactive}
        >
          <Star
            className={`${sizeClass} ${
              type === 'empty'
                ? 'text-gray-200 fill-gray-200'
                : 'text-amber-400 fill-amber-400'
            } transition-colors`}
          />
        </button>
      ))}
      {count !== undefined && (
        <span className="ml-1.5 text-xs text-gray-500">({count})</span>
      )}
    </div>
  )
}
