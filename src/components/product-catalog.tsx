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
  const count = useCartStore((s) => s.getTotalItems())

  if (count === 0) return null
  return (
    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
      {count}
    </span>
  )
}
