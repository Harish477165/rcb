import { Router } from 'express'
import { adminController } from '../controllers/adminController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// All routes in admin require both authentication and admin role
router.use(authenticate, requireAdmin)

router.get('/dashboard', adminController.getDashboard)
router.get('/users', adminController.getUsers)
router.put('/users/:id/role', adminController.updateUserRole)
router.get('/reports/sales', adminController.getSalesReport)

export default router
