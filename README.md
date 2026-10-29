# ⚡ ShopForge — Modern Full-Stack E-Commerce Platform

A production-grade, full-stack e-commerce application crafted with **React, Vite, Tailwind CSS, Node.js, Express, and PostgreSQL**. Designed with modern aesthetics, responsive layouts, micro-animations, comprehensive catalog search/filtering, shopping cart persistence, secure customer authentication, test payment processing, order tracking, and a full-featured admin management dashboard.

---

## 🚀 Key Features

### 🛍️ Customer Storefront
- **Home Page**: Hero banner with gradient typography, featured products carousel/grid, curated departments, special promotional offers, and trust badges.
- **Product Catalog**:
  - Live full-text search with debounced auto-complete dropdown.
  - Multi-faceted category filtering, price range sliders, and in-stock toggles.
  - Sort options (Price: Low to High / High to Low, Highest Rated, Most Popular, Newest).
  - Dynamic pagination and responsive grid views.
- **Product Details**:
  - High-resolution image galleries.
  - Live stock indicators & quantity selectors.
  - Real star ratings and customer review breakdown with submission form.
  - Related product recommendations.
- **Persistent Shopping Cart**:
  - State managed via Zustand with LocalStorage persistence.
  - Real-time quantity adjustments, stock cap enforcement, and single-click removal.
  - Dynamic order subtotal, tax estimation, and free shipping progress tracker.
- **Checkout & Test Payments**:
  - Multi-step checkout with delivery address and shipping options.
  - Secure test card payment gateway simulation (mock Stripe flow).
  - Cash on Delivery (COD) alternative option.
  - Automatic inventory stock decrementing upon order placement.
- **Order Tracking & History**:
  - Visual order timeline (`pending` ➔ `processing` ➔ `shipped` ➔ `delivered`).
  - Itemized receipt, shipping address card, and print invoice button.
- **User Authentication & Profile**:
  - JWT-based authentication with bcrypt password encryption.
  - Password strength validation and toggleable password visibility.
  - Customer profile editor with phone and default shipping address.
  - Order history overview.

### 🛡️ Admin Management Portal (`/admin`)
- **Executive Dashboard**: Total gross revenue, order count, registered customer count, live product inventory count, and recent orders overview.
- **Product Inventory Management**:
  - Create, view, edit, and delete products (CRUD).
  - Manage stock count, categories, pricing, compare-at discounts, tags, and images.
- **Order Management**:
  - Filter orders by status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`).
  - Search orders by customer name, email, or order ID.
  - Real-time order status workflow update modal.
- **Customer Management**:
  - Search and filter all registered users.
  - One-click role promotion/demotion between `customer` and `admin`.
- **Category Management**:
  - Create, edit, and delete store categories with custom slugs, cover images, and descriptions.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18, Vite
  - Tailwind CSS 3
  - Lucide React (Icons)
  - TanStack React Query (Server State Caching & Mutations)
  - React Router DOM v6
  - React Hook Form
  - Zustand (Client Cart & Auth State with Persistence)
  - React Hot Toast & Framer Motion
- **Backend**:
  - Node.js & Express
  - PostgreSQL (via `pg` Pool)
  - JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
  - `express-validator` (Server-side input validation)
  - `helmet` & `cors` (Security headers and CORS handling)
  - `express-rate-limit` (API rate limiting)
  - Hybrid Database Adapter: connects directly to PostgreSQL, with zero-downtime high-fidelity memory fallback primed with seed data.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@shopforge.com` | `admin123` |
| **Customer** | `customer@shopforge.com` | `customer123` |

---

## 🏃 Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher
- **npm** or **yarn**
- **PostgreSQL** (Optional — the server connects to PostgreSQL if available or seamlessly runs with pre-seeded demo catalog)

### 2. Backend Setup
```bash
cd server
npm install

# (Optional) If you have PostgreSQL running:
# 1. Update server/.env with your credentials
# 2. Run schema migration & seed:
npm run db:migrate
npm run db:seed

# Start backend server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register customer account | Public |
| `POST` | `/api/auth/login` | Login and receive JWT token | Public |
| `GET` | `/api/auth/profile` | Get current user profile | Authenticated |
| `PUT` | `/api/auth/profile` | Update user details / address | Authenticated |
| `GET` | `/api/products` | Get products (search, filter, sort, paginate) | Public |
| `GET` | `/api/products/featured` | Get featured highlight products | Public |
| `GET` | `/api/products/:id` | Get single product by ID or slug | Public |
| `POST` | `/api/products` | Create product | Admin |
| `PUT` | `/api/products/:id` | Update product | Admin |
| `DELETE`| `/api/products/:id` | Delete product | Admin |
| `GET` | `/api/categories` | Get all product categories | Public |
| `POST` | `/api/categories` | Create category | Admin |
| `POST` | `/api/orders` | Place order & verify stock | Authenticated |
| `GET` | `/api/orders/my` | Get current customer's orders | Authenticated |
| `GET` | `/api/orders/:id` | Get order details | Authenticated |
| `GET` | `/api/orders` | Get all orders | Admin |
| `PUT` | `/api/orders/:id/status` | Update order status | Admin |
| `GET` | `/api/admin/dashboard` | Get revenue, order & inventory metrics | Admin |
| `GET` | `/api/admin/users` | List platform users | Admin |
| `PUT` | `/api/admin/users/:id/role` | Update user role (`customer` / `admin`) | Admin |
| `POST` | `/api/checkout/payment-intent` | Initialize test payment gateway | Authenticated |
| `POST` | `/api/reviews` | Post review for a product | Authenticated |
