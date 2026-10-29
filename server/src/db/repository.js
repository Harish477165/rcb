import { pool, isConnectedToPostgres } from '../config/db.js'
import { getSeedData } from './seedData.js'
import { v4 as uuidv4 } from 'uuid'

// In-memory state fallback
let memoryState = {
  users: [],
  categories: [],
  products: [],
  orders: [],
  order_items: [],
  reviews: [],
  initialized: false,
}

export const initMemoryStore = async () => {
  if (memoryState.initialized) return
  const data = await getSeedData()
  memoryState = { ...data, initialized: true }
}

export const repository = {
  // ─── Users ───────────────────────────────────────────────────────────────
  async findUserByEmail(email) {
    if (isConnectedToPostgres) {
      const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email])
      return res.rows[0]
    }
    await initMemoryStore()
    return memoryState.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  },

  async findUserById(id) {
    if (isConnectedToPostgres) {
      const res = await pool.query('SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = $1', [id])
      return res.rows[0]
    }
    await initMemoryStore()
    const user = memoryState.users.find((u) => u.id === id)
    if (!user) return null
    const { password, ...safeUser } = user
    return safeUser
  },

  async createUser({ name, email, password, role = 'customer', phone, address = {} }) {
    const id = uuidv4()
    const created_at = new Date().toISOString()
    if (isConnectedToPostgres) {
      const res = await pool.query(
        `INSERT INTO users (id, name, email, password, role, phone, address, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, role, phone, address, created_at`,
        [id, name, email, password, role, phone, JSON.stringify(address), created_at]
      )
      return res.rows[0]
    }
    await initMemoryStore()
    const newUser = { id, name, email, password, role, phone, address, created_at }
    memoryState.users.push(newUser)
    const { password: _, ...safeUser } = newUser
    return safeUser
  },

  async updateUser(id, updates) {
    if (isConnectedToPostgres) {
      const fields = []
      const values = []
      let idx = 1
      for (const [key, val] of Object.entries(updates)) {
        fields.push(`${key} = $${idx}`)
        values.push(key === 'address' ? JSON.stringify(val) : val)
        idx++
      }
      values.push(id)
      const res = await pool.query(
        `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, name, email, role, phone, address, created_at`,
        values
      )
      return res.rows[0]
    }
    await initMemoryStore()
    const userIdx = memoryState.users.findIndex((u) => u.id === id)
    if (userIdx === -1) return null
    memoryState.users[userIdx] = { ...memoryState.users[userIdx], ...updates }
    const { password: _, ...safeUser } = memoryState.users[userIdx]
    return safeUser
  },

  async getAllUsers({ search, role } = {}) {
    if (isConnectedToPostgres) {
      let query = 'SELECT id, name, email, role, phone, address, created_at FROM users WHERE 1=1'
      const params = []
      if (search) {
        params.push(`%${search}%`)
        query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`
      }
      if (role) {
        params.push(role)
        query += ` AND role = $${params.length}`
      }
      query += ' ORDER BY created_at DESC'
      const res = await pool.query(query, params)
      return res.rows
    }
    await initMemoryStore()
    let list = memoryState.users.map(({ password, ...u }) => u)
    if (search) {
      const s = search.toLowerCase()
      list = list.filter((u) => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s))
    }
    if (role) {
      list = list.filter((u) => u.role === role)
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  // ─── Categories ──────────────────────────────────────────────────────────
  async getCategories() {
    if (isConnectedToPostgres) {
      const res = await pool.query(`
        SELECT c.*, COUNT(p.id)::int as product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY c.name ASC
      `)
      return res.rows
    }
    await initMemoryStore()
    return memoryState.categories.map((c) => ({
      ...c,
      product_count: memoryState.products.filter((p) => p.category_id === c.id).length,
    }))
  },

  async getCategoryBySlug(slug) {
    if (isConnectedToPostgres) {
      const res = await pool.query('SELECT * FROM categories WHERE slug = $1', [slug])
      return res.rows[0]
    }
    await initMemoryStore()
    return memoryState.categories.find((c) => c.slug === slug)
  },

  async createCategory({ name, slug, description, image_url }) {
    const id = uuidv4()
    if (isConnectedToPostgres) {
      const res = await pool.query(
        'INSERT INTO categories (id, name, slug, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [id, name, slug, description, image_url]
      )
      return res.rows[0]
    }
    await initMemoryStore()
    const cat = { id, name, slug, description, image_url }
    memoryState.categories.push(cat)
    return cat
  },

  async updateCategory(id, { name, slug, description, image_url }) {
    if (isConnectedToPostgres) {
      const res = await pool.query(
        'UPDATE categories SET name = $1, slug = $2, description = $3, image_url = $4 WHERE id = $5 RETURNING *',
        [name, slug, description, image_url, id]
      )
      return res.rows[0]
    }
    await initMemoryStore()
    const idx = memoryState.categories.findIndex((c) => c.id === id)
    if (idx === -1) return null
    memoryState.categories[idx] = { ...memoryState.categories[idx], name, slug, description, image_url }
    return memoryState.categories[idx]
  },

  async deleteCategory(id) {
    if (isConnectedToPostgres) {
      await pool.query('DELETE FROM categories WHERE id = $1', [id])
      return true
    }
    await initMemoryStore()
    memoryState.categories = memoryState.categories.filter((c) => c.id !== id)
    return true
  },

  // ─── Products ────────────────────────────────────────────────────────────
  async getProducts({ search, category, sort = 'newest', page = 1, limit = 12, minPrice, maxPrice, inStock, featured } = {}) {
    if (isConnectedToPostgres) {
      let base = 'FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1'
      const params = []

      if (search) {
        params.push(`%${search}%`)
        base += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`
      }
      if (category) {
        params.push(category)
        base += ` AND (c.slug = $${params.length} OR p.category_id = $${params.length})`
      }
      if (minPrice !== undefined && minPrice !== '') {
        params.push(Number(minPrice))
        base += ` AND p.price >= $${params.length}`
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        params.push(Number(maxPrice))
        base += ` AND p.price <= $${params.length}`
      }
      if (inStock === 'true' || inStock === true) {
        base += ' AND p.stock > 0'
      }
      if (featured === 'true' || featured === true) {
        base += ' AND p.featured = true'
      }

      // Count total
      const countRes = await pool.query(`SELECT COUNT(*)::int as total ${base}`, params)
      const total = countRes.rows[0].total

      // Sort
      let orderClause = 'ORDER BY p.created_at DESC'
      if (sort === 'price-asc') orderClause = 'ORDER BY p.price ASC'
      else if (sort === 'price-desc') orderClause = 'ORDER BY p.price DESC'
      else if (sort === 'rating') orderClause = 'ORDER BY p.rating DESC'
      else if (sort === 'popular') orderClause = 'ORDER BY p.review_count DESC'

      const offset = (page - 1) * limit
      params.push(limit, offset)
      const dataRes = await pool.query(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         ${base} ${orderClause} LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      )

      return {
        products: dataRes.rows,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
      }
    }

    // In-memory fallback
    await initMemoryStore()
    let list = memoryState.products.map((p) => {
      const cat = memoryState.categories.find((c) => c.id === p.category_id)
      return { ...p, category_name: cat?.name || '', category_slug: cat?.slug || '' }
    })

    if (search) {
      const s = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s))
    }
    if (category) {
      list = list.filter((p) => p.category_slug === category || p.category_id === category)
    }
    if (minPrice !== undefined && minPrice !== '') {
      list = list.filter((p) => p.price >= Number(minPrice))
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      list = list.filter((p) => p.price <= Number(maxPrice))
    }
    if (inStock === 'true' || inStock === true) {
      list = list.filter((p) => p.stock > 0)
    }
    if (featured === 'true' || featured === true) {
      list = list.filter((p) => p.featured)
    }

    // Sort
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    else if (sort === 'popular') list.sort((a, b) => b.review_count - a.review_count)
    else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const total = list.length
    const offset = (page - 1) * limit
    const paginated = list.slice(offset, offset + limit)

    return {
      products: paginated,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    }
  },

  async getProductById(idOrSlug) {
    if (isConnectedToPostgres) {
      const res = await pool.query(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id::text = $1 OR p.slug = $1`,
        [idOrSlug]
      )
      return res.rows[0]
    }
    await initMemoryStore()
    const p = memoryState.products.find((prod) => prod.id === idOrSlug || prod.slug === idOrSlug)
    if (!p) return null
    const cat = memoryState.categories.find((c) => c.id === p.category_id)
    return { ...p, category_name: cat?.name || '', category_slug: cat?.slug || '' }
  },

  async getFeaturedProducts() {
    if (isConnectedToPostgres) {
      const res = await pool.query(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.featured = true
         ORDER BY p.rating DESC LIMIT 8`
      )
      return res.rows
    }
    await initMemoryStore()
    return memoryState.products
      .filter((p) => p.featured)
      .slice(0, 8)
      .map((p) => {
        const cat = memoryState.categories.find((c) => c.id === p.category_id)
        return { ...p, category_name: cat?.name || '', category_slug: cat?.slug || '' }
      })
  },

  async createProduct(data) {
    const id = uuidv4()
    const created_at = new Date().toISOString()
    const { name, slug, description, price, compare_price, category_id, stock, images = [], featured = false, tags = [] } = data
    if (isConnectedToPostgres) {
      const res = await pool.query(
        `INSERT INTO products (id, name, slug, description, price, compare_price, category_id, stock, images, featured, tags, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [id, name, slug, description, price, compare_price || null, category_id || null, stock, images, featured, tags, created_at]
      )
      return res.rows[0]
    }
    await initMemoryStore()
    const newProd = { id, name, slug, description, price: Number(price), compare_price: compare_price ? Number(compare_price) : null, category_id, stock: Number(stock), images, rating: 5.0, review_count: 0, featured, tags, created_at }
    memoryState.products.unshift(newProd)
    return newProd
  },

  async updateProduct(id, data) {
    if (isConnectedToPostgres) {
      const fields = []
      const values = []
      let idx = 1
      for (const [key, val] of Object.entries(data)) {
        fields.push(`${key} = $${idx}`)
        values.push(val)
        idx++
      }
      values.push(id)
      const res = await pool.query(`UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`, values)
      return res.rows[0]
    }
    await initMemoryStore()
    const idx = memoryState.products.findIndex((p) => p.id === id)
    if (idx === -1) return null
    memoryState.products[idx] = { ...memoryState.products[idx], ...data }
    return memoryState.products[idx]
  },

  async deleteProduct(id) {
    if (isConnectedToPostgres) {
      await pool.query('DELETE FROM products WHERE id = $1', [id])
      return true
    }
    await initMemoryStore()
    memoryState.products = memoryState.products.filter((p) => p.id !== id)
    return true
  },

  // ─── Orders ──────────────────────────────────────────────────────────────
  async createOrder({ user_id, items, shipping_address, payment_method, payment_intent_id, subtotal, tax, shipping_fee, total_amount }) {
    const orderId = uuidv4()
    const created_at = new Date().toISOString()
    const payment_status = payment_method === 'card' ? 'paid' : 'pending'

    if (isConnectedToPostgres) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        await client.query(
          `INSERT INTO orders (id, user_id, status, subtotal, tax, shipping_fee, total_amount, payment_method, payment_status, shipping_address, payment_intent_id, created_at)
           VALUES ($1, $2, 'processing', $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [orderId, user_id, subtotal, tax, shipping_fee, total_amount, payment_method, payment_status, JSON.stringify(shipping_address), payment_intent_id, created_at]
        )

        for (const item of items) {
          await client.query(
            `INSERT INTO order_items (id, order_id, product_id, name, price, quantity, image_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [uuidv4(), orderId, item.id || item.product_id, item.name, item.price, item.quantity, item.images?.[0] || item.image_url || '']
          )
          // Decrement stock
          await client.query('UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2', [item.quantity, item.id || item.product_id])
        }
        await client.query('COMMIT')
        return this.getOrderById(orderId)
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      } finally {
        client.release()
      }
    }

    await initMemoryStore()
    const newOrder = {
      id: orderId,
      user_id,
      status: 'processing',
      subtotal,
      tax,
      shipping_fee,
      total_amount,
      payment_method,
      payment_status,
      shipping_address,
      payment_intent_id,
      created_at,
    }
    memoryState.orders.unshift(newOrder)

    for (const item of items) {
      const itemId = uuidv4()
      memoryState.order_items.push({
        id: itemId,
        order_id: orderId,
        product_id: item.id || item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.images?.[0] || item.image_url || '',
      })
      // Decrement stock
      const prod = memoryState.products.find((p) => p.id === (item.id || item.product_id))
      if (prod) prod.stock = Math.max(0, prod.stock - item.quantity)
    }

    return this.getOrderById(orderId)
  },

  async getOrderById(id) {
    if (isConnectedToPostgres) {
      const orderRes = await pool.query(
        `SELECT o.*, u.name as customer_name, u.email as customer_email
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         WHERE o.id = $1`,
        [id]
      )
      const order = orderRes.rows[0]
      if (!order) return null
      const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id])
      order.items = itemsRes.rows
      return order
    }

    await initMemoryStore()
    const order = memoryState.orders.find((o) => o.id === id)
    if (!order) return null
    const user = memoryState.users.find((u) => u.id === order.user_id)
    const items = memoryState.order_items.filter((oi) => oi.order_id === id)
    return {
      ...order,
      customer_name: user?.name || 'Customer',
      customer_email: user?.email || '',
      items,
    }
  },

  async getOrdersByUser(user_id) {
    if (isConnectedToPostgres) {
      const res = await pool.query(
        `SELECT o.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id, 'name', oi.name, 'price', oi.price, 'quantity', oi.quantity, 'image_url', oi.image_url
              )
            ) FILTER (WHERE oi.id IS NOT NULL), '[]'
          ) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.user_id = $1
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
        [user_id]
      )
      return res.rows
    }

    await initMemoryStore()
    const userOrders = memoryState.orders.filter((o) => o.user_id === user_id)
    return userOrders
      .map((o) => ({
        ...o,
        items: memoryState.order_items.filter((oi) => oi.order_id === o.id),
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  async getAllOrders({ status, search } = {}) {
    if (isConnectedToPostgres) {
      let query = `
        SELECT o.*, u.name as customer_name, u.email as customer_email,
        COUNT(oi.id)::int as total_items
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE 1=1
      `
      const params = []
      if (status && status !== 'all') {
        params.push(status)
        query += ` AND o.status = $${params.length}`
      }
      if (search) {
        params.push(`%${search}%`)
        query += ` AND (o.id::text ILIKE $${params.length} OR u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`
      }
      query += ' GROUP BY o.id, u.name, u.email ORDER BY o.created_at DESC'
      const res = await pool.query(query, params)
      return res.rows
    }

    await initMemoryStore()
    let list = memoryState.orders.map((o) => {
      const user = memoryState.users.find((u) => u.id === o.user_id)
      const items = memoryState.order_items.filter((oi) => oi.order_id === o.id)
      return {
        ...o,
        customer_name: user?.name || 'Customer',
        customer_email: user?.email || '',
        total_items: items.length,
        items,
      }
    })

    if (status && status !== 'all') {
      list = list.filter((o) => o.status === status)
    }
    if (search) {
      const s = search.toLowerCase()
      list = list.filter((o) => o.id.toLowerCase().includes(s) || o.customer_name.toLowerCase().includes(s) || o.customer_email.toLowerCase().includes(s))
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  async updateOrderStatus(id, status) {
    if (isConnectedToPostgres) {
      const res = await pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, id])
      return res.rows[0]
    }
    await initMemoryStore()
    const order = memoryState.orders.find((o) => o.id === id)
    if (!order) return null
    order.status = status
    order.updated_at = new Date().toISOString()
    return order
  },

  // ─── Reviews ─────────────────────────────────────────────────────────────
  async getReviewsByProduct(productId) {
    if (isConnectedToPostgres) {
      const res = await pool.query('SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC', [productId])
      return res.rows
    }
    await initMemoryStore()
    return memoryState.reviews.filter((r) => r.product_id === productId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  async createReview({ product_id, user_id, user_name, rating, comment }) {
    const id = uuidv4()
    const created_at = new Date().toISOString()
    if (isConnectedToPostgres) {
      const res = await pool.query(
        'INSERT INTO reviews (id, product_id, user_id, user_name, rating, comment, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [id, product_id, user_id, user_name, rating, comment, created_at]
      )
      // Recalculate rating
      await pool.query(
        `UPDATE products SET 
          rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE product_id = $1),
          review_count = (SELECT COUNT(*)::int FROM reviews WHERE product_id = $1)
         WHERE id = $1`,
        [product_id]
      )
      return res.rows[0]
    }

    await initMemoryStore()
    const newRev = { id, product_id, user_id, user_name, rating: Number(rating), comment, created_at }
    memoryState.reviews.unshift(newRev)

    // Recalculate
    const revs = memoryState.reviews.filter((r) => r.product_id === product_id)
    const avg = revs.reduce((sum, r) => sum + r.rating, 0) / revs.length
    const prod = memoryState.products.find((p) => p.id === product_id)
    if (prod) {
      prod.rating = parseFloat(avg.toFixed(2))
      prod.review_count = revs.length
    }
    return newRev
  },

  // ─── Admin Metrics ───────────────────────────────────────────────────────
  async getAdminStats() {
    if (isConnectedToPostgres) {
      const salesRes = await pool.query("SELECT COALESCE(SUM(total_amount), 0)::numeric(10,2) as total_sales FROM orders WHERE payment_status = 'paid'")
      const ordersRes = await pool.query('SELECT COUNT(*)::int as total_orders FROM orders')
      const productsRes = await pool.query('SELECT COUNT(*)::int as total_products FROM products')
      const usersRes = await pool.query('SELECT COUNT(*)::int as total_users FROM users WHERE role = $1', ['customer'])
      const recentOrdersRes = await this.getAllOrders()

      return {
        totalSales: parseFloat(salesRes.rows[0].total_sales),
        totalOrders: ordersRes.rows[0].total_orders,
        totalProducts: productsRes.rows[0].total_products,
        totalCustomers: usersRes.rows[0].total_users,
        recentOrders: recentOrdersRes.slice(0, 5),
      }
    }

    await initMemoryStore()
    const totalSales = memoryState.orders
      .filter((o) => o.payment_status === 'paid')
      .reduce((sum, o) => sum + Number(o.total_amount), 0)

    const allOrders = await this.getAllOrders()

    return {
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalOrders: memoryState.orders.length,
      totalProducts: memoryState.products.length,
      totalCustomers: memoryState.users.filter((u) => u.role === 'customer').length,
      recentOrders: allOrders.slice(0, 5),
    }
  },
}
