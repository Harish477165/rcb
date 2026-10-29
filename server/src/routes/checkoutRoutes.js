import { Router } from 'express'
import { body } from 'express-validator'
import { checkoutController } from '../controllers/checkoutController.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

router.post(
  '/payment-intent',
  authenticate,
  [body('amount').isFloat({ min: 0.5 }).withMessage('Valid payment amount required')],
  validate,
  checkoutController.createPaymentIntent
)

router.post('/process', authenticate, checkoutController.processOrder)

export default router
