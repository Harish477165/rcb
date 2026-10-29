import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

import { testConnection } from './config/db.js'
import { initMemoryStore } from './db/repository.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

// Routes
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import checkoutRoutes from './routes/checkoutRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security & Parsing Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting for API stability
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', apiLimiter)

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'ShopForge API Server',
  })
})

// Mount API Endpoints
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/checkout', checkoutRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/reviews', reviewRoutes)

// Error Handling Middlewares
app.use(notFoundHandler)
app.use(errorHandler)

// Server initialization
const startServer = async () => {
  try {
    // Attempt database connection
    const postgresActive = await testConnection()
    if (!postgresActive) {
      await initMemoryStore()
      console.log('⚡ Memory store primed with realistic demo catalog, users, and orders.')
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 ShopForge Backend API running on http://localhost:${PORT}`)
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`)
      console.log(`🛍️ Client Origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`)
    })
  } catch (err) {
    console.error('Fatal startup error:', err)
    process.exit(1)
  }
}

startServer()

export default app
