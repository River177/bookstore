<!-- pages/book/@id/+Page.vue - Book Detail Page -->
<template>
  <div v-if="book">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Book Cover -->
      <div class="lg:w-1/3">
        <div class="bg-base-100 rounded-box p-8">
          <div class="bg-gray-200 w-full h-80 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Book Info -->
      <div class="lg:w-2/3">
        <div class="bg-base-100 rounded-box p-8">
          <div class="mb-4">
            <span v-if="book.categoryName" class="badge badge-primary">{{ book.categoryName }}</span>
          </div>
          
          <h1 class="text-3xl font-bold mb-2">{{ book.title }}</h1>
          <p class="text-xl text-gray-500 mb-4">作者: {{ book.author }}</p>
          
          <div class="divider"></div>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-gray-500 text-sm">ISBN</p>
              <p class="font-mono">{{ book.isbn }}</p>
            </div>
            <div>
              <p class="text-gray-500 text-sm">出版社</p>
              <p>{{ book.publisher || '暂无信息' }}</p>
            </div>
            <div>
              <p class="text-gray-500 text-sm">库存</p>
              <p :class="book.stockQuantity > 0 ? 'text-success' : 'text-error'">
                {{ book.stockQuantity > 0 ? `有货 (${book.stockQuantity}本)` : '暂时缺货' }}
              </p>
            </div>
            <div>
              <p class="text-gray-500 text-sm">销量</p>
              <p>{{ book.salesCount }} 本</p>
            </div>
          </div>

          <div class="flex items-center gap-4 mb-6">
            <span class="text-4xl font-bold text-primary">¥{{ book.price.toFixed(2) }}</span>
          </div>

          <div class="flex gap-4">
            <div class="form-control w-24">
              <input v-model.number="quantity" type="number" min="1" :max="book.stockQuantity" 
                     class="input input-bordered text-center" />
            </div>
            <button @click="addToCart" class="btn btn-primary flex-1" :disabled="book.stockQuantity === 0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              加入购物车
            </button>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-base-100 rounded-box p-8 mt-6">
          <h2 class="text-xl font-bold mb-4">图书简介</h2>
          <p class="text-gray-600 leading-relaxed">
            {{ book.description || '暂无简介' }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-12">
    <h1 class="text-2xl font-bold text-gray-500">图书未找到</h1>
    <a href="/search" class="btn btn-primary mt-4">返回搜索</a>
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
  publisher?: string;
  price: number;
  stockQuantity: number;
  description?: string;
  categoryName?: string;
  salesCount: number;
}

interface PageData {
  book: Book | null;
}

const data = useData<PageData>();
const book = data.book;
const quantity = ref(1);

async function addToCart() {
  if (!book) return;
  
  // For demo, using userId=1. In real app, get from auth
  const userId = 1;
  
  try {
    const response = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        bookId: book.id,
        quantity: quantity.value,
      }),
    });
    
    if (response.ok) {
      alert("已添加到购物车！");
    } else {
      const result = await response.json();
      alert(result.message || "添加失败");
    }
  } catch (error) {
    console.error(error);
    alert("网络错误");
  }
}
</script>
