import { repository } from '../db/repository.js'

export const adminController = {
  async getDashboard(req, res, next) {
    try {
      const stats = await repository.getAdminStats()
      res.json(stats)
    } catch (err) {
      next(err)
    }
  },

  async getUsers(req, res, next) {
    try {
      const { search, role } = req.query
      const users = await repository.getAllUsers({ search, role })
      res.json({ users })
    } catch (err) {
      next(err)
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params
      const { role } = req.body

      if (!['customer', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be either "customer" or "admin".' })
      }

      // Prevent demoting the last admin if needed
      const updated = await repository.updateUser(id, { role })
      if (!updated) {
        return res.status(404).json({ message: 'User not found' })
      }
      res.json({ message: 'User role updated successfully', user: updated })
    } catch (err) {
      next(err)
    }
  },

  async getSalesReport(req, res, next) {
    try {
      const allOrders = await repository.getAllOrders()
      const revenue = allOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
      const paidOrders = allOrders.filter((o) => o.payment_status === 'paid')

      res.json({
        totalRevenue: revenue,
        paidOrdersCount: paidOrders.length,
        totalOrdersCount: allOrders.length,
        breakdownByStatus: {
          pending: allOrders.filter((o) => o.status === 'pending').length,
          processing: allOrders.filter((o) => o.status === 'processing').length,
          shipped: allOrders.filter((o) => o.status === 'shipped').length,
          delivered: allOrders.filter((o) => o.status === 'delivered').length,
          cancelled: allOrders.filter((o) => o.status === 'cancelled').length,
        },
      })
    } catch (err) {
      next(err)
    }
  },
}
