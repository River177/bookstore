// pages/index/+data.ts - Home Page Data
import { BookService } from "../../server/services/book.service";

export async function data() {
  const [categories, featuredBooks] = await Promise.all([
    BookService.getCategories(),
    BookService.getFeaturedBooks(8),
  ]);

  return {
    categories,
    featuredBooks,
  };
}
