import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";

// ==========================================
// Admin Service - 管理员服务
// ==========================================

export class AdminService {
  /**
   * 管理员登录验证
   */
  static async login(username: string, password: string) {
    const admin = await prisma.admin.findUnique({
      where: { username },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });

    if (!admin || admin.status !== 1) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return null;
    }

    // 更新最后登录时间
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() }
    });

    // 提取权限列表
    const permissions = admin.roles.flatMap(ar =>
      ar.role.permissions.map(rp => rp.permission.permissionKey)
    );

    const { password: _, ...adminData } = admin;
    return { ...adminData, permissions };
  }

  /**
   * 获取管理员列表
   */
  static async getAdmins(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [admins, total] = await Promise.all([
      prisma.admin.findMany({
        skip,
        take: pageSize,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          roles: {
            include: { role: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.admin.count()
    ]);

    return {
      data: admins,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 记录操作日志
   */
  static async logOperation(data: {
    adminId?: number;
    adminName?: string;
    module: string;
    action: string;
    targetType?: string;
    targetId?: number;
    content?: string;
    requestUrl?: string;
    requestMethod?: string;
    responseCode?: number;
    ipAddress?: string;
    executionTime?: number;
    status?: number;
    errorMessage?: string;
  }) {
    return prisma.operationLog.create({
      data: {
        adminId: data.adminId,
        adminName: data.adminName,
        module: data.module,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        content: data.content,
        requestUrl: data.requestUrl,
        requestMethod: data.requestMethod,
        responseCode: data.responseCode,
        ipAddress: data.ipAddress,
        executionTime: data.executionTime,
        status: data.status ?? 1,
        errorMessage: data.errorMessage
      }
    });
  }

  /**
   * 获取操作日志列表
   */
  static async getOperationLogs(params: {
    page?: number;
    pageSize?: number;
    module?: string;
    action?: string;
    adminId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page = 1, pageSize = 20, module, action, adminId, startDate, endDate } = params;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (module) where.module = module;
    if (action) where.action = action;
    if (adminId) where.adminId = adminId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.operationLog.findMany({
        where,
        skip,
        take: pageSize,
        include: { admin: { select: { username: true, fullName: true } } },
        orderBy: { createdAt: "desc" }
      }),
      prisma.operationLog.count({ where })
    ]);

    return {
      data: logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 获取仪表盘统计数据
   */
  static async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalUsers,
      totalBooks,
      totalOrders,
      todayOrders,
      monthlyRevenue,
      pendingOrders,
      lowStockBooks,
      recentOrders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.book.count(),
      prisma.order.count(),
      prisma.order.count({
        where: { orderDate: { gte: today } }
      }),
      prisma.order.aggregate({
        where: {
          orderDate: { gte: monthStart },
          status: { in: ["paid", "shipped", "delivered"] }
        },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({
        where: { status: "pending" }
      }),
      prisma.book.count({
        where: { stockQuantity: { lt: 10 } }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { orderDate: "desc" },
        include: {
          user: { select: { username: true, fullName: true } },
          items: { include: { book: { select: { title: true } } } }
        }
      })
    ]);

    return {
      totalUsers,
      totalBooks,
      totalOrders,
      todayOrders,
      monthlyRevenue: monthlyRevenue._sum.totalAmount?.toNumber() || 0,
      pendingOrders,
      lowStockBooks,
      recentOrders
    };
  }

  /**
   * 获取用户列表（管理端）
   */
  static async getUsers(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: number;
  }) {
    const { page = 1, pageSize = 10, keyword, status } = params;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (keyword) {
      where.OR = [
        { username: { contains: keyword, mode: "insensitive" } },
        { email: { contains: keyword, mode: "insensitive" } },
        { fullName: { contains: keyword, mode: "insensitive" } }
      ];
    }
    if (status !== undefined) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          address: true,
          city: true,
          status: true,
          createdAt: true,
          _count: { select: { orders: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where })
    ]);

    return {
      data: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 更新用户状态
   */
  static async updateUserStatus(userId: number, status: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { status }
    });
  }

  /**
   * 获取订单列表（管理端）
   */
  static async getOrders(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page = 1, pageSize = 10, status, userId, startDate, endDate } = params;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) (where.orderDate as Record<string, Date>).gte = startDate;
      if (endDate) (where.orderDate as Record<string, Date>).lte = endDate;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: { select: { username: true, fullName: true, email: true } },
          items: {
            include: { book: { select: { title: true, coverImage: true } } }
          }
        },
        orderBy: { orderDate: "desc" }
      }),
      prisma.order.count({ where })
    ]);

    return {
      data: orders.map(order => ({
        ...order,
        totalAmount: order.totalAmount.toNumber(),
        items: order.items.map(item => ({
          ...item,
          unitPrice: item.unitPrice.toNumber()
        }))
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 更新订单状态
   */
  static async updateOrderStatus(orderId: number, status: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  }

  /**
   * 获取图书列表（管理端）
   */
  static async getBooks(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    categoryId?: number;
    status?: number;
  }) {
    const { page = 1, pageSize = 10, keyword, categoryId, status } = params;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { author: { contains: keyword, mode: "insensitive" } },
        { isbn: { contains: keyword } }
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (status !== undefined) where.status = status;

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: pageSize,
        include: { category: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.book.count({ where })
    ]);

    return {
      data: books.map(book => ({
        ...book,
        price: book.price.toNumber()
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 创建图书
   */
  static async createBook(data: {
    isbn: string;
    title: string;
    author: string;
    publisher?: string;
    price: number;
    stockQuantity?: number;
    description?: string;
    coverImage?: string;
    categoryId?: number;
  }) {
    return prisma.book.create({ data });
  }

  /**
   * 更新图书
   */
  static async updateBook(bookId: number, data: {
    isbn?: string;
    title?: string;
    author?: string;
    publisher?: string;
    price?: number;
    stockQuantity?: number;
    description?: string;
    coverImage?: string;
    categoryId?: number;
    status?: number;
  }) {
    return prisma.book.update({
      where: { id: bookId },
      data
    });
  }

  /**
   * 删除图书
   */
  static async deleteBook(bookId: number) {
    return prisma.book.delete({ where: { id: bookId } });
  }

  /**
   * 更新库存
   */
  static async updateStock(bookId: number, quantity: number, operatorId?: number, remark?: string) {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new Error("Book not found");

    const beforeQuantity = book.stockQuantity;
    const afterQuantity = beforeQuantity + quantity;

    await prisma.$transaction([
      prisma.book.update({
        where: { id: bookId },
        data: { stockQuantity: afterQuantity }
      }),
      prisma.stockLog.create({
        data: {
          bookId,
          changeType: quantity > 0 ? "in" : "out",
          changeQuantity: Math.abs(quantity),
          beforeQuantity,
          afterQuantity,
          operatorId,
          operatorType: "admin",
          remark
        }
      })
    ]);

    return { beforeQuantity, afterQuantity };
  }

  /**
   * 获取库存变动记录
   */
  static async getStockLogs(bookId?: number, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const where = bookId ? { bookId } : {};

    const [logs, total] = await Promise.all([
      prisma.stockLog.findMany({
        where,
        skip,
        take: pageSize,
        include: { book: { select: { title: true, isbn: true } } },
        orderBy: { createdAt: "desc" }
      }),
      prisma.stockLog.count({ where })
    ]);

    return {
      data: logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
}
