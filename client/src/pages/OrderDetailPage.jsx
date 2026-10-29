import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Package, Truck, MapPin, Clock, ChevronLeft, Printer } from 'lucide-react'
import { ordersAPI } from '../lib/api'
import { formatDate, formatCurrency, getStatusColor } from '../lib/utils'
import { PageLoader } from '../components/ui/Spinner'

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
]

const statusIdx = { pending: 0, processing: 1, shipped: 2, delivered: 3 }

export default function OrderDetailPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const isSuccess = params.get('success') === 'true'

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersAPI.getById(id).then((r) => r.data),
    enabled: !!id,
  })

  if (isLoading) return <PageLoader />
  if (error || !order) {
    return (
      <div className="page-container py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
        <Link to="/orders" className="btn-primary mt-4 inline-flex">Back to Orders</Link>
      </div>
    )
  }

  const currentStep = statusIdx[order.status] ?? 0
  const statusColor = {
    pending: 'badge-orange',
    processing: 'badge-blue',
    shipped: 'badge bg-purple-100 text-purple-700',
    delivered: 'badge-green',
    cancelled: 'badge-red',
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-5">
          <Link to="/orders" className="btn-ghost text-sm mb-3 inline-flex">
            <ChevronLeft className="w-4 h-4" /> My Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="section-title">Order #{order.id?.slice?.(0, 8) || order.id}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Placed on {formatDate(order.created_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={statusColor[order.status] || 'badge-gray'}>
                {order.status}
              </span>
              <button className="btn-ghost text-sm">
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Success banner */}
        {isSuccess && (
          <div className="flex items-center gap-3 p-5 bg-green-50 border border-green-200 rounded-2xl mb-6 animate-fade-in">
            <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-green-800 text-lg">Order Placed Successfully!</p>
              <p className="text-green-600 text-sm">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
            </div>
          </div>
        )}

        {/* Status tracker */}
        {order.status !== 'cancelled' && (
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-6">Order Status</h2>
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 z-0" />
              <div
                className="absolute left-0 top-4 h-0.5 bg-primary-600 z-0 transition-all duration-700"
                style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
              />

              {STATUS_STEPS.map((s, i) => {
                const Icon = s.icon
                const done = i <= currentStep
                return (
                  <div key={s.key} className="relative flex flex-col items-center gap-2 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`}>
                      <Icon className={`w-4 h-4 ${done ? 'text-white' : 'text-gray-300'}`} />
                    </div>
                    <span className={`text-xs font-medium text-center max-w-[70px] ${done ? 'text-primary-700' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ─── ORDER ITEMS ────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">
                  Items ({order.items?.length || 0})
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <img
                      src={item.image_url || `https://picsum.photos/seed/${item.product_id}/80/80`}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-400">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            {order.shipping_address && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Shipping Address</h3>
                </div>
                <div className="text-sm text-gray-600 space-y-0.5">
                  <p className="font-medium text-gray-900">{order.shipping_address.name}</p>
                  <p>{order.shipping_address.address}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                  <p>{order.shipping_address.country}</p>
                  <p className="mt-1">{order.shipping_address.email} · {order.shipping_address.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* ─── ORDER SUMMARY ──────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {order.shipping_cost === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span>{formatCurrency(order.shipping_cost)}</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <hr className="border-gray-100 my-2" />
                <div className="flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
                Payment: <span className="font-medium text-gray-700 capitalize">{order.payment_method || 'Card'}</span>
              </div>
            </div>

            {order.status === 'delivered' && (
              <Link to={`/products/${order.items?.[0]?.product_id}`} className="btn-secondary w-full text-sm">
                Leave a Review
              </Link>
            )}

            {order.status === 'pending' && (
              <button className="btn-danger w-full text-sm">
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
