<!-- pages/search/+Page.vue - Search Page -->
<template>
  <div>
    <!-- Search Header -->
    <div class="bg-base-100 rounded-box p-6 mb-8">
      <h1 class="text-3xl font-bold mb-4">搜索图书</h1>
      <form @submit.prevent="handleSearch" class="flex flex-col md:flex-row gap-4">
        <div class="form-control flex-1">
          <div class="input-group">
            <select v-model="searchType" class="select select-bordered">
              <option value="keyword">关键词</option>
              <option value="author">作者</option>
              <option value="isbn">ISBN</option>
            </select>
            <input v-model="searchValue" type="text" placeholder="搜索..." class="input input-bordered flex-1" />
            <button type="submit" class="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar Filters -->
      <aside class="w-full lg:w-64 shrink-0">
        <div class="bg-base-100 rounded-box p-4">
          <h3 class="font-bold mb-4">图书分类</h3>
          <ul class="menu">
            <li>
              <a :href="`/search`" :class="{ active: !selectedCategory }">全部分类</a>
            </li>
            <li v-for="cat in categories" :key="cat.id">
              <a :href="`/search?categoryId=${cat.id}`" 
                 :class="{ active: selectedCategory === cat.id }">
                {{ cat.name }}
              </a>
            </li>
          </ul>
        </div>
      </aside>

      <!-- Books Grid -->
      <div class="flex-1">
        <div class="flex justify-between items-center mb-4">
          <p class="text-gray-500">
            共找到 <span class="font-bold">{{ pagination.total }}</span> 本图书
          </p>
        </div>

        <div v-if="books.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div v-for="book in books" :key="book.id" 
               class="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
            <figure class="px-4 pt-4">
              <div class="bg-gray-200 w-full h-40 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </figure>
            <div class="card-body p-4">
              <h3 class="card-title text-sm line-clamp-2">{{ book.title }}</h3>
              <p class="text-gray-500 text-xs">{{ book.author }}</p>
              <p v-if="book.categoryName" class="badge badge-outline badge-sm">{{ book.categoryName }}</p>
              <div class="flex justify-between items-center mt-2">
                <span class="text-primary font-bold">¥{{ book.price.toFixed(2) }}</span>
                <span class="text-xs text-gray-400">库存: {{ book.stockQuantity }}</span>
              </div>
              <div class="card-actions mt-2">
                <a :href="`/book/${book.id}`" class="btn btn-primary btn-sm w-full">查看详情</a>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="mt-4 text-gray-500">暂无符合条件的图书</p>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex justify-center mt-8">
          <div class="join">
            <a v-for="p in pagination.totalPages" :key="p"
               :href="`/search?page=${p}${selectedCategory ? '&categoryId=' + selectedCategory : ''}${keyword ? '&keyword=' + keyword : ''}`"
               class="join-item btn"
               :class="{ 'btn-active': p === pagination.page }">
              {{ p }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useData } from "vike-vue/useData";

interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  price: number;
  stockQuantity: number;
  categoryName?: string;
}

interface Category {
  id: number;
  name: string;
}

interface PageData {
  books: Book[];
  categories: Category[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  keyword?: string;
  selectedCategory?: number;
}

const data = useData<PageData>();
const books = data.books || [];
const categories = data.categories || [];
const pagination = data.pagination || { total: 0, page: 1, pageSize: 10, totalPages: 1 };
const keyword = data.keyword || "";
const selectedCategory = data.selectedCategory;

const searchType = ref("keyword");
const searchValue = ref(keyword);

function handleSearch() {
  const params = new URLSearchParams();
  if (searchValue.value) {
    if (searchType.value === "keyword") {
      params.set("keyword", searchValue.value);
    } else if (searchType.value === "author") {
      params.set("author", searchValue.value);
    } else if (searchType.value === "isbn") {
      params.set("isbn", searchValue.value);
    }
  }
  window.location.href = `/search?${params.toString()}`;
}
</script>
