import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ShoppingBag, Star, Zap, Shield, Truck,
  ChevronRight, Play, Cpu, Smartphone, Headphones,
  Camera, Home, Gamepad2, TrendingUp, Clock, Percent
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productsAPI, categoriesAPI } from '../lib/api'
import ProductCard from '../components/product/ProductCard'
import { ProductCardSkeleton } from '../components/ui/Skeleton'
import { formatCurrency, categoryGradient } from '../lib/utils'

// ─── Hero Slides ────────────────────────────────────────────────────────────
const heroSlides = [
  {
    id: 1,
    tag: 'New Arrival',
    title: 'Next-Gen Laptops',
    subtitle: 'Supercharge Your Workflow',
    description: 'Discover our latest lineup of ultra-fast laptops with AI-enhanced performance and all-day battery life.',
    cta: 'Shop Laptops',
    link: '/catalog?category=laptops',
    accent: 'from-primary-400 to-purple-400',
    bg: 'from-slate-900 via-primary-950 to-slate-900',
    badge: '🔥 Hot Deal',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
  },
  {
    id: 2,
    tag: 'Best Seller',
    title: 'Premium Headphones',
    subtitle: 'Immersive Sound Experience',
    description: 'Lose yourself in crystal-clear audio with our award-winning noise-cancelling headphones.',
    cta: 'Shop Audio',
    link: '/catalog?category=audio',
    accent: 'from-purple-400 to-pink-400',
    bg: 'from-purple-950 via-slate-900 to-purple-950',
    badge: '⭐ Editor\'s Choice',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  },
  {
    id: 3,
    tag: 'Limited Offer',
    title: 'Smartphones 2025',
    subtitle: 'Photography Redefined',
    description: 'Capture life in stunning detail with the most advanced camera systems ever put in a phone.',
    cta: 'Shop Phones',
    link: '/catalog?category=phones',
    accent: 'from-cyan-400 to-primary-400',
    bg: 'from-cyan-950 via-slate-900 to-cyan-950',
    badge: '💥 Up to 30% Off',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
  },
]

