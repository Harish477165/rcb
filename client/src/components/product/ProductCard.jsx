import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, Eye, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import StarRating from '../ui/StarRating'
import { useCartStore } from '../../store/cartStore'
import { formatCurrency, discountPercent } from '../../lib/utils'

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock === 0) return
    addItem(product, 1)
    toast.success(`${product.name} added to cart!`, { icon: '🛒' })
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlisted((w) => !w)
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
      icon: wishlisted ? '💔' : '❤️',
    })
  }

  const discount = discountPercent(product.original_price, product.price)

  return (
    <motion.div
      className="card-hover group relative overflow-hidden"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link to={`/products/${product.id}`} className="block">
        {/* Image */}
        <div className="product-image-wrapper relative bg-gray-50 h-52">
          <img
            src={product.image_url || `https://picsum.photos/seed/${product.id}/400/300`}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="badge bg-red-500 text-white shadow-sm">
                -{discount}%
              </span>
            )}
            {product.is_featured && (
              <span className="badge bg-primary-600 text-white shadow-sm">
                <Zap className="w-3 h-3 mr-0.5" /> Featured
              </span>
            )}
            {product.stock === 0 && (
              <span className="badge bg-gray-700 text-white shadow-sm">
                Out of Stock
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="badge-orange">
                Only {product.stock} left
              </span>
            )}
          </div>

          {/* Action buttons overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              className={`p-2 rounded-xl shadow-md transition-colors ${
                wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
            </button>
            <Link
              to={`/products/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-white rounded-xl shadow-md text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {product.category_name && (
            <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
              {product.category_name}
            </span>
          )}
          
          <h3 className="mt-1 font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
            {product.name}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5">
            <StarRating rating={product.rating || 0} count={product.review_count} />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="ml-1.5 text-xs text-gray-400 line-through">
                  {formatCurrency(product.original_price)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {product.stock === 0 ? 'Sold Out' : 'Add'}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
