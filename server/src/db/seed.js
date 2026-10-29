import { fileURLToPath } from 'url'
import { pool } from '../config/db.js'
import { getSeedData } from './seedData.js'

export const seed = async () => {
  console.log('🌱 Seeding database...')
  const client = await pool.connect()
  try {
    const { users, categories, products, orders, order_items, reviews } = await getSeedData()

    await client.query('BEGIN')

    // Clean tables
    await client.query('TRUNCATE reviews, order_items, orders, products, categories, users CASCADE')

    // Seed users
    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, name, email, password, role, phone, address, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [u.id, u.name, u.email, u.password, u.role, u.phone, JSON.stringify(u.address), u.created_at]
      )
    }

    // Seed categories
    for (const c of categories) {
      await client.query(
        `INSERT INTO categories (id, name, slug, description, image_url)
         VALUES ($1, $2, $3, $4, $5)`,
        [c.id, c.name, c.slug, c.description, c.image_url]
      )
    }

    // Seed products
    for (const p of products) {
      await client.query(
        `INSERT INTO products (id, name, slug, description, price, compare_price, category_id, stock, images, rating, review_count, featured, tags, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          p.id, p.name, p.slug, p.description, p.price, p.compare_price,
          p.category_id, p.stock, p.images, p.rating, p.review_count,
          p.featured, p.tags, p.created_at
        ]
      )
    }

    // Seed orders
    for (const o of orders) {
      await client.query(
        `INSERT INTO orders (id, user_id, status, subtotal, tax, shipping_fee, total_amount, payment_method, payment_status, shipping_address, payment_intent_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          o.id, o.user_id, o.status, o.subtotal, o.tax, o.shipping_fee,
          o.total_amount, o.payment_method, o.payment_status,
          JSON.stringify(o.shipping_address), o.payment_intent_id, o.created_at
        ]
      )
    }

    // Seed order items
    for (const oi of order_items) {
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, name, price, quantity, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [oi.id, oi.order_id, oi.product_id, oi.name, oi.price, oi.quantity, oi.image_url]
      )
    }

    // Seed reviews
    for (const r of reviews) {
      await client.query(
        `INSERT INTO reviews (id, product_id, user_id, user_name, rating, comment, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [r.id, r.product_id, r.user_id, r.user_name, r.rating, r.comment, r.created_at]
      )
    }

    await client.query('COMMIT')
    console.log('✅ Database seeded with demo products, users, categories, and orders!')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Seeding failed:', error.message)
    throw error
  } finally {
    client.release()
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
