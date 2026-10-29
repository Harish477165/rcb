import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  ShoppingCart, Heart, Share2, ArrowLeft, Check,
  Truck, Shield, RefreshCw, Package, Minus, Plus,
  ChevronRight, Star
} from 'lucide-react'
import { productsAPI, reviewsAPI } from '../lib/api'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import StarRating from '../components/ui/StarRating'
import ProductCard from '../components/product/ProductCard'
import { PageLoader } from '../components/ui/Spinner'
import { formatCurrency, discountPercent, formatDate } from '../lib/utils'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const { user } = useAuthStore()

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getById(id).then((r) => r.data),
    enabled: !!id,
  })

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsAPI.getByProduct(id).then((r) => r.data),
    enabled: !!id,
  })

  const { data: related = [] } = useQuery({
    queryKey: ['products-related', product?.category_id],
    queryFn: () =>
      productsAPI.getAll({ category: product?.category_slug, limit: 4 })
        .then((r) => (r.data.products || r.data).filter((p) => p.id !== product.id).slice(0, 4)),
    enabled: !!product?.category_id,
  })

  if (isLoading) return <PageLoader />
  if (error || !product) {
    return (
      <div className="page-container py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <Link to="/catalog" className="btn-primary mt-4 inline-flex">Back to Catalog</Link>
      </div>
    )
  }

  const images = product.images?.length > 0
    ? product.images
    : [product.image_url || `https://picsum.photos/seed/${product.id}/600/500`]

  const discount = discountPercent(product.original_price, product.price)

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast.success(`${product.name} added to cart!`, { icon: '🛒' })
  }

  const handleBuyNow = () => {
    addItem(product, quantity)
    navigate('/cart')
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please login to leave a review'); return }
    setSubmittingReview(true)
    try {
      await reviewsAPI.create({ product_id: id, rating: reviewRating, comment: reviewText })
      toast.success('Review submitted!')
      setReviewText('')
      setReviewRating(5)
      refetchReviews()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/catalog" className="hover:text-primary-600">Shop</Link>
            {product.category_name && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to={`/catalog?category=${product.category_slug}`} className="hover:text-primary-600">
                  {product.category_name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* ─── IMAGES ──────────────────────────────────────────────────── */}
          <div>
            <motion.div
              className="relative bg-white rounded-2xl overflow-hidden aspect-square border border-gray-100 shadow-card"
              layoutId={`product-image-${id}`}
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 badge bg-red-500 text-white text-sm px-3 py-1">
                  -{discount}% OFF
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white px-6 py-2 rounded-full font-bold text-gray-900">Out of Stock</span>
                </div>
              )}
            </motion.div>

            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
                      selectedImage === i ? 'border-primary-600 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── PRODUCT INFO ─────────────────────────────────────────────── */}
          <div>
            {product.category_name && (
              <Link
                to={`/catalog?category=${product.category_slug}`}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 uppercase tracking-wide"
              >
                {product.category_name}
              </Link>
            )}

            <h1 className="mt-2 font-display text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={product.rating || 0} count={reviews.length} size="md" />
              <span className="text-sm text-gray-500">{product.rating?.toFixed(1) || '0.0'} average</span>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-end gap-3">
              <span className="font-display text-3xl font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through mb-1">
                    {formatCurrency(product.original_price)}
                  </span>
                  <span className="badge-red mb-1">Save {formatCurrency(product.original_price - product.price)}</span>
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className="mt-3">
              {product.stock === 0 ? (
                <span className="badge-red text-sm px-3 py-1">Out of Stock</span>
              ) : product.stock <= 5 ? (
                <span className="badge-orange text-sm px-3 py-1">
                  Only {product.stock} left in stock — order soon
                </span>
              ) : (
                <span className="badge-green text-sm px-3 py-1">
                  <Check className="w-3.5 h-3.5 mr-1" /> In Stock ({product.stock} available)
                </span>
              )}
            </div>

            <hr className="my-5 border-gray-100" />

            {/* Short description */}
            {product.short_description && (
              <p className="text-gray-600 text-sm leading-relaxed">{product.short_description}</p>
            )}

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="mt-6">
                <label className="label">Quantity</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-5 py-2.5 font-semibold text-gray-900 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="px-3 py-2.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">Max {product.stock}</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary flex-1 min-w-[160px]"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn-secondary flex-1 min-w-[160px] border-primary-200 text-primary-700 hover:bg-primary-50"
              >
                Buy Now
              </button>
              <button className="btn-secondary p-2.5 aspect-square">
                <Heart className="w-5 h-5" />
              </button>
              <button className="btn-secondary p-2.5 aspect-square">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Guarantees */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Free Delivery', sub: 'Orders $99+' },
                { icon: Shield, label: 'Warranty', sub: '1 year included' },
                { icon: RefreshCw, label: 'Easy Returns', sub: '30-day policy' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Icon className="w-5 h-5 text-primary-600 mb-1.5" />
                  <p className="text-xs font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
              ))}
            </div>

            {/* SKU / Brand */}
            {(product.brand || product.sku) && (
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                {product.brand && <span>Brand: <span className="font-medium text-gray-700">{product.brand}</span></span>}
                {product.sku && <span>SKU: <span className="font-medium text-gray-700">{product.sku}</span></span>}
              </div>
            )}
          </div>
        </div>

        {/* ─── TABS ────────────────────────────────────────────────────────── */}
        <div className="mt-12">
          <div className="flex border-b border-gray-200 gap-1">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab
                    ? 'text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {tab === 'reviews' && ` (${reviews.length})`}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === 'description' && (
              <div className="card p-6">
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                  <p>{product.description || 'No description available for this product.'}</p>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="card overflow-hidden">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value], i) => (
                        <tr key={key} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-3 font-medium text-gray-700 w-1/3">{key}</td>
                          <td className="px-6 py-3 text-gray-600">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="p-6 text-gray-500">No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Review summary */}
                <div className="card p-6 flex flex-col md:flex-row gap-6 items-center">
                  <div className="text-center">
                    <p className="font-display text-6xl font-bold text-gray-900">
                      {product.rating?.toFixed(1) || '0.0'}
                    </p>
                    <StarRating rating={product.rating || 0} size="lg" />
                    <p className="text-sm text-gray-500 mt-1">{reviews.length} reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => r.rating === star).length
                      const pct = reviews.length ? (count / reviews.length) * 100 : 0
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs w-3 text-gray-500">{star}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-5">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Review list */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="card p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-sm">
                              {review.user_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{review.user_name || 'Anonymous'}</p>
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                        </div>
                        {review.comment && (
                          <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card p-8 text-center">
                    <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                  </div>
                )}

                {/* Write review */}
                {user ? (
                  <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="label">Your Rating</label>
                        <StarRating rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
                      </div>
                      <div>
                        <label className="label">Your Review</label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your experience with this product..."
                          className="input-field resize-none"
                          rows={4}
                          required
                        />
                      </div>
                      <button type="submit" disabled={submittingReview} className="btn-primary">
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="card p-5 text-center text-sm text-gray-500">
                    <Link to="/login" className="text-primary-600 font-medium hover:underline">Login</Link>
                    {' '}to write a review
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── RELATED PRODUCTS ──────────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="section-title mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
