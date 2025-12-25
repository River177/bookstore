// server/services/order.service.ts - Order Service
import prisma from "../../lib/prisma";
import type { OrderInfo, OrderStatus } from "../../lib/types";

export interface CreateOrderData {
  userId: number;
  shippingAddress: string;
  paymentMethodId?: number;
}

export class OrderService {
  /**
   * Create order from cart
   */
  static async createOrder(data: CreateOrderData): Promise<OrderInfo> {
    const { userId, shippingAddress, paymentMethodId } = data;

    // Get cart with items
    const cart = await prisma.shoppingCart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { book: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (item.book.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for: ${item.book.title}`);
      }
      if (item.book.status !== 1) {
        throw new Error(`Book not available: ${item.book.title}`);
      }
    }

    // Calculate total
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.book.price) * item.quantity,
      0
    );

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          paymentId: paymentMethodId,
          totalAmount,
          shippingAddress,
          status: "pending",
          items: {
            create: cart.items.map((item) => ({
              bookId: item.bookId,
              quantity: item.quantity,
              unitPrice: item.book.price,
            })),
          },
        },
        include: {
          items: {
            include: { book: true },
          },
        },
      });

      // Update book stock and sales count
      for (const item of cart.items) {
        await tx.book.update({
          where: { id: item.bookId },
          data: {
            stockQuantity: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        });

        // Create stock log
        await tx.stockLog.create({
          data: {
            bookId: item.bookId,
            changeType: "sale",
            changeQuantity: -item.quantity,
            beforeQuantity: item.book.stockQuantity,
            afterQuantity: item.book.stockQuantity - item.quantity,
            relatedOrderId: newOrder.id,
            operatorType: "system",
            remark: `Order #${newOrder.id}`,
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return {
      id: order.id,
      userId: order.userId,
      totalAmount: Number(order.totalAmount),
      status: order.status as OrderStatus,
      shippingAddress: order.shippingAddress,
      orderDate: order.orderDate.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        bookId: item.bookId,
        bookTitle: item.book.title,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
    };
  }

  /**
   * Get user's orders
   */
  static async getUserOrders(userId: number, page = 1, pageSize = 10) {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: { book: true },
          },
        },
        orderBy: { orderDate: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders.map((order) => ({
        id: order.id,
        userId: order.userId,
        totalAmount: Number(order.totalAmount),
        status: order.status as OrderStatus,
        shippingAddress: order.shippingAddress,
        orderDate: order.orderDate.toISOString(),
        items: order.items.map((item) => ({
          id: item.id,
          bookId: item.bookId,
          bookTitle: item.book.title,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
        })),
      })),
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: number, userId?: number): Promise<OrderInfo | null> {
    const where: Record<string, unknown> = { id: orderId };
    if (userId) where.userId = userId;

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: {
          include: { book: true },
        },
      },
    });

    if (!order) return null;

    return {
      id: order.id,
      userId: order.userId,
      totalAmount: Number(order.totalAmount),
      status: order.status as OrderStatus,
      shippingAddress: order.shippingAddress,
      orderDate: order.orderDate.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        bookId: item.bookId,
        bookTitle: item.book.title,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
    };
  }

  /**
   * Update order status (for admin or payment callback)
   */
  static async updateOrderStatus(orderId: number, status: OrderStatus) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
