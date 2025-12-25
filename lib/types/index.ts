// lib/types/index.ts - Type definitions

// User types
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

// Book types
export interface BookInfo {
  id: number;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  price: number;
  stockQuantity: number;
  description?: string;
  coverImage?: string;
  categoryId?: number;
  categoryName?: string;
  status: number;
  salesCount: number;
}

// Cart types
export interface CartItem {
  id: number;
  bookId: number;
  quantity: number;
  book: BookInfo;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

// Order types
export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export interface OrderInfo {
  id: number;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  orderDate: string;
  items: OrderItemInfo[];
}

export interface OrderItemInfo {
  id: number;
  bookId: number;
  bookTitle: string;
  quantity: number;
  unitPrice: number;
}

// Pagination
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Search params
export interface BookSearchParams extends PaginationParams {
  keyword?: string;
  categoryId?: number;
  author?: string;
  isbn?: string;
}
