// server/handlers/api.handler.ts - API Route Handler
import { enhance, type UniversalHandler } from "@universal-middleware/core";
import { BookService } from "../services/book.service";
import { UserService } from "../services/user.service";
import { CartService } from "../services/cart.service";
import { OrderService } from "../services/order.service";
import { AdminService } from "../services/admin.service";
import { success, error } from "../../lib/utils/response";

/**
 * API Router Handler
 */
export const apiHandler = enhance(
  async (request) => {
    const url = new URL(request.url);
    const path = url.pathname.replace("/api", "");
    const method = request.method;

    try {
      // Books API
      if (path === "/books" && method === "GET") {
        const params = Object.fromEntries(url.searchParams);
        const result = await BookService.searchBooks({
          keyword: params.keyword,
          categoryId: params.categoryId ? Number(params.categoryId) : undefined,
          author: params.author,
          isbn: params.isbn,
          page: params.page ? Number(params.page) : 1,
          pageSize: params.pageSize ? Number(params.pageSize) : 10,
        });
        return Response.json(result);
      }

      if (path.startsWith("/books/") && method === "GET") {
        const id = Number(path.split("/")[2]);
        const book = await BookService.getBookById(id);
        if (!book) {
          return Response.json(error("Book not found"), { status: 404 });
        }
        return Response.json(success(book));
      }

      // Categories API
      if (path === "/categories" && method === "GET") {
        const categories = await BookService.getCategories();
        return Response.json(success(categories));
      }

      // Featured books
      if (path === "/books/featured" && method === "GET") {
        const limit = url.searchParams.get("limit");
        const books = await BookService.getFeaturedBooks(limit ? Number(limit) : 8);
        return Response.json(success(books));
      }

      // User registration
      if (path === "/auth/register" && method === "POST") {
        const body = await request.json();
        const result = await UserService.register(body);
        if (!result.success) {
          return Response.json(error(result.message || "Registration failed"), { status: 400 });
        }
        return Response.json(success(result.user, "Registration successful"));
      }

      // User login
      if (path === "/auth/login" && method === "POST") {
        const body = await request.json();
        const result = await UserService.login(body.username, body.password);
        if (!result.success) {
          return Response.json(error(result.message || "Login failed"), { status: 401 });
        }
        return Response.json(success(result.user, "Login successful"));
      }

      // Cart API (requires auth - simplified for demo)
      if (path === "/cart" && method === "GET") {
        const userId = Number(url.searchParams.get("userId"));
        if (!userId) {
          return Response.json(error("User ID required"), { status: 400 });
        }
        const cart = await CartService.getCart(userId);
        return Response.json(success(cart));
      }

      if (path === "/cart/add" && method === "POST") {
        const body = await request.json();
        const cart = await CartService.addItem(body.userId, body.bookId, body.quantity || 1);
        return Response.json(success(cart, "Added to cart"));
      }

      if (path === "/cart/update" && method === "PUT") {
        const body = await request.json();
        const cart = await CartService.updateItemQuantity(body.userId, body.itemId, body.quantity);
        return Response.json(success(cart, "Cart updated"));
      }

      if (path === "/cart/remove" && method === "DELETE") {
        const userId = Number(url.searchParams.get("userId"));
        const itemId = Number(url.searchParams.get("itemId"));
        const cart = await CartService.removeItem(userId, itemId);
        return Response.json(success(cart, "Item removed"));
      }

      // Orders API
      if (path === "/orders" && method === "GET") {
        const userId = Number(url.searchParams.get("userId"));
        const page = Number(url.searchParams.get("page")) || 1;
        const pageSize = Number(url.searchParams.get("pageSize")) || 10;
        const orders = await OrderService.getUserOrders(userId, page, pageSize);
        return Response.json(orders);
      }

      if (path === "/orders" && method === "POST") {
        const body = await request.json();
        const order = await OrderService.createOrder(body);
        return Response.json(success(order, "Order created"));
      }

      if (path.startsWith("/orders/") && method === "GET") {
        const id = Number(path.split("/")[2]);
        const userId = url.searchParams.get("userId");
        const order = await OrderService.getOrderById(id, userId ? Number(userId) : undefined);
        if (!order) {
          return Response.json(error("Order not found"), { status: 404 });
        }
        return Response.json(success(order));
      }

      // ==========================================
      // Admin API Routes
      // ==========================================

      // Admin login
      if (path === "/admin/login" && method === "POST") {
        const body = await request.json();
        const admin = await AdminService.login(body.username, body.password);
        if (!admin) {
          return Response.json(error("Invalid credentials"), { status: 401 });
        }
        return Response.json(success(admin, "Login successful"));
      }

      // Admin dashboard stats
      if (path === "/admin/dashboard" && method === "GET") {
        const stats = await AdminService.getDashboardStats();
        return Response.json(success(stats));
      }

      // Admin - Users management
      if (path === "/admin/users" && method === "GET") {
        const params = Object.fromEntries(url.searchParams);
        const result = await AdminService.getUsers({
          page: params.page ? Number(params.page) : 1,
          pageSize: params.pageSize ? Number(params.pageSize) : 10,
          keyword: params.keyword,
          status: params.status !== undefined ? Number(params.status) : undefined,
        });
        return Response.json(result);
      }

      if (path.match(/^\/admin\/users\/\d+\/status$/) && method === "PUT") {
        const userId = Number(path.split("/")[3]);
        const body = await request.json();
        const user = await AdminService.updateUserStatus(userId, body.status);
        return Response.json(success(user, "User status updated"));
      }

      // Admin - Books management
      if (path === "/admin/books" && method === "GET") {
        const params = Object.fromEntries(url.searchParams);
        const result = await AdminService.getBooks({
          page: params.page ? Number(params.page) : 1,
          pageSize: params.pageSize ? Number(params.pageSize) : 10,
          keyword: params.keyword,
          categoryId: params.categoryId ? Number(params.categoryId) : undefined,
          status: params.status !== undefined ? Number(params.status) : undefined,
        });
        return Response.json(result);
      }

      if (path === "/admin/books" && method === "POST") {
        const body = await request.json();
        const book = await AdminService.createBook(body);
        return Response.json(success(book, "Book created"));
      }

      if (path.match(/^\/admin\/books\/\d+$/) && method === "PUT") {
        const bookId = Number(path.split("/")[3]);
        const body = await request.json();
        const book = await AdminService.updateBook(bookId, body);
        return Response.json(success(book, "Book updated"));
      }

      if (path.match(/^\/admin\/books\/\d+$/) && method === "DELETE") {
        const bookId = Number(path.split("/")[3]);
        await AdminService.deleteBook(bookId);
        return Response.json(success(null, "Book deleted"));
      }

      if (path.match(/^\/admin\/books\/\d+\/stock$/) && method === "PUT") {
        const bookId = Number(path.split("/")[3]);
        const body = await request.json();
        const result = await AdminService.updateStock(bookId, body.quantity, body.operatorId, body.remark);
        return Response.json(success(result, "Stock updated"));
      }

      // Admin - Orders management
      if (path === "/admin/orders" && method === "GET") {
        const params = Object.fromEntries(url.searchParams);
        const result = await AdminService.getOrders({
          page: params.page ? Number(params.page) : 1,
          pageSize: params.pageSize ? Number(params.pageSize) : 10,
          status: params.status,
          userId: params.userId ? Number(params.userId) : undefined,
          startDate: params.startDate ? new Date(params.startDate) : undefined,
          endDate: params.endDate ? new Date(params.endDate) : undefined,
        });
        return Response.json(result);
      }

      if (path.match(/^\/admin\/orders\/\d+\/status$/) && method === "PUT") {
        const orderId = Number(path.split("/")[3]);
        const body = await request.json();
        const order = await AdminService.updateOrderStatus(orderId, body.status);
        return Response.json(success(order, "Order status updated"));
      }

      // Admin - Operation logs
      if (path === "/admin/logs" && method === "GET") {
        const params = Object.fromEntries(url.searchParams);
        const result = await AdminService.getOperationLogs({
          page: params.page ? Number(params.page) : 1,
          pageSize: params.pageSize ? Number(params.pageSize) : 20,
          module: params.module,
          action: params.action,
          adminId: params.adminId ? Number(params.adminId) : undefined,
          startDate: params.startDate ? new Date(params.startDate) : undefined,
          endDate: params.endDate ? new Date(params.endDate) : undefined,
        });
        return Response.json(result);
      }

      // Admin - Stock logs
      if (path === "/admin/stock-logs" && method === "GET") {
        const params = Object.fromEntries(url.searchParams);
        const result = await AdminService.getStockLogs(
          params.bookId ? Number(params.bookId) : undefined,
          params.page ? Number(params.page) : 1,
          params.pageSize ? Number(params.pageSize) : 20
        );
        return Response.json(result);
      }

      return Response.json(error("Not found"), { status: 404 });
    } catch (err) {
      console.error("API Error:", err);
      const message = err instanceof Error ? err.message : "Internal server error";
      return Response.json(error(message), { status: 500 });
    }
  },
  {
    name: "bookstore:api-handler",
    path: "/api/**",
    method: ["GET", "POST", "PUT", "DELETE"],
    immutable: false,
  }
) satisfies UniversalHandler;
