import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Users, Search, Shield, User, Calendar, CheckCircle2, MoreVertical } from 'lucide-react'
import { adminAPI } from '../../lib/api'
import { formatDate } from '../../lib/utils'
import Spinner from '../../components/ui/Spinner'

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { search, role: roleFilter }],
    queryFn: () => adminAPI.getUsers({ search, role: roleFilter !== 'all' ? roleFilter : undefined }),
    select: (res) => res.data?.users || res.data || [],
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => adminAPI.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success('User role updated successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update user role')
    },
  })

  const users = data || []
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const totalUsers = users.length
  const adminCount = users.filter((u) => u.role === 'admin').length
  const customerCount = users.filter((u) => u.role === 'customer').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage platform members, assign administrator privileges, and review customer records</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-white border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Members</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalUsers}</p>
          </div>
        </div>
        <div className="card p-5 bg-white border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Administrators</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{adminCount}</p>
          </div>
        </div>
        <div className="card p-5 bg-white border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Customers</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{customerCount}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 bg-white border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 py-2 text-sm w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              roleFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setRoleFilter('customer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              roleFilter === 'customer'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              roleFilter === 'admin'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card bg-white border border-gray-100 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-16 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900">No users found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === 'admin'
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                            isAdmin
                              ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                              : 'bg-primary-100 text-primary-700'
                          }`}>
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">ID: #{u.id?.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{u.email}</td>
                      <td className="py-4 px-6">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <User className="w-3 h-3" /> Customer
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(u.created_at || u.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          disabled={roleMutation.isPending}
                          onClick={() => {
                            const newRole = isAdmin ? 'customer' : 'admin'
                            if (window.confirm(`Are you sure you want to change ${u.name}'s role to ${newRole}?`)) {
                              roleMutation.mutate({ id: u.id, role: newRole })
                            }
                          }}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                            isAdmin
                              ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                              : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                          }`}
                        >
                          {isAdmin ? 'Demote to Customer' : 'Make Administrator'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
