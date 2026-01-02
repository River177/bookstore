<!-- pages/cart/+Page.vue - Shopping Cart Page -->
<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">购物车</h1>

    <!-- Not logged in -->
    <div v-if="!isLoggedIn" class="text-center py-16">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <h2 class="text-2xl font-bold mt-4 text-gray-500">请先登录</h2>
      <p class="text-gray-400 mt-2">登录后即可查看购物车</p>
      <a href="/login?redirect=/cart" class="btn btn-primary mt-6">去登录</a>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="text-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4 text-gray-500">加载中...</p>
    </div>

    <!-- Cart with items -->
    <div v-else-if="cartItems.length > 0" class="flex flex-col lg:flex-row gap-8">
      <!-- Cart Items -->
      <div class="flex-1">
        <div class="bg-base-100 rounded-box overflow-hidden">
          <table class="table">
            <thead>
              <tr>
                <th>商品</th>
                <th>单价</th>
                <th>数量</th>
                <th>小计</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cartItems" :key="item.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle w-12 h-12 bg-gray-200 flex items-center justify-center overflow-hidden">
                        <img v-if="item.book.coverImage" 
                             :src="item.book.coverImage" 
                             :alt="item.book.title"
                             class="w-full h-full object-cover"
                             referrerpolicy="no-referrer"
                        />
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <a :href="`/book/${item.bookId}`" class="font-bold hover:text-primary">{{ item.book.title }}</a>
                      <div class="text-sm text-gray-500">{{ item.book.author }}</div>
                    </div>
                  </div>
                </td>
                <td>¥{{ item.book.price.toFixed(2) }}</td>
                <td>
                  <div class="flex items-center gap-2">
                    <button @click="updateQuantity(item.id, item.quantity - 1)" 
                            class="btn btn-xs btn-outline"
                            :disabled="updating">
                      -
                    </button>
                    <span class="w-8 text-center">{{ item.quantity }}</span>
                    <button @click="updateQuantity(item.id, item.quantity + 1)" 
                            class="btn btn-xs btn-outline"
                            :disabled="updating">
                      +
                    </button>
                  </div>
                </td>
                <td class="font-bold text-primary">¥{{ (item.book.price * item.quantity).toFixed(2) }}</td>
                <td>
                  <button @click="removeItem(item.id)" 
                          class="btn btn-ghost btn-xs text-error"
                          :disabled="updating">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:w-80">
        <div class="bg-base-100 rounded-box p-6 sticky top-24">
          <h2 class="text-xl font-bold mb-4">订单摘要</h2>
          
          <div class="space-y-2 mb-4">
            <div class="flex justify-between">
              <span class="text-gray-500">商品数量</span>
              <span>{{ totalItems }} 件</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">商品金额</span>
              <span>¥{{ totalAmount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">运费</span>
              <span>{{ totalAmount >= 49 ? '免运费' : '¥6.00' }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="flex justify-between text-xl font-bold mb-6">
            <span>合计</span>
            <span class="text-primary">¥{{ finalAmount.toFixed(2) }}</span>
          </div>

          <a href="/checkout" class="btn btn-primary w-full">去结算</a>
        </div>
      </div>
    </div>

    <!-- Empty Cart -->
    <div v-else class="text-center py-16">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h2 class="text-2xl font-bold mt-4 text-gray-500">购物车是空的</h2>
      <p class="text-gray-400 mt-2">去看看有什么好书吧</p>
      <a href="/search" class="btn btn-primary mt-6">去逛逛</a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, inject } from "vue";
import { userState, getUserId, isLoggedIn as checkLoggedIn, fetchCartCount } from "../../lib/stores/userStore";

interface CartItem {
  id: number;
  bookId: number;
  quantity: number;
  book: {
    id: number;
    title: string;
    author: string;
    price: number;
    coverImage?: string;
  };
}

const cartItems = ref<CartItem[]>([]);
const loading = ref(true);
const updating = ref(false);

// Get showToast from parent layout
const showToast = inject<(message: string, type: "success" | "error" | "info") => void>("showToast");

// Check if logged in
const isLoggedIn = computed(() => checkLoggedIn());

const totalItems = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0));
const totalAmount = computed(() => cartItems.value.reduce((sum, item) => sum + item.book.price * item.quantity, 0));
const finalAmount = computed(() => totalAmount.value >= 49 ? totalAmount.value : totalAmount.value + 6);

onMounted(() => {
  // Wait a bit for user state to initialize
  setTimeout(() => {
    if (isLoggedIn.value) {
      fetchCart();
    } else {
      loading.value = false;
    }
  }, 100);
});

async function fetchCart() {
  const userId = getUserId();
  if (!userId) {
    loading.value = false;
    return;
  }

  try {
    const response = await fetch(`/api/cart?userId=${userId}`);
    const result = await response.json();
    if (result.success) {
      cartItems.value = result.data.items || [];
    }
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    showToast?.("获取购物车失败", "error");
  } finally {
    loading.value = false;
  }
}

async function updateQuantity(itemId: number, quantity: number) {
  if (quantity < 1) {
    removeItem(itemId);
    return;
  }

  const userId = getUserId();
  if (!userId) return;

  updating.value = true;

  try {
    const response = await fetch("/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, itemId, quantity }),
    });
    const result = await response.json();
    if (result.success) {
      cartItems.value = result.data.items || [];
      // Update global cart count
      await fetchCartCount();
    } else {
      showToast?.(result.message || "更新失败", "error");
    }
  } catch (error) {
    console.error("Failed to update cart:", error);
    showToast?.("更新失败", "error");
  } finally {
    updating.value = false;
  }
}

async function removeItem(itemId: number) {
  const userId = getUserId();
  if (!userId) return;

  updating.value = true;

  try {
    const response = await fetch(`/api/cart/remove?userId=${userId}&itemId=${itemId}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (result.success) {
      cartItems.value = result.data.items || [];
      // Update global cart count
      await fetchCartCount();
      showToast?.("已移除商品", "success");
    } else {
      showToast?.(result.message || "删除失败", "error");
    }
  } catch (error) {
    console.error("Failed to remove item:", error);
    showToast?.("删除失败", "error");
  } finally {
    updating.value = false;
  }
}
</script>
