import { Router } from 'express'
import { reviewController } from '../controllers/reviewController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/:productId', reviewController.getByProduct)
router.post('/', authenticate, reviewController.create)
router.delete('/:id', authenticate, reviewController.delete)

export default router
