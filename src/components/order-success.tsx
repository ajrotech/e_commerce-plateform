'use client'

import { useViewStore } from '@/store/view-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, ShoppingBag, ArrowLeft } from 'lucide-react'

export default function OrderSuccess() {
  const navigate = useViewStore((s) => s.navigate)

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-green-100 p-4 mb-6">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Order Placed Successfully!</h1>
      <p className="text-muted-foreground mt-3 max-w-md">
        Thank you for your purchase. Your order has been confirmed and is being processed. You will receive a confirmation email shortly.
      </p>
      <Card className="mt-8 max-w-sm w-full">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-green-600">Confirmed</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated Delivery</span>
            <span className="font-medium">3-5 Business Days</span>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={() => navigate('catalog')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Button>
        <Button onClick={() => navigate('admin')}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Admin Panel
        </Button>
      </div>
    </div>
  )
}
