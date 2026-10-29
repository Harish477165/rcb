import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Plus, Edit2, Trash2, Search, X, Package, AlertCircle } from 'lucide-react'
import { productsAPI, categoriesAPI } from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/utils'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'

export default function AdminProducts() {
  const [searchParams] = useSearchParams()
  const [showModal, setShowModal] = useState(searchParams.get('action') === 'new')
  const [editProduct, setEditProduct] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => productsAPI.getAll({ search, page, limit: 15, admin: true }).then((r) => r.data),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then((r) => r.data),
  })

  const products = data?.products || data || []
  const total = data?.total || 0

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const createMutation = useMutation({
    mutationFn: (data) => productsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products'])
      toast.success('Product created!')
      setShowModal(false)
      reset()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products'])
      toast.success('Product updated!')
      setEditProduct(null)
      setShowModal(false)
      reset()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update')
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => productsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products'])
      toast.success('Product deleted')
      setDeleteConfirm(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete')
  })

  const openEdit = (product) => {
    setEditProduct(product)
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      original_price: product.original_price,
      stock: product.stock,
      category_id: product.category_id,
      brand: product.brand,
      sku: product.sku,
      is_featured: product.is_featured,
      image_url: product.image_url,
    })
    setShowModal(true)
  }

  const openCreate = () => {
    setEditProduct(null)
    reset({})
    setShowModal(true)
  }

  const onSubmit = (data) => {
    const payload = {
      ...data,
      price: parseFloat(data.price),
      original_price: data.original_price ? parseFloat(data.original_price) : null,
      stock: parseInt(data.stock),
      is_featured: data.is_featured === 'true' || data.is_featured === true,
    }
    if (editProduct) {
      updateMutation.mutate({ id: editProduct.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">{total} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search products..."
          className="input-field pl-10"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Package className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400">No products found</p>
                  </td>
                </tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image_url || `https://picsum.photos/seed/${product.id}/48/48`}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-xs">{product.name}</p>
                        {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{product.category_name || '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-semibold">{formatCurrency(product.price)}</span>
                    {product.original_price && product.original_price > product.price && (
                      <p className="text-xs text-gray-400 line-through">{formatCurrency(product.original_price)}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`font-semibold ${product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {product.is_featured ? (
                      <span className="badge-blue">Yes</span>
                    ) : (
                      <span className="badge-gray">No</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditProduct(null); reset() }}
        title={editProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Input
            label="Product Name *"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($) *"
              type="number"
              step="0.01"
              min="0"
              error={errors.price?.message}
              {...register('price', { required: 'Price is required', min: 0 })}
            />
            <Input
              label="Original Price ($)"
              type="number"
              step="0.01"
              min="0"
              placeholder="Optional"
              {...register('original_price')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock *"
              type="number"
              min="0"
              error={errors.stock?.message}
              {...register('stock', { required: 'Stock is required', min: 0 })}
            />
            <div>
              <label className="label">Category</label>
              <select className="input-field" {...register('category_id')}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Brand" placeholder="e.g. Apple, Samsung" {...register('brand')} />
            <Input label="SKU" placeholder="e.g. APP-MBP-001" {...register('sku')} />
          </div>

          <Input
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            {...register('image_url')}
          />

          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Product description..."
              {...register('description')}
            />
          </div>

          <div>
            <label className="label">Featured Product</label>
            <select className="input-field" {...register('is_featured')}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowModal(false); setEditProduct(null); reset() }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary flex-1"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <><Spinner size="sm" /> Saving...</>
              ) : (
                editProduct ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Product"
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Are you sure?</p>
              <p className="text-sm text-gray-500">This will permanently delete "{deleteConfirm?.name}"</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={() => deleteMutation.mutate(deleteConfirm.id)}
              disabled={deleteMutation.isPending}
              className="btn-danger flex-1"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
