import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Tag, Plus, Edit2, Trash2, FolderPlus, Image as ImageIcon, X } from 'lucide-react'
import { categoriesAPI } from '../../lib/api'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

export default function AdminCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { name: '', slug: '', description: '', image_url: '' }
  })

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
    select: (res) => res.data?.categories || res.data || [],
  })

  const openCreateModal = () => {
    setEditingCategory(null)
    reset({ name: '', slug: '', description: '', image_url: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (cat) => {
    setEditingCategory(cat)
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
    })
    setIsModalOpen(true)
  }

  const handleNameChange = (e) => {
    const val = e.target.value
    if (!editingCategory) {
      // Auto-generate slug
      setValue('slug', val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }
  }

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingCategory) {
        return categoriesAPI.update(editingCategory.id, data)
      }
      return categoriesAPI.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(editingCategory ? 'Category updated' : 'Category created')
      setIsModalOpen(false)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Operation failed')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => categoriesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category removed')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete category')
    },
  })

  const onSubmit = (formData) => {
    saveMutation.mutate(formData)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900">Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Organize your product catalog into departments and collections</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Grid of Categories */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : categories.length === 0 ? (
        <div className="card bg-white border border-gray-100 p-12 text-center">
          <FolderPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No categories found</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Create your first category to start organizing products</p>
          <button onClick={openCreateModal} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="card bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <ImageIcon className="w-10 h-10 mb-1" />
                      <span className="text-xs">No cover image</span>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
                    {cat.slug}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.name}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                  {cat.product_count !== undefined ? `${cat.product_count} products` : 'Active category'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                        deleteMutation.mutate(cat.id)
                      }
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Category name is required' })}
              onChange={handleNameChange}
              placeholder="e.g. Mechanical Keyboards"
              className="input-field w-full text-sm"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Slug (URL Key) *
            </label>
            <input
              type="text"
              {...register('slug', { required: 'Slug is required' })}
              placeholder="e.g. mechanical-keyboards"
              className="input-field w-full text-sm"
            />
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              {...register('image_url')}
              placeholder="https://images.unsplash.com/..."
              className="input-field w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Brief description of this collection..."
              className="input-field w-full text-sm resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              {saveMutation.isPending && <Spinner size="sm" />}
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
