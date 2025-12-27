<!-- pages/index/+Page.vue - Home Page -->
<template>
  <div>
    <!-- Hero Section -->
    <div class="hero min-h-[40vh] bg-base-100 rounded-box mb-8">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">欢迎来到网上书店</h1>
          <p class="py-6">探索万千书籍，发现您的下一本好书。我们提供丰富的图书分类，优惠的价格，便捷的购物体验。</p>
          <a href="/search" class="btn btn-primary">开始探索</a>
        </div>
      </div>
    </div>

    <!-- Categories Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6">图书分类</h2>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <a v-for="category in categories" :key="category.id" 
           :href="`/search?categoryId=${category.id}`"
           class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
          <div class="card-body items-center text-center p-4">
            <h3 class="card-title text-sm">{{ category.name }}</h3>
          </div>
        </a>
      </div>
    </section>

    <!-- Featured Books Section -->
    <section class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">畅销图书</h2>
        <a href="/search" class="btn btn-outline btn-sm">查看更多</a>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="book in featuredBooks" :key="book.id" 
             class="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
          <figure class="px-4 pt-4">
            <div class="bg-gray-200 w-full h-48 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </figure>
          <div class="card-body p-4">
            <h3 class="card-title text-sm line-clamp-2">{{ book.title }}</h3>
            <p class="text-gray-500 text-xs">{{ book.author }}</p>
            <div class="flex justify-between items-center mt-2">
              <span class="text-primary font-bold">¥{{ book.price.toFixed(2) }}</span>
              <span class="badge badge-ghost text-xs">已售 {{ book.salesCount }}</span>
            </div>
            <div class="card-actions mt-2">
              <a :href="`/book/${book.id}`" class="btn btn-primary btn-sm w-full">查看详情</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="grid md:grid-cols-3 gap-6 mb-12">
      <div class="card bg-base-100 shadow-md">
        <div class="card-body items-center text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <h3 class="card-title">快速配送</h3>
          <p class="text-gray-500">订单满49元免运费</p>
        </div>
      </div>
      <div class="card bg-base-100 shadow-md">
        <div class="card-body items-center text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 class="card-title">正品保证</h3>
          <p class="text-gray-500">100%正版图书</p>
        </div>
      </div>
      <div class="card bg-base-100 shadow-md">
        <div class="card-body items-center text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h3 class="card-title">安全支付</h3>
          <p class="text-gray-500">多种支付方式</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { useData } from "vike-vue/useData";

interface Category {
  id: number;
  name: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  salesCount: number;
}

interface PageData {
  categories: Category[];
  featuredBooks: Book[];
}

const data = useData<PageData>();
const categories = data.categories || [];
const featuredBooks = data.featuredBooks || [];
</script>
