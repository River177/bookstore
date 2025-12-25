// server/services/book.service.ts - Book Service
import prisma from "../../lib/prisma";
import type { BookSearchParams, PaginatedResult, BookInfo } from "../../lib/types";

export class BookService {
  /**
   * Search books with pagination
   */
  static async searchBooks(params: BookSearchParams): Promise<PaginatedResult<BookInfo>> {
    const { keyword, categoryId, author, isbn, page = 1, pageSize = 10 } = params;
    
    const where: Record<string, unknown> = {
      status: 1, // Only active books
    };

    // Build search conditions
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { author: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (author) where.author = { contains: author, mode: "insensitive" };
    if (isbn) where.isbn = { contains: isbn, mode: "insensitive" };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.book.count({ where }),
    ]);

    return {
      data: books.map((book) => ({
        id: book.id,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        publisher: book.publisher ?? undefined,
        price: Number(book.price),
        stockQuantity: book.stockQuantity,
        description: book.description ?? undefined,
        coverImage: book.coverImage ?? undefined,
        categoryId: book.categoryId ?? undefined,
        categoryName: book.category?.name,
        status: book.status,
        salesCount: book.salesCount,
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
   * Get book by ID
   */
  static async getBookById(id: number): Promise<BookInfo | null> {
    const book = await prisma.book.findUnique({
      where: { id, status: 1 },
      include: { category: true },
    });

    if (!book) return null;

    return {
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher ?? undefined,
      price: Number(book.price),
      stockQuantity: book.stockQuantity,
      description: book.description ?? undefined,
      coverImage: book.coverImage ?? undefined,
      categoryId: book.categoryId ?? undefined,
      categoryName: book.category?.name,
      status: book.status,
      salesCount: book.salesCount,
    };
  }

  /**
   * Get all categories
   */
  static async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get featured books (bestsellers)
   */
  static async getFeaturedBooks(limit = 8) {
    const books = await prisma.book.findMany({
      where: { status: 1 },
      include: { category: true },
      orderBy: { salesCount: "desc" },
      take: limit,
    });

    return books.map((book) => ({
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      price: Number(book.price),
      coverImage: book.coverImage,
      categoryName: book.category?.name,
      salesCount: book.salesCount,
    }));
  }
}
