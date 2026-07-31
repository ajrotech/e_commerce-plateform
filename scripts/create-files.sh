#!/bin/bash
set -e

# 1. Admin revenue API
cat > /home/z/my-project/src/app/api/admin/revenue/route.ts << 'ENDOFFILE'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const totalRevenue = await db.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: { not: 'pending' } },
    })

    const totalOrders = await db.order.count()
    const pendingOrders = await db.order.count({ where: { status: 'pending' } })
    const totalProducts = await db.product.count()
    const lowStockProducts = await db.product.count({
      where: { stockCount: { lte: 5 } },
    })

    const revenueByStatus = await db.order.groupBy({
      by: ['status'],
      _sum: { totalPrice: true },
      _count: true,
    })

    const recentOrders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: true },
    })

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      revenueByStatus,
      recentOrders,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
ENDOFFILE

echo "Created admin/revenue/route.ts"

# 2. Seed API
cat > /home/z/my-project/src/app/api/seed/route.ts << 'ENDOFFILE'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const PRODUCTS = [
  { name: 'Wireless Headphones', description: 'Premium over-ear wireless headphones with active noise cancellation and 30-hour battery life.', price: 89.99, imageUrl: '/products/headphones.jpg', category: 'Electronics', stockCount: 45 },
  { name: 'Organic Cotton T-Shirt', description: 'Comfortable 100% organic cotton t-shirt, sustainably sourced and ethically manufactured.', price: 29.99, imageUrl: '/products/tshirt.jpg', category: 'Clothing', stockCount: 120 },
  { name: 'Stainless Steel Water Bottle', description: 'Double-walled insulated bottle that keeps drinks cold for 24 hours or hot for 12 hours.', price: 24.99, imageUrl: '/products/bottle.jpg', category: 'Home & Kitchen', stockCount: 80 },
  { name: 'Mechanical Keyboard', description: 'Compact 75% layout mechanical keyboard with hot-swappable switches and RGB backlighting.', price: 129.99, imageUrl: '/products/keyboard.jpg', category: 'Electronics', stockCount: 30 },
  { name: 'Yoga Mat', description: 'Extra thick 6mm non-slip yoga mat made from eco-friendly TPE material.', price: 39.99, imageUrl: '/products/yogamat.jpg', category: 'Sports', stockCount: 60 },
  { name: 'Running Shoes', description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper.', price: 109.99, imageUrl: '/products/shoes.jpg', category: 'Sports', stockCount: 35 },
  { name: 'Bluetooth Speaker', description: 'Portable waterproof speaker with 360-degree sound and 20-hour playtime.', price: 59.99, imageUrl: '/products/speaker.jpg', category: 'Electronics', stockCount: 55 },
  { name: 'Laptop Stand', description: 'Adjustable aluminum laptop stand for improved ergonomics and airflow.', price: 44.99, imageUrl: '/products/stand.jpg', category: 'Electronics', stockCount: 40 },
  { name: 'Scented Candle Set', description: 'Set of 3 hand-poured soy wax candles in lavender, vanilla, and ocean breeze scents.', price: 34.99, imageUrl: '/products/candles.jpg', category: 'Home & Kitchen', stockCount: 70 },
  { name: 'Backpack', description: 'Durable 30L daypack with padded laptop compartment and multiple organization pockets.', price: 69.99, imageUrl: '/products/backpack.jpg', category: 'Clothing', stockCount: 50 },
  { name: 'Smart Watch', description: 'Fitness tracking smartwatch with heart rate monitor, GPS, and 7-day battery life.', price: 199.99, imageUrl: '/products/watch.jpg', category: 'Electronics', stockCount: 25 },
  { name: 'Cookware Set', description: '10-piece non-stick cookware set including pots, pans, and utensils.', price: 149.99, imageUrl: '/products/cookware.jpg', category: 'Home & Kitchen', stockCount: 20 },
  { name: 'Desk Lamp', description: 'LED desk lamp with 5 brightness levels, 3 color temperatures, and USB charging port.', price: 49.99, imageUrl: '/products/lamp.jpg', category: 'Home & Kitchen', stockCount: 65 },
  { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with adjustable DPI and silent click buttons.', price: 34.99, imageUrl: '/products/mouse.jpg', category: 'Electronics', stockCount: 90 },
  { name: 'Plant Pot Set', description: 'Set of 4 minimalist ceramic plant pots in varying sizes with drainage holes.', price: 27.99, imageUrl: '/products/pots.jpg', category: 'Home & Kitchen', stockCount: 45 },
  { name: 'Resistance Bands', description: 'Set of 5 latex resistance bands with varying resistance levels and carrying pouch.', price: 19.99, imageUrl: '/products/bands.jpg', category: 'Sports', stockCount: 100 },
]

export async function POST() {
  try {
    const count = await db.product.count()
    if (count > 0) {
      return NextResponse.json({ message: 'Database already seeded', count })
    }

    for (const product of PRODUCTS) {
      await db.product.create({ data: product })
    }

    const total = await db.product.count()
    return NextResponse.json({ message: 'Seeded successfully', total })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}
ENDOFFILE

echo "Created seed/route.ts"

# 3. Product Catalog Component
cat > /home/z/my-project/src/components/product-catalog.tsx << 'ENDOFFILE'
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCartStore } from '@/store/cart-store'
import { useViewStore } from '@/store/view-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ShoppingCart, Package, Star, SlidersHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  stockCount: number
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const navigate = useViewStore((s) => s.navigate)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ category, sort, page: String(page), limit: '12' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
      setCategories(data.categories || [])
      setTotalPages(data.totalPages || 1)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [category, sort, search, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => { setPage(1) }, [category, sort, search])

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stockCount: product.stockCount,
    })
    toast.success(`${product.name} added to cart`)
  }

  const placeholders: Record<string, string> = {
    Electronics: '🔌',
    Clothing: '👕',
    'Home & Kitchen': '🏠',
    Sports: '⚽',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
          <p className="text-muted-foreground">Browse our curated collection of products</p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="relative"
          onClick={() => navigate('cart')}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Cart
          <CartBadge />
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon" className="sm:hidden" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <div className={`flex gap-2 ${showFilters ? 'flex' : 'hidden'} sm:flex`}>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low-High</SelectItem>
              <SelectItem value="price-desc">Price: High-Low</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {(category !== 'all' || search) && (
        <div className="flex flex-wrap items-center gap-2">
          {category !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {category}
              <button onClick={() => setCategory('all')} className="ml-1 rounded-full hover:bg-muted-foreground/20">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {search && (
            <Badge variant="secondary" className="gap-1">
              &ldquo;{search}&rdquo;
              <button onClick={() => setSearch('')} className="ml-1 rounded-full hover:bg-muted-foreground/20">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No products found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden transition-all hover:shadow-lg">
              <div className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center text-6xl">
                <span>{placeholders[product.category] || '📦'}</span>
                {product.stockCount <= 5 && product.stockCount > 0 && (
                  <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
                    Low Stock
                  </Badge>
                )}
                {product.stockCount === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <Badge variant="outline" className="text-xs mb-2">{product.category}</Badge>
                <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">(4.0)</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                  <span className={`text-xs ${product.stockCount <= 5 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {product.stockCount} in stock
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full"
                  disabled={product.stockCount === 0}
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.stockCount === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

function CartBadge() {
  const getTotalItems = useCartStore((s) => s.getTotalItems)
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(getTotalItems())
    const unsub = useCartStore.subscribe(() => setCount(getTotalItems()))
    return unsub
  }, [getTotalItems])

  if (count === 0) return null
  return (
    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
      {count}
    </span>
  )
}
ENDOFFILE

echo "Created product-catalog.tsx"

# 4. Shopping Cart Component
cat > /home/z/my-project/src/components/shopping-cart.tsx << 'ENDOFFILE'
'use client'

import { useCartStore, CartItem } from '@/store/cart-store'
import { useViewStore } from '@/store/view-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Minus, Plus, Trash2, ArrowLeft, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

const placeholders: Record<string, string> = {
  Electronics: '🔌',
  Clothing: '👕',
  'Home & Kitchen': '🏠',
  Sports: '⚽',
}

export default function ShoppingCart() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const navigate = useViewStore((s) => s.navigate)

  const subtotal = getSubtotal()
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const handleRemove = (item: CartItem) => {
    removeItem(item.id)
    toast.success(`${item.name} removed from cart`)
  }

  const handleClear = () => {
    clearCart()
    toast.success('Cart cleared')
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground mt-2 mb-6">Add some products to get started</p>
        <Button onClick={() => navigate('catalog')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground">{items.length} item{items.length > 1 ? 's' : ''} in your cart</p>
        </div>
        <Button variant="outline" onClick={() => navigate('catalog')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center text-3xl shrink-0">
                    {placeholders['Electronics'] || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={item.quantity >= item.stockCount}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemove(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="ghost" className="text-destructive" onClick={handleClear}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={() => navigate('checkout')}>
                <CreditCard className="mr-2 h-5 w-5" />
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('catalog')}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
ENDOFFILE

echo "Created shopping-cart.tsx"

echo "All API and component files created successfully!"