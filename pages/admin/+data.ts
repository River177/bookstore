import type { PageContext } from "vike/types";
import { AdminService } from "../../../server/services/admin.service";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (_pageContext: PageContext) => {
  try {
    const stats = await AdminService.getDashboardStats();
    return { stats };
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
