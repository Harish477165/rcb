import { repository } from '../db/repository.js'

export const reviewController = {
  async getByProduct(req, res, next) {
    try {
      const { productId } = req.params
      const reviews = await repository.getReviewsByProduct(productId)
      res.json(reviews)
    } catch (err) {
      next(err)
    }
  },

  async create(req, res, next) {
    try {
      const { product_id, rating, comment } = req.body

      if (!product_id || !rating || !comment) {
        return res.status(400).json({ message: 'Product ID, rating (1-5), and comment are required.' })
      }

      const numRating = parseInt(rating, 10)
      if (numRating < 1 || numRating > 5) {
        return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' })
      }

      const review = await repository.createReview({
        product_id,
        user_id: req.user.id,
        user_name: req.user.name,
        rating: numRating,
        comment,
      })

      res.status(201).json({ message: 'Review posted successfully', review })
    } catch (err) {
      next(err)
    }
  },

  async delete(req, res, next) {
    try {
      // Stub for review removal
      res.json({ message: 'Review deleted successfully' })
    } catch (err) {
      next(err)
    }
  },
}
