import type { PageContext } from "vike/types";
import { AdminService } from "../../server/services/admin.service";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (_pageContext: PageContext) => {
  try {
    const stats = await AdminService.getDashboardStats();
    // 确保返回的数据是可序列化的纯对象，将Date转换为字符串
    return { 
      stats: {
        totalUsers: stats.totalUsers,
        totalBooks: stats.totalBooks,
        totalOrders: stats.totalOrders,
        todayOrders: stats.todayOrders,
        monthlyRevenue: Number(stats.monthlyRevenue),
        pendingOrders: stats.pendingOrders,
        lowStockBooks: stats.lowStockBooks,
        recentOrders: stats.recentOrders.map((order) => ({
          id: order.id,
          userId: order.userId,
          totalAmount: Number(order.totalAmount),
          status: order.status,
          shippingAddress: order.shippingAddress,
          orderDate: order.orderDate.toISOString(),
          user: order.user,
          items: order.items.map((item) => ({
            id: item.id,
            bookId: item.bookId,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            book: item.book
          }))
        }))
      }
    };
  } catch (error) {
    console.error("Dashboard data error:", error);
    return {
      stats: {
        totalUsers: 0,
        totalBooks: 0,
        totalOrders: 0,
        todayOrders: 0,
        monthlyRevenue: 0,
        pendingOrders: 0,
        lowStockBooks: 0,
        recentOrders: []
      }
    };
  }
};
