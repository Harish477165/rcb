import { Router } from 'express'
import { body } from 'express-validator'
import { categoryController } from '../controllers/categoryController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

// Public
router.get('/', categoryController.getAll)
router.get('/:id', categoryController.getById)

// Admin
router.post(
  '/',
  authenticate,
  requireAdmin,
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validate,
  categoryController.create
)

router.put('/:id', authenticate, requireAdmin, categoryController.update)
router.delete('/:id', authenticate, requireAdmin, categoryController.delete)

export default router