// ─── Category Icons ─────────────────────────────────────────────────────────
const categoryIcons = {
  laptops: Cpu,
  phones: Smartphone,
  audio: Headphones,
  cameras: Camera,
  smarthome: Home,
  gaming: Gamepad2,
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const { data: featuredProducts = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsAPI.getFeatured().then((r) => r.data),
  })

  const { data: allProducts = [], isLoading: loadingAll } = useQuery({
    queryKey: ['products-home'],
    queryFn: () => productsAPI.getAll({ limit: 8, sort: 'newest' }).then((r) => r.data.products || r.data),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then((r) => r.data),
  })

  const slide = heroSlides[currentSlide]

  return (
    <div className="min-h-screen">

      {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${slide.bg} transition-all duration-700`}>
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="page-container py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium mb-5 border border-white/20">
                  <span className="text-base">{slide.badge?.split(' ')[0]}</span>
                  <span>{slide.tag}</span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  {slide.title}
                  <br />
                  <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>
                    {slide.subtitle}
                  </span>
                </h1>

                <p className="mt-5 text-gray-300 text-lg max-w-md leading-relaxed">
                  {slide.description}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link to={slide.link} className="btn-primary text-base px-6 py-3 shadow-glow">
                    {slide.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/catalog" className="flex items-center gap-2 text-white/80 hover:text-white font-medium transition-colors">
                    <Play className="w-5 h-5" /> View All Products
                  </Link>
                </div>

                {/* Trust signals */}
                <div className="mt-10 flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-400" />
                    <span>Free shipping $99+</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>4.9/5 rating</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Hero image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id + '-img'}
                initial={{ opacity: 0, scale: 0.9, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -30 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative hidden lg:block"
              >
                <div className="relative">
                  {/* Glow */}
                  <div className="absolute inset-0 bg-primary-500/20 rounded-3xl blur-3xl scale-90" />
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="relative w-full max-w-lg mx-auto object-cover rounded-3xl shadow-2xl"
                    style={{ height: '420px' }}
                  />
                  {/* Floating badge */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">This week</p>
                        <p className="text-sm font-bold text-gray-900">+2,840 sold</p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
                    className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-900">4.9/5</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">12,400+ reviews</p>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ─── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="page-container py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Products', value: '10,000+' },
              { label: 'Happy Customers', value: '250K+' },
              { label: 'Avg. Rating', value: '4.9 ★' },
              { label: 'Countries Shipped', value: '80+' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="font-display font-bold text-2xl text-primary-700">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="py-14 bg-surface-50">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Browse our curated electronics collections</p>
            </div>
            <Link to="/catalog" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              All categories <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.length > 0
              ? categories.slice(0, 6).map((cat, i) => {
                  const Icon = categoryIcons[cat.slug] || Zap
                  return (
                    <Link
                      key={cat.id}
                      to={`/catalog?category=${cat.slug}`}
                      className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 ${categoryGradient(i)}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 text-center">{cat.name}</span>
                    </Link>
                  )
                })
              : Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-28 skeleton rounded-2xl" />
                ))
            }
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ────────────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Featured</span>
              </div>
              <h2 className="section-title">Handpicked For You</h2>
              <p className="section-subtitle">Our editors' top selections this week</p>
            </div>
            <Link to="/catalog?featured=true" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loadingFeatured
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
            }
          </div>
        </div>
      </section>

      {/* ─── PROMO BANNER ─────────────────────────────────────────────────── */}
      <section className="py-8 bg-surface-50">
        <div className="page-container">
          <div className="relative offer-gradient rounded-3xl overflow-hidden px-8 py-10 md:py-12">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '30px 30px',
              }}
            />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                  <Clock className="w-3.5 h-3.5" /> Limited Time
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                  Flash Sale: Up to <span className="text-yellow-300">40% Off</span>
                </h2>
                <p className="mt-2 text-purple-100 text-base">On selected premium electronics. Today only!</p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-3 text-center">
                  {['23', '59', '42'].map((v, i) => (
                    <div key={i} className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[60px]">
                      <div className="font-display text-2xl font-bold text-white">{v}</div>
                      <div className="text-xs text-purple-200">{['HRS', 'MIN', 'SEC'][i]}</div>
                    </div>
                  ))}
                </div>
                <Link to="/catalog?sale=true" className="bg-white text-purple-700 hover:bg-purple-50 font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
                  <Percent className="w-4 h-4" /> Shop Flash Sale
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NEW ARRIVALS ─────────────────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-semibold text-primary-600 uppercase tracking-wide">Just In</span>
              </div>
              <h2 className="section-title">New Arrivals</h2>
              <p className="section-subtitle">The latest tech, fresh off the production line</p>
            </div>
            <Link to="/catalog?sort=newest" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              See more <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loadingAll
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : allProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
            }
          </div>
        </div>
      </section>

      {/* ─── WHY SHOPFORGE ────────────────────────────────────────────────── */}
      <section className="py-14 bg-gradient-to-br from-primary-950 to-slate-900">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white">Why Choose ShopForge?</h2>
            <p className="mt-2 text-gray-400">We're committed to making your tech shopping experience exceptional</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Genuine Products',
                desc: 'All products are 100% authentic and covered by manufacturer warranty.',
                color: 'text-green-400',
                bg: 'bg-green-400/10',
              },
              {
                icon: Truck,
                title: 'Fast Delivery',
                desc: 'Express shipping available. Get your orders in 1-3 business days.',
                color: 'text-blue-400',
                bg: 'bg-blue-400/10',
              },
              {
                icon: ShoppingBag,
                title: 'Easy Returns',
                desc: '30-day hassle-free return policy on all products, no questions asked.',
                color: 'text-purple-400',
                bg: 'bg-purple-400/10',
              },
              {
                icon: Star,
                title: '24/7 Support',
                desc: 'Our expert team is always ready to help you find the perfect product.',
                color: 'text-amber-400',
                bg: 'bg-amber-400/10',
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <motion.div
                key={title}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-semibold text-white text-base mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ───────────────────────────────────────────────────── */}
      <section className="py-14 bg-surface-50">
        <div className="page-container">
          <div className="bg-white rounded-3xl shadow-card border border-gray-100 px-8 py-12 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Stay in the Loop</h2>
            <p className="mt-2 text-gray-500 text-sm">
              Get exclusive deals, new arrivals, and tech news delivered to your inbox.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!') }}
              className="mt-6 flex gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary flex-shrink-0">
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-gray-400">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
