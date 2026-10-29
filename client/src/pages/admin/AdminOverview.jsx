import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../lib/api'
import {
  DollarSign, ShoppingBag, Users, Package,
  TrendingUp, TrendingDown, ArrowUpRight
} from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import { Link } from 'react-router-dom'

export default function AdminOverview() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then((r) => r.data),
  })

  const stats = dashboard?.stats || {}
  const recentOrders = dashboard?.recentOrders || []
  const topProducts = dashboard?.topProducts || []

  const cards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      change: '+12.5%',
      up: true,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders || 0,
      change: '+8.2%',
      up: true,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Customers',
      value: stats.totalUsers || 0,
      change: '+23.1%',
      up: true,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Products',
      value: stats.totalProducts || 0,
      change: '-2.4%',
      up: false,
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  const statusColors = {
    pending: 'badge-orange',
    processing: 'badge-blue',
    shipped: 'badge bg-purple-100 text-purple-700',
    delivered: 'badge-green',
    cancelled: 'badge-red',
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, change, up, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>
                {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {change}
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded flex-1" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <Link to={`/admin/orders`} className="font-mono text-xs text-primary-600 hover:underline">
                          #{order.id?.slice?.(0, 8) || order.id}
                        </Link>
                        <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{order.user_name || 'Guest'}</td>
                      <td className="px-5 py-3">
                        <span className={statusColors[order.status] || 'badge-gray'}>{order.status}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Top Products</h2>
            <Link to="/admin/products" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-4/5" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))
              : topProducts.length === 0
              ? <div className="p-6 text-center text-gray-400 text-sm">No products</div>
              : topProducts.slice(0, 6).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <img
                      src={p.image_url || `https://picsum.photos/seed/${p.id}/40/40`}
                      alt={p.name}
                      className="w-9 h-9 object-cover rounded-lg border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sold || 0} sold</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{formatCurrency(p.price)}</span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Product', to: '/admin/products?action=new', icon: Package, color: 'bg-blue-50 text-blue-700' },
            { label: 'Manage Orders', to: '/admin/orders', icon: ShoppingBag, color: 'bg-green-50 text-green-700' },
            { label: 'View Customers', to: '/admin/users', icon: Users, color: 'bg-purple-50 text-purple-700' },
            { label: 'Add Category', to: '/admin/categories?action=new', icon: Package, color: 'bg-orange-50 text-orange-700' },
          ].map(({ label, to, icon: Icon, color }) => (
            <Link
              key={label}
              to={to}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl ${color} hover:opacity-90 transition-opacity text-sm font-medium`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
