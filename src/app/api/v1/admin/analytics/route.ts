import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await requirePermission(req, 'analytics.read');
    if (errorResponse) return errorResponse;

    // 1. All Non-Cancelled Orders
    const orders = await prisma.order.findMany({
      where: {
        status: { notIn: [OrderStatus.CANCELLED] },
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Gross Sales & Completed/Active Orders
    const totalOrdersCount = orders.length;
    const completedOrdersList = orders.filter((o) =>
      o.status === OrderStatus.DELIVERED ||
      o.status === OrderStatus.SHIPPED ||
      o.status === OrderStatus.PACKED ||
      o.status === OrderStatus.CONFIRMED ||
      o.status === OrderStatus.PREPARING ||
      o.status === OrderStatus.PENDING_CONFIRMATION
    );
    const completedOrdersCount = completedOrdersList.length;

    const grossSales = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const averageOrderValue = totalOrdersCount > 0 ? Math.round(grossSales / totalOrdersCount) : 0;

    // 3. Registered Users count for conversion metric
    const totalUsersCount = await prisma.user.count({ where: { isDeleted: false } });
    const conversionRate = totalUsersCount > 0 
      ? ((totalOrdersCount / totalUsersCount) * 100).toFixed(1) 
      : '0.0';

    // 4. Sales by Category
    const categoryRevenueMap: Record<string, number> = {};
    // 5. Top Revenue Generating Products
    const productRevenueMap: Record<string, { name: string; categoryName: string; units: number; revenue: number }> = {};

    orders.forEach((ord) => {
      ord.orderItems.forEach((item) => {
        const rev = Number(item.totalPrice || (Number(item.unitPrice || 0) * (item.quantity || 1)));
        const catName = item.product?.category?.name || 'Uncategorized';
        const prodId = item.productId || item.product?.id || item.product?.name || 'Unknown Product';
        const prodTitle = item.product?.name || 'Custom Item';

        // Add to Category map
        categoryRevenueMap[catName] = (categoryRevenueMap[catName] || 0) + rev;

        // Add to Product map
        if (!productRevenueMap[prodId]) {
          productRevenueMap[prodId] = {
            name: prodTitle,
            categoryName: catName,
            units: 0,
            revenue: 0,
          };
        }
        productRevenueMap[prodId].units += item.quantity || 1;
        productRevenueMap[prodId].revenue += rev;
      });
    });

    // Format Category breakdown
    const categorySales = Object.entries(categoryRevenueMap).map(([name, amount]) => {
      const percentage = grossSales > 0 ? Math.round((amount / grossSales) * 100) : 0;
      return { name, amount, percentage };
    }).sort((a, b) => b.amount - a.amount);

    // Format Top Products
    const topProducts = Object.values(productRevenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      analytics: {
        grossSales,
        averageOrderValue,
        completedOrders: completedOrdersCount,
        totalOrders: totalOrdersCount,
        conversionRate: `${conversionRate}%`,
        categorySales,
        topProducts,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}
