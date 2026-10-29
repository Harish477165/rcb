import { repository } from '../db/repository.js'

export const orderController = {
  async create(req, res, next) {
    try {
      const { items, shipping_address, payment_method, payment_intent_id } = req.body

      if (!items || !items.length) {
        return res.status(400).json({ message: 'Cart items are required to place an order.' })
      }

      // Validate items and calculate subtotal
      let subtotal = 0
      for (const item of items) {
        const product = await repository.getProductById(item.id || item.product_id)
        if (!product) {
          return res.status(400).json({ message: `Product "${item.name}" is no longer available.` })
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
          })
        }
        subtotal += Number(product.price) * item.quantity
      }

      // Calculations
      const shipping_fee = subtotal >= 100 ? 0 : 10.00
      const tax = parseFloat((subtotal * 0.08).toFixed(2)) // 8% sales tax
      const total_amount = parseFloat((subtotal + tax + shipping_fee).toFixed(2))

      const order = await repository.createOrder({
        user_id: req.user.id,
        items,
        shipping_address,
        payment_method,
        payment_intent_id: payment_method === 'card' ? (payment_intent_id || 'pi_test_authorized') : null,
        subtotal,
        tax,
        shipping_fee,
        total_amount,
      })

      res.status(201).json({ message: 'Order placed successfully', order })
    } catch (err) {
      next(err)
    }
  },

  async getMyOrders(req, res, next) {
    try {
      const orders = await repository.getOrdersByUser(req.user.id)
      res.json(orders)
    } catch (err) {
      next(err)
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params
      const order = await repository.getOrderById(id)
      if (!order) {
        return res.status(404).json({ message: 'Order not found' })
      }

      // Ensure customer only views their own order, unless admin
      if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden. You do not have permission to view this order.' })
      }

      res.json(order)
    } catch (err) {
      next(err)
    }
  },

  // Admin
  async getAll(req, res, next) {
    try {
      const { status, search } = req.query
      const orders = await repository.getAllOrders({ status, search })
      res.json({ orders })
    } catch (err) {
      next(err)
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params
      const { status } = req.body

      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` })
      }

      const updated = await repository.updateOrderStatus(id, status)
      if (!updated) {
        return res.status(404).json({ message: 'Order not found' })
      }
      res.json({ message: 'Order status updated', order: updated })
    } catch (err) {
      next(err)
    }
  },
}
