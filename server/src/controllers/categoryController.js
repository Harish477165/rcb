import { repository } from '../db/repository.js'

export const categoryController = {
  async getAll(req, res, next) {
    try {
      const categories = await repository.getCategories()
      res.json({ categories })
    } catch (err) {
      next(err)
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params
      const category = await repository.getCategoryBySlug(id)
      if (!category) {
        return res.status(404).json({ message: 'Category not found' })
      }
      res.json(category)
    } catch (err) {
      next(err)
    }
  },

  async create(req, res, next) {
    try {
      const { name, slug, description, image_url } = req.body
      const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

      const category = await repository.createCategory({
        name,
        slug: generatedSlug,
        description,
        image_url,
      })
      res.status(201).json({ message: 'Category created successfully', category })
    } catch (err) {
      next(err)
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params
      const { name, slug, description, image_url } = req.body
      const updated = await repository.updateCategory(id, { name, slug, description, image_url })
      if (!updated) {
        return res.status(404).json({ message: 'Category not found' })
      }
      res.json({ message: 'Category updated successfully', category: updated })
    } catch (err) {
      next(err)
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params
      await repository.deleteCategory(id)
      res.json({ message: 'Category deleted successfully' })
    } catch (err) {
      next(err)
    }
  },
}
