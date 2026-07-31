'use client'

import { useState, useEffect, useCallback } from 'react'
import { useViewStore } from '@/store/view-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, ShoppingCart, Package, AlertTriangle, Plus, Pencil, Trash2, ArrowLeft, Loader2, BarChart3, ClipboardList, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface Analytics {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  lowStockProducts: number
  revenueByStatus: { status: string; _sum: { totalPrice: number }; _count: number }[]
  recentOrders: Order[]
}

interface Order {
  id: string
  userName: string
  userEmail: string
  totalPrice: number
  status: string
  createdAt: string
  items: { productName: string; quantity: number; productPrice: number }[]
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  stockCount: number
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
}

const emptyProduct = { name: '', description: '', price: '', imageUrl: '', category: 'Electronics', stockCount: '' }

export default function AdminPanel() {
  const navigate = useViewStore((s) => s.navigate)
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('catalog')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your store inventory and orders</p>
        </div>
        <Badge className="ml-auto" variant="outline">Admin Access</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="gap-2"><BarChart3 className="h-4 w-4" />Dashboard</TabsTrigger>
          <TabsTrigger value="products" className="gap-2"><Package className="h-4 w-4" />Products</TabsTrigger>
          <TabsTrigger value="orders" className="gap-2"><ClipboardList className="h-4 w-4" />Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <AdminDashboard />
        </TabsContent>
        <TabsContent value="products" className="mt-6">
          <AdminProducts />
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          <AdminOrders />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/revenue')
      const data = await res.json()
      setAnalytics(data)
    } catch {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  if (loading || !analytics) {
    return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="p-6"><div className="h-20 bg-muted animate-pulse rounded" /></CardContent></Card>)}</div>
  }

  const stats = [
    { label: 'Total Revenue', value: `$${analytics.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-100' },
    { label: 'Total Orders', value: String(analytics.totalOrders), icon: ShoppingCart, color: 'text-blue-600 bg-blue-100' },
    { label: 'Total Products', value: String(analytics.totalProducts), icon: Package, color: 'text-purple-600 bg-purple-100' },
    { label: 'Low Stock Items', value: String(analytics.lowStockProducts), icon: AlertTriangle, color: 'text-orange-600 bg-orange-100' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Revenue by Status</CardTitle></CardHeader>
          <CardContent>
            {analytics.revenueByStatus.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No revenue data yet</p>
            ) : (
              <div className="space-y-4">
                {analytics.revenueByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[item.status] || ''}>{item.status}</Badge>
                      <span className="text-sm text-muted-foreground">{item._count} orders</span>
                    </div>
                    <span className="font-semibold">${(item._sum.totalPrice || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardContent>
            {analytics.recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{order.userName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">${order.totalPrice.toFixed(2)}</p>
                      <Badge variant="outline" className={statusColors[order.status] || ''}>{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyProduct)
  const [saving, setSaving] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products?limit=50')
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const openCreate = () => {
    setEditingProduct(null)
    setForm(emptyProduct)
    setDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl,
      category: product.category,
      stockCount: String(product.stockCount),
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      toast.error('Name, price, and category are required')
      return
    }
    setSaving(true)
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to save product')
        return
      }
      toast.success(editingProduct ? 'Product updated' : 'Product created')
      setDialogOpen(false)
      fetchProducts()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Failed to delete'); return }
      toast.success('Product deleted')
      fetchProducts()
    } catch {
      toast.error('Network error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Product Inventory</h2>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Product</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="29.99" />
              </div>
              <div className="space-y-2">
                <Label>Stock Count</Label>
                <Input type="number" value={form.stockCount} onChange={(e) => setForm({ ...form, stockCount: e.target.value })} placeholder="100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Home & Kitchen">Home & Kitchen</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/products/item.jpg" />
              </div>
            </div>
            <Button className="w-full" disabled={saving} onClick={handleSave}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : (editingProduct ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Card key={i}><CardContent className="p-4"><div className="h-10 bg-muted animate-pulse rounded" /></CardContent></Card>)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Product</th>
                    <th className="p-3 text-left text-sm font-medium hidden sm:table-cell">Category</th>
                    <th className="p-3 text-left text-sm font-medium">Price</th>
                    <th className="p-3 text-left text-sm font-medium">Stock</th>
                    <th className="p-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3"><div className="font-medium">{product.name}</div><div className="text-xs text-muted-foreground sm:hidden">{product.category}</div></td>
                      <td className="p-3 hidden sm:table-cell"><Badge variant="outline">{product.category}</Badge></td>
                      <td className="p-3 font-medium">${product.price.toFixed(2)}</td>
                      <td className="p-3"><span className={product.stockCount <= 5 ? 'text-red-600 font-medium' : ''}>{product.stockCount}</span></td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id, product.name)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/orders?${params}`)
      const data = await res.json()
      setOrders(data.orders || [])
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      })
      if (!res.ok) { toast.error('Failed to update status'); return }
      toast.success(`Order status updated to ${newStatus}`)
      fetchOrders()
    } catch {
      toast.error('Network error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Order Management</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-4"><div className="h-24 bg-muted animate-pulse rounded" /></CardContent></Card>)}</div>
      ) : orders.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No orders found</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{order.userName}</span>
                      <Badge className={statusColors[order.status] || ''}>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.userEmail}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                    <div className="text-sm mt-1">
                      {order.items.map((item, i) => (
                        <span key={i} className="text-muted-foreground">{item.productName} x{item.quantity}{i < order.items.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-bold">${order.totalPrice.toFixed(2)}</span>
                    <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
