import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { ShoppingBag, Search, Eye } from 'lucide-react'
import { ordersAPI } from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/utils'
import Modal from '../../components/ui/Modal'

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', search, statusFilter],
    queryFn: () => ordersAPI.getAll({ search, status: statusFilter }).then((r) => r.data),
  })

  const orders = data?.orders || data || []

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => ordersAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders'])
      toast.success('Order status updated!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
  })

  const statusColors = {
    pending: 'badge-orange',
    processing: 'badge-blue',
    shipped: 'badge bg-purple-100 text-purple-700',
    delivered: 'badge-green',
    cancelled: 'badge-red',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500">{orders.length} orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-40"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {['all', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s === 'all' ? '' : s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
              (s === 'all' && !statusFilter) || statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400">No orders found</p>
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-primary-600">
                    #{order.id?.slice?.(0, 8) || order.id}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{order.user_name || 'Guest'}</p>
                    <p className="text-xs text-gray-400">{order.user_email}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-xs">{formatDate(order.created_at)}</td>
                  <td className="px-5 py-3 text-right font-semibold">{formatCurrency(order.total)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={statusColors[order.status] || 'badge-gray'}>{order.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {/* Status update */}
                      <select
                        value={order.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                        disabled={order.status === 'delivered' || order.status === 'cancelled'}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.id?.slice?.(0, 8) || selectedOrder?.id}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-semibold">{selectedOrder.user_name}</p>
                <p className="text-gray-400">{selectedOrder.user_email}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-semibold">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment</p>
                <p className="font-semibold capitalize">{selectedOrder.payment_method || 'Card'}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <span className={statusColors[selectedOrder.status] || 'badge-gray'}>{selectedOrder.status}</span>
              </div>
            </div>

            {selectedOrder.shipping_address && (
              <div className="bg-gray-50 rounded-xl p-4 text-sm">
                <p className="font-medium text-gray-700 mb-1">Shipping Address</p>
                <p>{selectedOrder.shipping_address.address}</p>
                <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="font-medium text-sm text-gray-700">Items</p>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.name} × {item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span><span>{selectedOrder.shipping_cost === 0 ? 'FREE' : formatCurrency(selectedOrder.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Total</span><span>{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
