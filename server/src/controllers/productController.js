import { repository } from '../db/repository.js'

export const productController = {
  async getAll(req, res, next) {
    try {
      const { search, category, sort, page = 1, limit = 12, minPrice, maxPrice, inStock, featured } = req.query
      const result = await repository.getProducts({
        search,
        category,
        sort,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        minPrice,
        maxPrice,
        inStock,
        featured,
      })
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  async getFeatured(req, res, next) {
    try {
      const featured = await repository.getFeaturedProducts()
      res.json(featured)
    } catch (err) {
      next(err)
    }
  },

  async search(req, res, next) {
    try {
      const { q } = req.query
      const result = await repository.getProducts({ search: q, limit: 10 })
      res.json(result.products)
    } catch (err) {
      next(err)
    }
  },

  async getByCategory(req, res, next) {
    try {
      const { slug } = req.params
      const { sort, page = 1, limit = 12 } = req.query
      const result = await repository.getProducts({
        category: slug,
        sort,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      })
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params
      const product = await repository.getProductById(id)
      if (!product) {
        return res.status(404).json({ message: 'Product not found' })
      }
      res.json(product)
    } catch (err) {
      next(err)
    }
  },

  // Admin operations
  async create(req, res, next) {
    try {
      const { name, slug, description, price, compare_price, category_id, stock, images, featured, tags } = req.body
      const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

      const product = await repository.createProduct({
        name,
        slug: generatedSlug,
        description,
        price,
        compare_price,
        category_id,
        stock: parseInt(stock, 10) || 0,
        images: Array.isArray(images) ? images : (images ? [images] : []),
        featured: Boolean(featured),
        tags: Array.isArray(tags) ? tags : [],
      })
      res.status(201).json({ message: 'Product created successfully', product })
    } catch (err) {
      next(err)
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params
      const updated = await repository.updateProduct(id, req.body)
      if (!updated) {
        return res.status(404).json({ message: 'Product not found' })
      }
      res.json({ message: 'Product updated successfully', product: updated })
    } catch (err) {
      next(err)
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params
      await repository.deleteProduct(id)
      res.json({ message: 'Product deleted successfully' })
    } catch (err) {
      next(err)
    }
  },
}
