// server/services/cart.service.ts - Shopping Cart Service
import prisma from "../../lib/prisma";
import type { Cart, CartItem, BookInfo } from "../../lib/types";

export class CartService {
  /**
   * Get user's cart with items
   */
  static async getCart(userId: number): Promise<Cart> {
    let cart = await prisma.shoppingCart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            book: {
              include: { category: true },
            },
          },
          orderBy: { addedAt: "desc" },
        },
      },
    });

    // Create cart if not exists
    if (!cart) {
      cart = await prisma.shoppingCart.create({
        data: { userId },
        include: {
          items: {
            include: {
              book: {
                include: { category: true },
              },
            },
          },
        },
      });
    }

    const items: CartItem[] = cart.items.map((item) => ({
      id: item.id,
      bookId: item.bookId,
      quantity: item.quantity,
      book: {
        id: item.book.id,
        isbn: item.book.isbn,
        title: item.book.title,
        author: item.book.author,
        publisher: item.book.publisher ?? undefined,
        price: Number(item.book.price),
        stockQuantity: item.book.stockQuantity,
        description: item.book.description ?? undefined,
        coverImage: item.book.coverImage ?? undefined,
        categoryId: item.book.categoryId ?? undefined,
        categoryName: item.book.category?.name,
        status: item.book.status,
        salesCount: item.book.salesCount,
      } as BookInfo,
    }));

    const totalAmount = items.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0
    );
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      items,
      totalAmount,
      totalItems,
    };
  }

  /**
   * Add item to cart
   */
  static async addItem(userId: number, bookId: number, quantity = 1) {
    // Get or create cart
    let cart = await prisma.shoppingCart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.shoppingCart.create({
        data: { userId },
      });
    }

    // Check if book exists and is available
    const book = await prisma.book.findUnique({
      where: { id: bookId, status: 1 },
    });

    if (!book) {
      throw new Error("Book not found or not available");
    }

    if (book.stockQuantity < quantity) {
      throw new Error("Insufficient stock");
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_bookId: { cartId: cart.id, bookId },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > book.stockQuantity) {
        throw new Error("Insufficient stock");
      }
      
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          bookId,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  /**
   * Update cart item quantity
   */
  static async updateItemQuantity(userId: number, itemId: number, quantity: number) {
    const cart = await prisma.shoppingCart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { book: true },
    });

    if (!item) {
      throw new Error("Item not found in cart");
    }

    if (quantity <= 0) {
      // Remove item
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      if (quantity > item.book.stockQuantity) {
        throw new Error("Insufficient stock");
      }
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    return this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  static async removeItem(userId: number, itemId: number) {
    const cart = await prisma.shoppingCart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    return this.getCart(userId);
  }

  /**
   * Clear cart
   */
  static async clearCart(userId: number) {
    const cart = await prisma.shoppingCart.findUnique({
      where: { userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return this.getCart(userId);
  }
}
