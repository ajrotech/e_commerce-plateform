# ShopNest — Full-Stack E-Commerce Platform

> A modern, fully functional mini online store built with Next.js 16, TypeScript, Prisma ORM, Zustand, and shadcn/ui. This project demonstrates advanced full-stack concepts including state preservation, catalog sorting, dynamic checkout logic with inventory deduction, and privileged administrative access control.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
  - [Products](#products)
  - [Checkout](#checkout)
  - [Orders](#orders)
  - [Admin Analytics](#admin-analytics)
  - [Database Seeding](#database-seeding)
- [State Management](#state-management)
- [Key Features in Detail](#key-features-in-detail)
  - [Product Catalog](#1-product-catalog)
  - [Shopping Cart](#2-shopping-cart)
  - [Checkout Processing](#3-checkout-processing)
  - [Admin Panel](#4-admin-panel)
- [Learning Outcomes Demonstrated](#learning-outcomes-demonstrated)
- [Screenshots & Demos](#screenshots--demos)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

- **Product Catalog** — Browse 16+ products across 4 categories with search, filtering, sorting, and pagination
- **Shopping Cart** — Client-side cart persisted to localStorage via Zustand, with add/remove/quantity controls
- **Checkout System** — Validated shipping & payment form, automatic tax calculation, stock deduction on order placement
- **Admin Dashboard** — Revenue analytics, KPI cards, revenue-by-status breakdown, and recent order feed
- **Admin Product Management** — Full CRUD (Create, Read, Update, Delete) for products with dialog forms
- **Admin Order Management** — View all orders, filter by status, update order status with inline dropdown
- **Role-Based Access Control** — User model supports `user` and `admin` roles for access control
- **Responsive Design** — Mobile-first layout that works on all screen sizes
- **Toast Notifications** — Real-time feedback for all user actions (add to cart, remove, errors, success)
- **Loading Skeletons** — Smooth loading states for all data-fetching views

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework with server-side API routes |
| **Language** | TypeScript 5 | Type safety across frontend and backend |
| **Styling** | Tailwind CSS 4 | Utility-first responsive CSS |
| **UI Library** | shadcn/ui (New York) | Pre-built accessible UI components |
| **Icons** | Lucide React | Consistent icon system |
| **Database** | SQLite via Prisma ORM | Relational data persistence |
| **Client State** | Zustand (with persist middleware) | Global cart state + localStorage persistence |
| **Form Validation** | Custom validators | Client-side shipping/payment validation |
| **Toast Feedback** | Sonner | Elegant toast notifications |

---

## Project Structure

```
shopnest/
├── prisma/
│   └── schema.prisma          # Database models (Product, Order, OrderItem, User)
├── db/
│   └── custom.db             # SQLite database file (auto-generated)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── products/
│   │   │   │   ├── route.ts         # GET (list) & POST (create) products
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts     # GET, PUT, DELETE single product
│   │   │   ├── checkout/
│   │   │   │   └── route.ts         # POST — process checkout, deduct stock
│   │   │   ├── orders/
│   │   │   │   └── route.ts         # GET (list) & PUT (update status)
│   │   │   ├── admin/
│   │   │   │   └── revenue/
│   │   │   │       └── route.ts     # GET — analytics dashboard data
│   │   │   └── seed/
│   │   │       └── route.ts         # POST — seed 16 sample products
│   │   ├── layout.tsx              # Root layout with metadata & toaster
│   │   └── page.tsx                # Main SPA entry with client-side routing
│   ├── components/
│   │   ├── product-catalog.tsx      # Product grid with search/filter/sort/pagination
│   │   ├── shopping-cart.tsx       # Cart view with quantity controls & summary
│   │   ├── checkout.tsx             # Checkout form with validation & order placement
│   │   ├── order-success.tsx        # Order confirmation page
│   │   ├── admin-panel.tsx         # Admin panel with 3 tabs (Dashboard/Products/Orders)
│   │   └── ui/                     # shadcn/ui component library
│   ├── store/
│   │   ├── cart-store.ts           # Zustand cart state with localStorage persistence
│   │   └── view-store.ts           # Zustand view/navigation state
│   ├── lib/
│   │   ├── db.ts                   # Prisma client singleton
│   │   └── utils.ts                # Utility functions (cn helper)
│   └── hooks/                      # Custom React hooks
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── Caddyfile                    # Reverse proxy configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.17
- **Bun** >= 1.0 (recommended package manager)
- **Git** for version control

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd shopnest

# 2. Install dependencies
bun install

# 3. Set up the database (push schema & generate Prisma client)
bun run db:push

# 4. Start the development server
bun run dev
```

The app will be available at `http://localhost:3000`. On first load, the database is automatically seeded with 16 sample products.

### Environment Variables

The project uses a `.env` file at the root (auto-created). The only required variable is:

```env
DATABASE_URL="file:./db/custom.db"
```

This is pre-configured for SQLite. No additional database setup is needed.

### Database Setup

```bash
# Push Prisma schema to database (creates/updates tables)
bun run db:push

# Regenerate Prisma Client (auto-runs after db:push)
bun run db:generate

# Reset database (warning: deletes all data)
bun run db:reset
```

### Running the App

```bash
# Development mode with hot-reload
bun run dev

# Lint check
bun run lint
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│                  Browser (Client)                     │
│  ┌──────────────────────────────────┐       │
│  │  page.tsx (SPA Router via Zustand ViewStore)  │       │
│  │  ┌─────────────────────────┐       │       │
│  │  │  Component Views (Client-Side)  │       │       │
│  │  │  ├── ProductCatalog  │       │       │
│  │  │  ├── ShoppingCart     │       │       │
│  │  │  ├── Checkout        │       │       │
│  │  │  ├── OrderSuccess    │       │       │
│  │  │  └── AdminPanel      │       │       │
│  │  ┌─────────────────────────┐       │       │
│  │  │  Zustand Stores (Client State)  │       │       │
│  │  │  ├── cart-store (persisted) │       │       │
│  │  │  └── view-store              │       │       │
│  │  ┌─────────────────────────┐       │       │
│  │  │  API Routes (Server-Side)  │       │       │
│  │  │  ├── /api/products      │       │       │
│  │  │  ├── /api/products/[id] │       │       │
│  │  │  ├── /api/checkout      │       │       │
│  │  │  ├── /api/orders        │       │       │
│  │  │  ├── /api/admin/revenue │       │       │
│  │  │  └── /api/seed         │       │       │
│  │  ┌─────────────────────────┐       │       │
│  │  │     Prisma ORM + SQLite     │       │       │
│  │  │  ├── Product    │       │       │
│  │  │  ├── Order      │       │       │
│  │  │  ├── OrderItem  │       │       │
│  │  │  └── User       │       │       │
│  │  ┌─────────────────────────┐       │       │
│  │  │     localStorage (Cart)     │       │       │
│  │  │  └── ecommerce-cart key     │       │       │
│  │  ┌─────────────────────────┐       │       │
│  │  │  shadcn/ui + Tailwind CSS 4  │       │       │
│  │  ┌─────────────────────────┘       │       │
│  │  shadcn/ui Components (Card, Button, Dialog, Table, Tabs, Select, Badge, Toast, etc.)│
│  │  Tailwind CSS Utility Classes                                         │
└─────────────────────────────────────────────┘
```

**Single-Page Application Architecture:** The entire app renders from a single route (`/`) using client-side view switching managed by `useViewStore` (Zustand). Navigation between Shop, Cart, Checkout, and Admin views happens without page reloads, providing a smooth SPA experience.

---

## Database Schema

### Entity Relationship Diagram

```
User (1) ———— (N) Order (1) ———— (N) OrderItem (N) ———— (1) Product
```

### Models

#### User
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | String | PK, auto-generated (cuid) | Unique user identifier |
| `email` | String | unique | User email address |
| `name` | String? | nullable | Display name |
| `role` | String | default: `"user"` | Role for RBAC: `"user"` or `"admin"` |
| `createdAt` | DateTime | auto | Creation timestamp |
| `updatedAt` | DateTime | auto | Last update timestamp |

#### Product
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | String | PK, auto-generated (cuid) | Unique product identifier |
| `name` | String | required | Product display name |
| `description` | String? | nullable | Detailed product description |
| `price` | Float | required | Product price in USD |
| `imageUrl` | String | default: `""` | Path or URL to product image |
| `category` | String | required | Product category for filtering |
| `stockCount` | Int | default: `0` | Available inventory quantity |
| `createdAt` | DateTime | auto | Creation timestamp |
| `updatedAt` | DateTime | auto | Last update timestamp |

#### Order
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | String | PK, auto-generated (cuid) | Unique order identifier |
| `userId` | String? | FK → User.id, nullable | Optional link to registered user |
| `userName` | String | required | Customer full name |
| `userEmail` | String | required | Customer email |
| `userPhone` | String | required | Customer phone number |
| `userAddress` | String | required | Shipping address |
| `totalPrice` | Float | required | Order total including tax |
| `status` | String | default: `"pending"` | Order status: `"pending"`, `"processing"`, `"shipped"`, `"delivered"` |
| `createdAt` | DateTime | auto | Order creation timestamp |
| `updatedAt` | DateTime | auto | Last update timestamp |

#### OrderItem
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | String | PK, auto-generated (cuid) | Unique line item identifier |
| `orderId` | String | FK → Order.id, cascade delete | Parent order |
| `productId` | String | FK → Product.id | Referenced product |
| `productName` | String | required | Product name snapshot at time of order |
| `productPrice` | Float | required | Product price snapshot at time of order |
| `quantity` | Int | required | Quantity ordered |
| `createdAt` | DateTime | auto | Creation timestamp |

---

## API Endpoints

### Products

#### `GET /api/products`
List products with filtering, sorting, and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | `"all"` | Filter by category. Use `"all"` for no filter. |
| `sort` | string | `"newest"` | Sort order: `"newest"`, `"price-asc"`, `"price-desc"`, `"name"` |
| `search` | string | `""` | Search in product name and description |
| `page` | number | `1` | Page number (min: 1) |
| `limit` | number | `12` | Items per page (min: 1) |

**Response (200):**
```json
{
  "products": [
    {
      "id": "cms8k9lfl000frgwzcwxbpo5w",
      "name": "Resistance Bands",
      "description": "Set of 5 latex resistance bands...",
      "price": 19.99,
      "imageUrl": "/products/bands.jpg",
      "category": "Sports",
      "stockCount": 100,
      "createdAt": "2026-07-31T06:28:04.930Z",
      "updatedAt": "2026-07-31T06:28:04.930Z"
    }
  ],
  "total": 16,
  "page": 1,
  "limit": 12,
  "totalPages": 2,
  "categories": ["Electronics", "Clothing", "Home & Kitchen", "Sports"]
}
```

---

#### `POST /api/products`
Create a new product (Admin action).

**Request Body:**
```json
{
  "name": "New Product",
  "description": "A great product",
  "price": "29.99",
  "imageUrl": "/products/new.jpg",
  "category": "Electronics",
  "stockCount": "50"
}
```

**Required fields:** `name`, `price`, `category`

**Response (201):**
```json
{
  "product": { "id": "...", "name": "New Product", ... }
}
```

**Error (400):**
```json
{ "error": "Name, price, and category are required" }
```

---

#### `GET /api/products/[id]`
Get a single product by ID.

**Response (200):**
```json
{ "product": { "id": "...", "name": "...", ... } }
```

**Error (404):**
```json
{ "error": "Product not found" }
```

---

#### `PUT /api/products/[id]`
Update a product (Admin action). Supports partial updates — only included fields are updated.

**Request Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "price": "39.99",
  "stockCount": "75"
}
```

**Response (200):**
```json
{ "product": { "id": "...", "name": "Updated Name", ... } }
```

---

#### `DELETE /api/products/[id]`
Delete a product and its associated order items (Admin action).

**Response (200):**
```json
{ "product": { "id": "...", "name": "...", ... } }
```

---

### Checkout

#### `POST /api/checkout`
Process a checkout. Validates stock availability, creates the order with line items, and deducts inventory.

**Request Body:**
```json
{
  "items": [
    { "id": "product_id_1", "name": "Wireless Mouse", "price": 34.99, "quantity": 2 },
    { "id": "product_id_2", "name": "Yoga Mat", "price": 39.99, "quantity": 1 }
  ],
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "userPhone": "1234567890",
  "userAddress": "123 Main St, City, State, 12345"
}
```

**Required fields:** `items` (non-empty array), `userName`, `userEmail`, `userPhone`, `userAddress`

**Response (201):**
```json
{
  "order": {
    "id": "...",
    "userName": "John Doe",
    "totalPrice": 118.87,
    "status": "pending",
    "items": [
      { "productName": "Wireless Mouse", "quantity": 2, "productPrice": 34.99 },
      { "productName": "Yoga Mat", "quantity": 1, "productPrice": 39.99 }
    ]
  },
  "subtotal": 109.97,
  "tax": 10.997,
  "totalPrice": 118.87
}
```

**Errors:**
- `400` — `{ "error": "Cart is empty" }`
- `400` — `{ "error": "All shipping fields are required" }`
- `400` — `{ "error": "Product X not found" }`
- `400` — `{ "error": "Insufficient stock for X. Available: 3" }`

---

### Orders

#### `GET /api/orders`
List orders with optional status filtering and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | `null` (all) | Filter by status: `"pending"`, `"processing"`, `"shipped"`, `"delivered"` |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Orders per page |

**Response (200):**
```json
{
  "orders": [
    {
      "id": "...",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "totalPrice": 118.87,
      "status": "pending",
      "createdAt": "2026-07-31T06:30:28.000Z",
      "items": [
        { "productName": "Wireless Mouse", "quantity": 2, "productPrice": 34.99 }
      ]
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

#### `PUT /api/orders`
Update an order's status (Admin action).

**Request Body:**
```json
{
  "orderId": "order_id_here",
  "status": "processing"
}
```

**Valid statuses:** `"pending"`, `"processing"`, `"shipped"`, `"delivered"`

**Response (200):**
```json
{ "order": { "id": "...", "status": "processing", ... } }
```

**Errors:**
- `400` — `{ "error": "Order ID and status are required" }`
- `400` — `{ "error": "Invalid status" }`

---

### Admin Analytics

#### `GET /api/admin/revenue`
Get aggregated analytics for the admin dashboard.

**Response (200):**
```json
{
  "totalRevenue": 60.48,
  "totalOrders": 1,
  "pendingOrders": 0,
  "totalProducts": 16,
  "lowStockProducts": 0,
  "revenueByStatus": [
    { "status": "processing", "_sum": { "totalPrice": 60.48 }, "_count": 1 }
  ],
  "recentOrders": [
    {
      "id": "...",
      "userName": "John Doe",
      "totalPrice": 60.48,
      "status": "processing",
      "createdAt": "...",
      "items": [...]
    }
  ]
}
```

**Notes:**
- `totalRevenue` only counts orders with status other than `"pending"` (confirmed revenue)
- `lowStockProducts` counts products with `stockCount <= 5`
- `recentOrders` returns the 5 most recent orders with their line items

---

### Database Seeding

#### `POST /api/seed`
Seed the database with 16 sample products across 4 categories. Idempotent — skips if products already exist.

**Response (200):**
```json
{ "message": "Database already seeded", "count": 16 }
```

**Response (201 on first run):**
```json
{ "message": "Seeded successfully", "total": 16 }
```

---

## State Management

### Cart Store (`src/store/cart-store.ts`)

Manages the shopping cart with **Zustand + persist middleware** for automatic localStorage persistence.

```typescript
interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
  stockCount: number
}

// Available actions:
cartStore.addItem(item)           // Add product or increment quantity (max = stock)
cartStore.removeItem(id)           // Remove product from cart
cartStore.updateQuantity(id, qty)  // Set exact quantity (auto-clamped to stock)
cartStore.clearCart()              // Remove all items
cartStore.getTotalItems()          // Returns total item count
cartStore.getSubtotal()            // Returns subtotal price
```

**Persistence:** Cart data is stored in `localStorage` under the key `"ecommerce-cart"`. Survives page refreshes and browser restarts.

### View Store (`src/store/view-store.ts`)

Manages client-side SPA navigation between views.

```typescript
type ViewType = 'catalog' | 'cart' | 'checkout' | 'admin' | 'order-success'

viewStore.navigate('admin')       // Switch to admin view
viewStore.currentView              // Read current active view
```

---

## Key Features in Detail

### 1. Product Catalog

- **Grid Layout:** Responsive 1/2/3/4 column grid (adapts from mobile to desktop)
- **Search:** Real-time text search across product names and descriptions
- **Category Filter:** Dropdown filter populated dynamically from database categories
- **Sort Options:** Newest first, Price Low→High, Price High→Low, Name A→Z
- **Pagination:** 12 products per page with Previous/Next controls
- **Active Filter Badges:** Visual indication of active filters with one-click removal
- **Stock Indicators:** "Low Stock" badge for items with 5 or fewer units, "Out of Stock" overlay for 0 stock
- **Loading Skeletons:** Animated placeholder cards while products are loading
- **Empty State:** Friendly message when no products match the current filters

### 2. Shopping Cart

- **Quantity Controls:** Plus/Minus buttons with stock-aware clamping
- **Item Removal:** Individual delete with confirmation toast
- **Clear All:** One-click cart clear
- **Order Summary Sidebar:** Sticky sidebar with subtotal, 10% tax, and total calculation
- **Empty Cart State:** Friendly empty state with link back to the catalog
- **Persistent State:** Cart survives page refresh via localStorage

### 3. Checkout Processing

- **Shipping Form:** Name, email, phone, and full address with validation
- **Payment Form:** Card number, expiry (MM/YY), and CVC with format validation
- **Inline Error Messages:** Field-level validation errors shown below each input
- **Order Summary:** Itemized list with per-item totals, subtotal, tax, and grand total
- **Stock Validation:** Server-side stock check before order creation; rolls back if insufficient
- **Inventory Deduction:** Stock is automatically decremented for each ordered item
- **Loading State:** Spinner on submit button during API call
- **Success Redirect:** Navigates to confirmation page after successful order

### 4. Admin Panel

Accessed via the **Admin** tab in the navigation bar.

#### Dashboard Tab
- **KPI Cards:** Total Revenue (non-pending orders), Total Orders, Total Products, Low Stock Items
- **Revenue by Status:** Breakdown showing revenue and count per order status
- **Recent Orders:** Last 5 orders with customer name, date, total, and status badges

#### Products Tab
- **Inventory Table:** Scrollable table with product name, category, price, stock count, and action buttons
- **Create Product:** Dialog form to add new products with all fields
- **Edit Product:** Pre-filled dialog form for updating existing products (partial updates supported)
- **Delete Product:** Confirmation dialog before deletion, also removes associated order items
- **Low Stock Highlighting:** Red text for products with 5 or fewer units

#### Orders Tab
- **Order List:** Cards showing customer info, items, total, date, and status
- **Status Filter:** Dropdown to filter by All, Pending, Processing, Shipped, Delivered
- **Status Update:** Inline dropdown on each order to change status (triggers toast confirmation)
- **Color-Coded Badges:** Visual status indicators (yellow=pending, blue=processing, purple=shipped, green=delivered)

---

## Learning Outcomes Demonstrated

| Learning Outcome | Implementation |
|------------------|---------------|
| Manage complex UI states like global shopping carts | Zustand store with `persist` middleware for localStorage-backed cart state |
| Build role-based access control (RBAC) | User model with `role` field (`"user"`/`"admin"`), Admin panel as restricted view |
| Implement filtering, sorting, and pagination | Server-side query params on `/api/products` with Prisma `where`, `orderBy`, `skip`/`take` |
| Handle relational data structures | Prisma relations: Product → OrderItem ← Order ← User, cascade deletes |
| State preservation across page reloads | Zustand `persist` middleware saving cart to `localStorage` under `"ecommerce-cart"` |
| Dynamic checkout logic | Server-side stock validation, atomic inventory deduction, order + line item creation |
| Privileged administrative access | Admin panel with separate analytics API, product CRUD, and order status management |

---

## Sample Product Data

The seed endpoint adds 16 products across 4 categories:

| Category | Products |
|----------|----------|
| **Electronics** | Wireless Headphones ($89.99), Mechanical Keyboard ($129.99), Bluetooth Speaker ($59.99), Laptop Stand ($44.99), Smart Watch ($199.99), Wireless Mouse ($34.99) |
| **Clothing** | Organic Cotton T-Shirt ($29.99), Backpack ($69.99) |
| **Home & Kitchen** | Stainless Steel Water Bottle ($24.99), Scented Candle Set ($34.99), Cookware Set ($149.99), Desk Lamp ($49.99), Plant Pot Set ($27.99) |
| **Sports** | Yoga Mat ($39.99), Running Shoes ($109.99), Resistance Bands ($19.99) |

---

## Future Improvements

- [ ] Authentication system using NextAuth.js (user registration, login, session management)
- [ ] Product image upload and storage (e.g., using cloud storage)
- [ ] Order confirmation emails (e.g., using Resend or SendGrid)
- [ ] Stripe payment integration for real payment processing
- [ ] Product reviews and ratings system
- [ ] Wishlist functionality
- [ ] Order tracking with shipment status timeline
- [ ] Dashboard charts using Recharts (already available in dependencies)
- [ ] Admin authentication middleware on API routes
- [ ] Unit and integration tests with Vitest
- [ ] Dark mode toggle (infrastructure via `next-themes` already included)

---

## License

This project was built as part of a Full Stack Development Internship (Week 02 Task).