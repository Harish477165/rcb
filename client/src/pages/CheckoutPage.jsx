import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, Truck, Check, ChevronRight,
  Lock, MapPin, User, Phone, Mail, Banknote, ArrowLeft
} from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { ordersAPI } from '../lib/api'
import { formatCurrency } from '../lib/utils'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'

const STEPS = ['Shipping', 'Payment', 'Review']

export default function CheckoutPage() {
  const [step, setStep] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shippingData, setShippingData] = useState(null)

  const { items, clearCart, getTotal } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
    }
  })

  const subtotal = getTotal()
  const shipping = subtotal >= 99 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const handleShippingSubmit = (data) => {
    setShippingData(data)
    setStep(1)
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)
    try {
      const orderData = {
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity, price: i.price })),
        shipping_address: shippingData,
        payment_method: paymentMethod,
        subtotal,
        shipping_cost: shipping,
        tax,
        total,
      }

      const res = await ordersAPI.create(orderData)
      clearCart()
      navigate(`/orders/${res.data.id}?success=true`)
      toast.success('Order placed successfully! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-5">
          <h1 className="section-title">Checkout</h1>
          {/* Step indicators */}
          <div className="mt-4 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? 'bg-green-500 text-white' :
                    i === step ? 'bg-primary-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:block ${i === step ? 'text-primary-700' : 'text-gray-500'}`}>
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── FORM AREA ────────────────────────────────────────────────── */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {/* STEP 0: Shipping */}
              {step === 0 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="card p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Truck className="w-5 h-5 text-primary-600" />
                      <h2 className="font-semibold text-gray-900 text-lg">Shipping Details</h2>
                    </div>

                    <form onSubmit={handleSubmit(handleShippingSubmit)} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          label="Full Name"
                          icon={User}
                          placeholder="John Doe"
                          error={errors.name?.message}
                          {...register('name', { required: 'Name is required' })}
                        />
                        <Input
                          label="Email Address"
                          type="email"
                          icon={Mail}
                          placeholder="john@example.com"
                          error={errors.email?.message}
                          {...register('email', {
                            required: 'Email is required',
                            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                          })}
                        />
                      </div>
                      <Input
                        label="Phone Number"
                        type="tel"
                        icon={Phone}
                        placeholder="+1 (555) 000-0000"
                        error={errors.phone?.message}
                        {...register('phone', { required: 'Phone is required' })}
                      />
                      <Input
                        label="Street Address"
                        icon={MapPin}
                        placeholder="123 Main Street, Apt 4B"
                        error={errors.address?.message}
                        {...register('address', { required: 'Address is required' })}
                      />
                      <div className="grid sm:grid-cols-3 gap-4">
                        <Input
                          label="City"
                          placeholder="San Francisco"
                          error={errors.city?.message}
                          {...register('city', { required: 'City is required' })}
                        />
                        <Input
                          label="State"
                          placeholder="CA"
                          error={errors.state?.message}
                          {...register('state', { required: 'State is required' })}
                        />
                        <Input
                          label="ZIP Code"
                          placeholder="94105"
                          error={errors.zip?.message}
                          {...register('zip', { required: 'ZIP is required' })}
                        />
                      </div>
                      <div>
                        <label className="label">Country</label>
                        <select
                          className="input-field"
                          {...register('country', { required: 'Country is required' })}
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                          <option value="AU">Australia</option>
                          <option value="DE">Germany</option>
                          <option value="FR">France</option>
                        </select>
                      </div>

                      <button type="submit" className="btn-primary w-full py-3 mt-2">
                        Continue to Payment <ChevronRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: Payment */}
              {step === 1 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="card p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <CreditCard className="w-5 h-5 text-primary-600" />
                      <h2 className="font-semibold text-gray-900 text-lg">Payment Method</h2>
                    </div>

                    <div className="space-y-3">
                      {/* Card payment */}
                      <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="w-4 h-4 text-primary-600"
                        />
                        <CreditCard className="w-5 h-5 text-gray-500" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Credit / Debit Card</p>
                          <p className="text-xs text-gray-500">Visa, Mastercard, Amex</p>
                        </div>
                        <div className="flex gap-1">
                          {['VISA', 'MC', 'AMEX'].map(c => (
                            <span key={c} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-500">{c}</span>
                          ))}
                        </div>
                      </label>

                      {/* Cash on Delivery */}
                      <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="w-4 h-4 text-primary-600"
                        />
                        <Banknote className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">Cash on Delivery</p>
                          <p className="text-xs text-gray-500">Pay when your order arrives</p>
                        </div>
                      </label>
                    </div>

                    {/* Test card form */}
                    {paymentMethod === 'card' && (
                      <div className="mt-5 space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <Lock className="w-3.5 h-3.5" />
                          <span><strong>Test Mode:</strong> Use card 4242 4242 4242 4242, any future date &amp; CVC</span>
                        </div>
                        <Input label="Card Number" placeholder="4242 4242 4242 4242" />
                        <div className="grid grid-cols-2 gap-3">
                          <Input label="Expiry (MM/YY)" placeholder="12/26" />
                          <Input label="CVC" placeholder="123" />
                        </div>
                        <Input label="Name on Card" placeholder="John Doe" />
                      </div>
                    )}

                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={() => setStep(0)}
                        className="btn-secondary"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        className="btn-primary flex-1 py-3"
                      >
                        Review Order <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Review */}
              {step === 2 && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="card p-6">
                    <h2 className="font-semibold text-gray-900 text-lg mb-5">Order Review</h2>

                    {/* Shipping summary */}
                    {shippingData && (
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-sm text-gray-700">Shipping to</h3>
                          <button onClick={() => setStep(0)} className="text-xs text-primary-600 hover:underline">Edit</button>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                          <p className="font-medium text-gray-900">{shippingData.name}</p>
                          <p>{shippingData.address}</p>
                          <p>{shippingData.city}, {shippingData.state} {shippingData.zip}</p>
                          <p>{shippingData.email} · {shippingData.phone}</p>
                        </div>
                      </div>
                    )}

                    {/* Payment summary */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm text-gray-700">Payment Method</h3>
                        <button onClick={() => setStep(1)} className="text-xs text-primary-600 hover:underline">Edit</button>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600 flex items-center gap-2">
                        {paymentMethod === 'card' ? <CreditCard className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
                        <span>{paymentMethod === 'card' ? 'Credit / Debit Card (Test)' : 'Cash on Delivery'}</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3 mb-5">
                      <h3 className="font-medium text-sm text-gray-700">Items ({items.length})</h3>
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.image_url || `https://picsum.photos/seed/${item.id}/60/60`}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="btn-secondary">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                        className="btn-primary flex-1 py-3"
                      >
                        {isSubmitting ? (
                          <><Spinner size="sm" /> Processing...</>
                        ) : (
                          <><Lock className="w-4 h-4" /> Place Order · {formatCurrency(total)}</>
                        )}
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-gray-400 text-center">
                      By placing your order, you agree to our Terms & Privacy Policy.
                      Your payment is secured with 256-bit SSL encryption.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── ORDER SUMMARY ───────────────────────────────────────────── */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="card p-5 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.image_url || `https://picsum.photos/seed/${item.id}/48/48`}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                      />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100 my-3" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : <span>{formatCurrency(shipping)}</span>}
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
