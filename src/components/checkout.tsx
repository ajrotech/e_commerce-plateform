'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart-store'
import { useViewStore } from '@/store/view-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Loader2, CheckCircle2, CreditCard, Truck } from 'lucide-react'
import { toast } from 'sonner'

export default function Checkout() {
  const items = useCartStore((s) => s.items)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const clearCart = useCartStore((s) => s.clearCart)
  const navigate = useViewStore((s) => s.navigate)

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const subtotal = getSubtotal()
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required'
    if (!form.phone.trim() || form.phone.length < 7) e.phone = 'Valid phone number is required'
    if (!form.address.trim() || form.address.length < 10) e.address = 'Full address is required (min 10 characters)'
    if (!form.cardNumber.trim() || form.cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Valid card number is required'
    if (!form.cardExpiry.trim() || !/\d{2}\/\d{2}/.test(form.cardExpiry)) e.cardExpiry = 'Use MM/YY format'
    if (!form.cardCvc.trim() || form.cardCvc.length < 3) e.cardCvc = 'Valid CVC is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          userName: form.name,
          userEmail: form.email,
          userPhone: form.phone,
          userAddress: form.address,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Checkout failed')
        return
      }

      clearCart()
      toast.success('Order placed successfully!')
      navigate('order-success')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">Nothing to checkout</h2>
        <p className="text-muted-foreground mt-2 mb-6">Your cart is empty</p>
        <Button onClick={() => navigate('catalog')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Browse Products
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('cart')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" placeholder="John Doe" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="john@example.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" placeholder="+1 234 567 890" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Shipping Address *</Label>
                <Textarea id="address" placeholder="123 Main St, Apt 4B, City, State, ZIP" value={form.address} onChange={(e) => updateField('address', e.target.value)} />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input id="cardNumber" placeholder="4242 4242 4242 4242" value={form.cardNumber} onChange={(e) => updateField('cardNumber', e.target.value)} maxLength={19} />
                {errors.cardNumber && <p className="text-sm text-destructive">{errors.cardNumber}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry">Expiry Date *</Label>
                  <Input id="cardExpiry" placeholder="MM/YY" value={form.cardExpiry} onChange={(e) => updateField('cardExpiry', e.target.value)} maxLength={5} />
                  {errors.cardExpiry && <p className="text-sm text-destructive">{errors.cardExpiry}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardCvc">CVC *</Label>
                  <Input id="cardCvc" placeholder="123" value={form.cardCvc} onChange={(e) => updateField('cardCvc', e.target.value)} maxLength={4} />
                  {errors.cardCvc && <p className="text-sm text-destructive">{errors.cardCvc}</p>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">This is a demo. No real payment will be processed.</p>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">{item.name} x{item.quantity}</span>
                  <span className="shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
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
              <Button className="w-full" size="lg" disabled={loading} onClick={handleSubmit}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Place Order — ${total.toFixed(2)}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
