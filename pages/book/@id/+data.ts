// pages/book/@id/+data.ts - Book Detail Data
import type { PageContextServer } from "vike/types";
import { BookService } from "../../../server/services/book.service";

export async function data(pageContext: PageContextServer) {
  const id = Number(pageContext.routeParams?.id);
  
  if (!id || isNaN(id)) {
    return { book: null };
  }

  const book = await BookService.getBookById(id);
  
  return { book };
}
