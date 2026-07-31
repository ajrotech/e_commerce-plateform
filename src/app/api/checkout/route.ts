import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, userName, userEmail, userPhone, userAddress } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    if (!userName || !userEmail || !userPhone || !userAddress) {
      return NextResponse.json(
        { error: 'All shipping fields are required' },
        { status: 400 }
      )
    }

    // Validate stock availability
    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.id } })
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.name} not found` },
          { status: 400 }
        )
      }
      if (product.stockCount < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.name}. Available: ${product.stockCount}` },
          { status: 400 }
        )
      }
    }

    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.1
    const totalPrice = subtotal + tax

    // Create order and order items in a transaction-like sequence
    const order = await db.order.create({
      data: {
        userName,
        userEmail,
        userPhone,
        userAddress,
        totalPrice,
        status: 'pending',
        items: {
          create: items.map((item: { id: string; name: string; price: number; quantity: number }) => ({
            productId: item.id,
            productName: item.name,
            productPrice: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    })

    // Deduct stock for each product
    for (const item of items) {
      await db.product.update({
        where: { id: item.id },
        data: { stockCount: { decrement: item.quantity } },
      })
    }

    return NextResponse.json({ order, subtotal, tax, totalPrice }, { status: 201 })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Checkout failed. Please try again.' },
      { status: 500 }
    )
  }
}
