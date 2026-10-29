import { Router } from 'express'
import { body } from 'express-validator'
import { productController } from '../controllers/productController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

// Public
router.get('/', productController.getAll)
router.get('/featured', productController.getFeatured)
router.get('/search', productController.search)
router.get('/category/:slug', productController.getByCategory)
router.get('/:id', productController.getById)

// Admin
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid product price is required'),
    body('description').notEmpty().withMessage('Description is required'),
  ],
  validate,
  productController.create
)

router.put('/:id', authenticate, requireAdmin, productController.update)
router.delete('/:id', authenticate, requireAdmin, productController.delete)

export default router
