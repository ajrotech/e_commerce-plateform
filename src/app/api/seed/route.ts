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
