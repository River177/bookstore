import type { PageContext } from "vike/types";
import { OrderService } from "../../server/services/order.service";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContext) => {
  // 从 localStorage 获取用户信息（客户端渲染时）
  // 注意：服务端渲染时需要通过其他方式获取用户ID
  let userId: number | null = null;
  
  // 如果是服务端渲染，返回空数据，让客户端再次加载
  if (typeof window === 'undefined') {
    return { orders: [], pagination: null, needsClientLoad: true };
  }
  
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      userId = user.id;
    }
  } catch (e) {
    console.error('Failed to get user from localStorage:', e);
  }

  if (!userId) {
    return { orders: [], pagination: null, needsClientLoad: false };
  }

  const page = parseInt(pageContext.urlParsed.search.page || "1");
  const pageSize = 10;

  try {
    const result = await OrderService.getUserOrders(userId, page, pageSize);
    return {
      orders: result.data,
      pagination: result.pagination,
      needsClientLoad: false
    };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { orders: [], pagination: null, needsClientLoad: false };
  }
};
