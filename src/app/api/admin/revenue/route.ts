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
