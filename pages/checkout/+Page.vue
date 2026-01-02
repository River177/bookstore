<!-- pages/checkout/+Page.vue - Checkout Page -->
<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">结算</h1>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Checkout Form -->
      <div class="flex-1 space-y-6">
        <!-- Shipping Address -->
        <div class="bg-base-100 rounded-box p-6">
          <h2 class="text-xl font-bold mb-4">收货地址</h2>
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text w-24">收货人</span>
            </label>
            <input v-model="form.receiverName" type="text" class="input input-bordered w-full" required />
          </div>
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text w-24">手机号</span>
            </label>
            <input v-model="form.phone" type="tel" class="input input-bordered w-full" required />
          </div>
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text w-24">收货地址</span>
            </label>
            <textarea v-model="form.address" class="textarea textarea-bordered w-full" rows="3" required></textarea>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="bg-base-100 rounded-box p-6">
          <h2 class="text-xl font-bold mb-4">支付方式</h2>
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-4">
              <input type="radio" v-model="form.paymentMethod" value="credit" class="radio radio-primary" />
              <span class="label-text">信用卡</span>
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-4">
              <input type="radio" v-model="form.paymentMethod" value="debit" class="radio radio-primary" />
              <span class="label-text">借记卡</span>
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-4">
              <input type="radio" v-model="form.paymentMethod" value="alipay" class="radio radio-primary" />
              <span class="label-text">支付宝</span>
            </label>
          </div>

          <!-- Credit Card Form -->
          <div v-if="form.paymentMethod === 'credit' || form.paymentMethod === 'debit'" class="mt-4 space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text w-24">卡号</span>
              </label>
              <input v-model="form.cardNumber" type="text" placeholder="1234 5678 9012 3456" class="input input-bordered w-full" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text w-24">有效期</span>
                </label>
                <input v-model="form.cardExpiry" type="text" placeholder="MM/YY" class="input input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text w-24">CVV</span>
                </label>
                <input v-model="form.cardCvv" type="text" placeholder="123" class="input input-bordered w-full" />
              </div>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text w-24">持卡人姓名</span>
              </label>
              <input v-model="form.cardHolder" type="text" class="input input-bordered w-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:w-96">
        <div class="bg-base-100 rounded-box p-6 sticky top-24">
          <h2 class="text-xl font-bold mb-4">订单确认</h2>
          
          <div class="space-y-3 mb-4 max-h-60 overflow-y-auto">
            <div v-for="item in cartItems" :key="item.id" class="flex gap-3 items-center">
              <div class="avatar">
                <div class="w-12 h-16 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
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
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm line-clamp-1">{{ item.book.title }}</p>
                <p class="text-xs text-gray-500">x{{ item.quantity }}</p>
              </div>
              <span class="text-sm font-semibold">¥{{ (item.book.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="space-y-2 mb-4">
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
            <span>应付金额</span>
            <span class="text-primary">¥{{ finalAmount.toFixed(2) }}</span>
          </div>

          <button @click="submitOrder" class="btn btn-primary w-full" :disabled="loading || cartItems.length === 0">
            <span v-if="loading" class="loading loading-spinner"></span>
            {{ loading ? '提交中...' : '提交订单' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, inject } from "vue";
import { getUserId, isLoggedIn, fetchCartCount } from "../../lib/stores/userStore";

// 注入父组件提供的函数
const showToast = inject<(message: string, type: 'success' | 'error' | 'info') => void>('showToast')

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
const loading = ref(false);

const form = reactive({
  receiverName: "",
  phone: "",
  address: "",
  paymentMethod: "credit",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  cardHolder: "",
});

const totalAmount = computed(() => cartItems.value.reduce((sum, item) => sum + item.book.price * item.quantity, 0));
const finalAmount = computed(() => totalAmount.value >= 49 ? totalAmount.value : totalAmount.value + 6);

onMounted(() => {
  // Check if user is logged in
  setTimeout(() => {
    if (!isLoggedIn()) {
      showToast?.("请先登录", "error");
      window.location.href = "/login?redirect=/checkout";
      return;
    }
    fetchCart();
  }, 100);
});

async function fetchCart() {
  const userId = getUserId();
  if (!userId) {
    showToast?.("请先登录", "error");
    window.location.href = "/login?redirect=/checkout";
    return;
  }
  
  try {
    const response = await fetch(`/api/cart?userId=${userId}`);
    const result = await response.json();
    if (result.success) {
      cartItems.value = result.data.items;
    }
  } catch (error) {
    console.error("Failed to fetch cart:", error);
  }
}

async function submitOrder() {
  if (!form.receiverName || !form.phone || !form.address) {
    showToast?.("请填写完整的收货信息", "error");
    return;
  }

  const userId = getUserId();
  if (!userId) {
    showToast?.("请先登录", "error");
    window.location.href = "/login?redirect=/checkout";
    return;
  }

  loading.value = true;

  try {
    const shippingAddress = `${form.receiverName}, ${form.phone}, ${form.address}`;
    
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
        shippingAddress,
      }),
      duplex: "half",
    } as RequestInit);

    const result = await response.json();

    if (result.success) {
      // 模拟支付成功，自动更新订单状态为已付款
      const orderId = result.data.id;
      
      // 更新订单状态
      try {
        await fetch(`/api/orders/${orderId}/pay`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          duplex: 'half',
        } as RequestInit);
      } catch (err) {
        console.error('Failed to update order status:', err);
      }
      
      showToast?.("订单提交成功！订单号: " + orderId + "\n\n支付信息已确认，订单已付款！", "success");
      
      // 更新购物车计数
      await fetchCartCount();
      
      setTimeout(() => {
        window.location.href = "/orders";
      }, 1500);
    } else {
      showToast?.(result.message || "订单提交失败", "error");
    }
  } catch (error) {
    console.error("Failed to submit order:", error);
    showToast?.("网络错误，请重试", "error");
  } finally {
    loading.value = false;
  }
}
</script>
