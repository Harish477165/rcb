import { Router } from 'express'
import { body } from 'express-validator'
import { orderController } from '../controllers/orderController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

// Customer authenticated routes
router.post(
  '/',
  authenticate,
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required in the order'),
    body('shipping_address').isObject().withMessage('Valid shipping address is required'),
    body('payment_method').isIn(['card', 'cod']).withMessage('Payment method must be card or cod'),
  ],
  validate,
  orderController.create
)

router.get('/my', authenticate, orderController.getMyOrders)
router.get('/:id', authenticate, orderController.getById)

// Admin order routes
router.get('/', authenticate, requireAdmin, orderController.getAll)
router.put(
  '/:id/status',
  authenticate,
  requireAdmin,
  [body('status').notEmpty().withMessage('Status is required')],
  validate,
  orderController.updateStatus
)

export default router
