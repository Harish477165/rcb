import { v4 as uuidv4 } from 'uuid'
import { orderController } from './orderController.js'

export const checkoutController = {
  async createPaymentIntent(req, res, next) {
    try {
      const { amount, currency = 'usd' } = req.body

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid payment amount' })
      }

      // Test Mode Payment Gateway Simulator
      // Returns a clientSecret compatible with Stripe-like checkout flows
      const paymentIntentId = `pi_test_${uuidv4().replace(/-/g, '').slice(0, 24)}`
      const clientSecret = `${paymentIntentId}_secret_${uuidv4().replace(/-/g, '').slice(0, 16)}`

      res.json({
        paymentIntentId,
        clientSecret,
        amount,
        currency,
        status: 'requires_payment_method',
      })
    } catch (err) {
      next(err)
    }
  },

  async processOrder(req, res, next) {
    return orderController.create(req, res, next)
  },
}
