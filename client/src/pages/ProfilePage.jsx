import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { User, Mail, Phone, Lock, Package, Edit2, Save, X } from 'lucide-react'
import { authAPI } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { formatDate, formatCurrency, getStatusColor } from '../lib/utils'
import { PageLoader } from '../components/ui/Spinner'
import { ordersAPI } from '../lib/api'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false)
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersAPI.getMyOrders().then((r) => r.data),
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { name: user?.name || '', phone: user?.phone || '' }
  })

  const updateMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res.data.user)
      toast.success('Profile updated!')
      setEditMode(false)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  })

  const handleUpdate = (data) => updateMutation.mutate(data)

  const statusColors = {
    pending: 'badge-orange',
    processing: 'badge-blue',
    shipped: 'badge bg-purple-100 text-purple-700',
    delivered: 'badge-green',
    cancelled: 'badge-red',
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-6">
          <h1 className="section-title">My Account</h1>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── PROFILE CARD ──────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <h2 className="mt-3 font-semibold text-gray-900 text-lg">{user?.name}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
                {user?.role === 'admin' && (
                  <span className="mt-2 badge-blue text-xs inline-block">Admin</span>
                )}
              </div>

              {/* Profile form */}
              <form onSubmit={handleSubmit(handleUpdate)}>
                <div className="space-y-3">
                  <div>
                    <label className="label">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        className="input-field pl-10"
                        disabled={!editMode}
                        {...register('name', { required: 'Name is required' })}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="label">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input value={user?.email} disabled className="input-field pl-10 bg-gray-50 cursor-not-allowed" readOnly />
                    </div>
                  </div>

                  <div>
                    <label className="label">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        className="input-field pl-10"
                        disabled={!editMode}
                        placeholder="Enter phone number"
                        {...register('phone')}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {editMode ? (
                    <>
                      <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex-1">
                        <Save className="w-4 h-4" />
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" onClick={() => { setEditMode(false); reset() }} className="btn-secondary">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setEditMode(true)} className="btn-secondary w-full">
                      <Edit2 className="w-4 h-4" /> Edit Profile
                    </button>
                  )}
                </div>
              </form>

              {/* Member since */}
              <div className="mt-5 pt-5 border-t border-gray-100 text-sm text-gray-500">
                Member since {user?.created_at ? formatDate(user.created_at) : 'recently'}
              </div>
            </div>

            {/* Stats */}
            <div className="card p-5 mt-4">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Account Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Orders', value: orders.length },
                  { label: 'Completed', value: orders.filter(o => o.status === 'delivered').length },
                  { label: 'Pending', value: orders.filter(o => o.status === 'pending').length },
                  { label: 'Total Spent', value: formatCurrency(orders.reduce((s, o) => s + parseFloat(o.total || 0), 0)) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── ORDER HISTORY ─────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-600" />
                  <h2 className="font-semibold text-gray-900">Order History</h2>
                </div>
                <span className="badge-gray">{orders.length} orders</span>
              </div>

              {ordersLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link to="/catalog" className="btn-primary mt-4 inline-flex text-sm">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-semibold text-gray-900">
                              #{order.id?.slice?.(0, 8) || order.id}
                            </span>
                            <span className={statusColors[order.status] || 'badge-gray'}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(order.created_at)} · {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                          </p>

                          {/* Order items preview */}
                          {order.items && order.items.length > 0 && (
                            <div className="mt-2 flex gap-1">
                              {order.items.slice(0, 3).map((item, i) => (
                                <img
                                  key={i}
                                  src={item.image_url || `https://picsum.photos/seed/${item.product_id}/40/40`}
                                  alt={item.name}
                                  className="w-8 h-8 object-cover rounded-lg border border-gray-100"
                                />
                              ))}
                              {order.items.length > 3 && (
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-500">
                                  +{order.items.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                          <Link
                            to={`/orders/${order.id}`}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1 block"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
