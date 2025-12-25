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
              <span class="label-text">收货人</span>
            </label>
            <input v-model="form.receiverName" type="text" class="input input-bordered" required />
          </div>
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">手机号</span>
            </label>
            <input v-model="form.phone" type="tel" class="input input-bordered" required />
          </div>
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">收货地址</span>
            </label>
            <textarea v-model="form.address" class="textarea textarea-bordered" rows="3" required></textarea>
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
                <span class="label-text">卡号</span>
              </label>
              <input v-model="form.cardNumber" type="text" placeholder="1234 5678 9012 3456" class="input input-bordered" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">有效期</span>
                </label>
                <input v-model="form.cardExpiry" type="text" placeholder="MM/YY" class="input input-bordered" />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">CVV</span>
                </label>
                <input v-model="form.cardCvv" type="text" placeholder="123" class="input input-bordered" />
              </div>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">持卡人姓名</span>
              </label>
              <input v-model="form.cardHolder" type="text" class="input input-bordered" />
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:w-96">
        <div class="bg-base-100 rounded-box p-6 sticky top-24">
          <h2 class="text-xl font-bold mb-4">订单确认</h2>
          
          <div class="space-y-3 mb-4 max-h-60 overflow-y-auto">
            <div v-for="item in cartItems" :key="item.id" class="flex justify-between items-center">
              <div class="flex-1">
                <p class="font-medium text-sm line-clamp-1">{{ item.book.title }}</p>
                <p class="text-xs text-gray-500">x{{ item.quantity }}</p>
              </div>
              <span class="text-sm">¥{{ (item.book.price * item.quantity).toFixed(2) }}</span>
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
import { ref, reactive, computed, onMounted } from "vue";

interface CartItem {
  id: number;
  bookId: number;
  quantity: number;
  book: {
    id: number;
    title: string;
    author: string;
    price: number;
  };
}

const cartItems = ref<CartItem[]>([]);
const loading = ref(false);
const userId = ref(1); // Demo user ID

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
  fetchCart();
});

async function fetchCart() {
  try {
    const response = await fetch(`/api/cart?userId=${userId.value}`);
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
    alert("请填写完整的收货信息");
    return;
  }

  loading.value = true;

  try {
    const shippingAddress = `${form.receiverName}, ${form.phone}, ${form.address}`;
    
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId.value,
        shippingAddress,
      }),
    });

    const result = await response.json();

    if (result.success) {
      alert("订单提交成功！订单号: " + result.data.id);
      window.location.href = "/";
    } else {
      alert(result.message || "订单提交失败");
    }
  } catch (error) {
    console.error("Failed to submit order:", error);
    alert("网络错误，请重试");
  } finally {
    loading.value = false;
  }
}
</script>
