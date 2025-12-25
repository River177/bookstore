// pages/search/+data.ts - Search Page Data
import type { PageContextServer } from "vike/types";
import { BookService } from "../../server/services/book.service";

export async function data(pageContext: PageContextServer) {
  const url = new URL(pageContext.urlOriginal, "http://localhost");
  const params = Object.fromEntries(url.searchParams);

  const [result, categories] = await Promise.all([
    BookService.searchBooks({
      keyword: params.keyword,
      categoryId: params.categoryId ? Number(params.categoryId) : undefined,
      author: params.author,
      isbn: params.isbn,
      page: params.page ? Number(params.page) : 1,
      pageSize: 12,
    }),
    BookService.getCategories(),
  ]);

  return {
    books: result.data,
    pagination: result.pagination,
    categories,
    keyword: params.keyword || "",
    selectedCategory: params.categoryId ? Number(params.categoryId) : undefined,
  };
}
