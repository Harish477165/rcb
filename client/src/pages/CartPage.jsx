import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, Package, Shield, Truck } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { formatCurrency } from '../lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal, getCount } = useCartStore()
  const navigate = useNavigate()

  const subtotal = getTotal()
  const shipping = subtotal >= 99 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-12 h-12 text-primary-300" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="mt-2 text-gray-500 max-w-sm">
            Looks like you haven't added anything yet. Explore our products and find something you love!
          </p>
          <Link to="/catalog" className="btn-primary mt-6 inline-flex">
            Start Shopping
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-5">
          <h1 className="section-title">Shopping Cart</h1>
          <p className="text-sm text-gray-500">{getCount()} item{getCount() !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── CART ITEMS ─────────────────────────────────────────────── */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => navigate(-1)} className="btn-ghost text-sm">
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </button>
              <button
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Cart
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="card p-5 flex flex-col sm:flex-row gap-5"
                  >
                    {/* Image */}
                    <Link to={`/products/${item.id}`} className="flex-shrink-0">
                      <img
                        src={item.image_url || `https://picsum.photos/seed/${item.id}/120/120`}
                        alt={item.name}
                        className="w-full sm:w-24 h-24 object-cover rounded-xl border border-gray-100"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {item.category_name && (
                            <span className="text-xs text-primary-600 font-medium">{item.category_name}</span>
                          )}
                          <Link
                            to={`/products/${item.id}`}
                            className="block mt-0.5 font-semibold text-gray-900 hover:text-primary-700 transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          {item.stock <= 5 && (
                            <span className="text-xs text-orange-500 mt-1 block">Only {item.stock} left!</span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-2 text-gray-500 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-4 py-2 text-sm font-semibold min-w-[2.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="px-3 py-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-400">{formatCurrency(item.price)} each</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* ─── ORDER SUMMARY ───────────────────────────────────────────── */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 text-lg mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getCount()} items)</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span className="font-medium">{formatCurrency(shipping)}</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
                  <Truck className="w-3.5 h-3.5 inline mr-1" />
                  Add <strong>{formatCurrency(99 - subtotal)}</strong> more for free shipping!
                </div>
              )}

              <hr className="my-4 border-gray-100" />

              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(total)}</span>
              </div>

              {/* Promo code */}
              <div className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="input-field text-sm flex-1"
                  />
                  <button className="btn-secondary text-sm px-3">Apply</button>
                </div>
              </div>

              <Link to="/checkout" className="btn-primary w-full mt-4 text-base py-3">
                Proceed to Checkout
              </Link>

              {/* Trust icons */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Secure</div>
                <div className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> Insured</div>
                <div className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Tracked</div>
              </div>

              {/* Accepted payments */}
              <div className="mt-4 flex items-center justify-center gap-2">
                {['VISA', 'MC', 'AMEX', 'PayPal'].map((card) => (
                  <span key={card} className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-500">
                    {card}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
