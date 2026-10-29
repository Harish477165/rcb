import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, Search, X, ChevronDown, LayoutGrid, List, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { productsAPI, categoriesAPI } from '../lib/api'
import ProductCard from '../components/product/ProductCard'
import { ProductCardSkeleton } from '../components/ui/Skeleton'
import { formatCurrency, debounce } from '../lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'popular', label: 'Most Popular' },
]

const RATING_OPTIONS = [4, 3, 2, 1]

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '')
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  // Sync search params → state
  useEffect(() => {
    setSearch(searchParams.get('search') || '')
    setCategory(searchParams.get('category') || '')
    setSort(searchParams.get('sort') || 'newest')
  }, [searchParams])

  // Build query params for API
  const queryParams = {
    search: search || undefined,
    category: category || undefined,
    sort,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    rating: minRating || undefined,
    inStock: inStock || undefined,
    page,
    limit: 12,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productsAPI.getAll(queryParams).then((r) => r.data),
    keepPreviousData: true,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then((r) => r.data),
  })

  const products = data?.products || data || []
  const total = data?.total || products.length
  const totalPages = data?.totalPages || Math.ceil(total / 12)

  const applyFilters = useCallback(
    debounce((params) => {
      const p = {}
      if (params.search) p.search = params.search
      if (params.category) p.category = params.category
      if (params.sort && params.sort !== 'newest') p.sort = params.sort
      if (params.minPrice) p.minPrice = params.minPrice
      if (params.maxPrice) p.maxPrice = params.maxPrice
      if (params.minRating) p.rating = params.minRating
      if (params.inStock) p.inStock = 'true'
      setSearchParams(p)
      setPage(1)
    }, 400),
    [setSearchParams]
  )

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    applyFilters({ search: e.target.value, category, sort, minPrice, maxPrice, minRating, inStock })
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setSort('newest')
    setMinPrice('')
    setMaxPrice('')
    setMinRating('')
    setInStock(false)
    setSearchParams({})
    setPage(1)
  }

  const hasActiveFilters = search || category || minPrice || maxPrice || minRating || inStock

  return (
    <div className="min-h-screen bg-surface-50">
      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="section-title">
                {category
                  ? categories.find((c) => c.slug === category)?.name || 'Category'
                  : search ? `Results for "${search}"` : 'All Products'
                }
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {isLoading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
              </p>
            </div>
            
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm text-gray-400">
              <Link to="/" className="hover:text-primary-600">Home</Link>
              <span>/</span>
              <span className="text-gray-600">
                {category ? categories.find((c) => c.slug === category)?.name || category : 'Shop'}
              </span>
            </nav>
          </div>
        </div>
      </div>

      <div className="page-container py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ─── FILTERS SIDEBAR ─────────────────────────────────────────── */}
          <div className={`lg:w-64 flex-shrink-0`}>
            {/* Mobile filter toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl"
              >
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  <Filter className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">!</span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <AnimatePresence>
              {(filtersOpen || window.innerWidth >= 1024) && (
                <motion.aside
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-5 overflow-hidden lg:block"
                >
                  {/* Search */}
                  <div className="card p-4">
                    <h3 className="font-semibold text-sm text-gray-900 mb-3">Search</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search products..."
                        className="input-field pl-10 text-sm"
                      />
                      {search && (
                        <button
                          onClick={() => { setSearch(''); applyFilters({ category, sort, minPrice, maxPrice, minRating, inStock }) }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="card p-4">
                    <h3 className="font-semibold text-sm text-gray-900 mb-3">Category</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => { setCategory(''); applyFilters({ search, sort, minPrice, maxPrice, minRating, inStock, category: '' }) }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => { setCategory(cat.slug); applyFilters({ search, sort, minPrice, maxPrice, minRating, inStock, category: cat.slug }) }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${category === cat.slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          <span>{cat.name}</span>
                          {cat.product_count > 0 && (
                            <span className="text-xs text-gray-400">({cat.product_count})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="card p-4">
                    <h3 className="font-semibold text-sm text-gray-900 mb-3">Price Range</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => { setMinPrice(e.target.value); applyFilters({ search, category, sort, minPrice: e.target.value, maxPrice, minRating, inStock }) }}
                        placeholder="Min"
                        className="input-field text-sm w-full"
                        min="0"
                      />
                      <span className="text-gray-400 flex-shrink-0">–</span>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => { setMaxPrice(e.target.value); applyFilters({ search, category, sort, minPrice, maxPrice: e.target.value, minRating, inStock }) }}
                        placeholder="Max"
                        className="input-field text-sm w-full"
                        min="0"
                      />
                    </div>
                    {/* Preset ranges */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {[['0','50'],['50','200'],['200','500'],['500','']].map(([mn, mx]) => (
                        <button
                          key={`${mn}-${mx}`}
                          onClick={() => { setMinPrice(mn); setMaxPrice(mx); applyFilters({ search, category, sort, minPrice: mn, maxPrice: mx, minRating, inStock }) }}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-lg transition-colors"
                        >
                          {mx ? `$${mn}–$${mx}` : `$${mn}+`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="card p-4">
                    <h3 className="font-semibold text-sm text-gray-900 mb-3">Min. Rating</h3>
                    <div className="space-y-1.5">
                      {RATING_OPTIONS.map((r) => (
                        <button
                          key={r}
                          onClick={() => { setMinRating(String(r)); applyFilters({ search, category, sort, minPrice, maxPrice, minRating: String(r), inStock }) }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${minRating === String(r) ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={`text-xs ${i < r ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                            ))}
                          </div>
                          <span>& up</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="card p-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => { setInStock(e.target.checked); applyFilters({ search, category, sort, minPrice, maxPrice, minRating, inStock: e.target.checked }) }}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">In Stock Only</span>
                    </label>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="w-full btn-secondary text-sm text-red-600 border-red-200 hover:bg-red-50">
                      <X className="w-4 h-4" /> Clear All Filters
                    </button>
                  )}
                </motion.aside>
              )}
            </AnimatePresence>
          </div>

          {/* ─── PRODUCTS AREA ───────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 bg-white rounded-xl border border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{products.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{total}</span> products
              </p>
              <div className="flex items-center gap-3">
                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); applyFilters({ search, category, sort: e.target.value, minPrice, maxPrice, minRating, inStock }) }}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                {/* View mode */}
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    Search: "{search}"
                    <button onClick={() => { setSearch(''); applyFilters({ category, sort, minPrice, maxPrice, minRating, inStock }) }}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    {categories.find(c => c.slug === category)?.name || category}
                    <button onClick={() => { setCategory(''); applyFilters({ search, sort, minPrice, maxPrice, minRating, inStock, category: '' }) }}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    ${minPrice || '0'} – ${maxPrice || '∞'}
                    <button onClick={() => { setMinPrice(''); setMaxPrice(''); applyFilters({ search, category, sort, minRating, inStock }) }}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minRating && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    {minRating}+ Stars
                    <button onClick={() => { setMinRating(''); applyFilters({ search, category, sort, minPrice, maxPrice, inStock }) }}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Product grid / list */}
            {isLoading || isFetching ? (
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">No products found</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-xs">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button onClick={clearFilters} className="mt-4 btn-primary text-sm">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                        page === p ? 'bg-primary-600 text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
