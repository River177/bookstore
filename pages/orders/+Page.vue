<script setup lang="ts">
import { computed, onMounted, ref, inject } from 'vue'
import { useData } from 'vike-vue/useData'
import { userState } from '../../lib/stores/userStore'
import type { Data } from './+data'

const data = useData<Data>()
const orders = computed(() => data.orders || [])
const pagination = computed(() => data.pagination)
const isLoading = ref(false)

// 注入父组件提供的函数
const showToast = inject<(message: string, type: 'success' | 'error' | 'info') => void>('showToast')
const showConfirm = inject<(message: string, title?: string) => Promise<boolean>>('showConfirm')

// 检查是否需要客户端加载数据
onMounted(async () => {
  // 给 userStore 一点时间来初始化
  setTimeout(async () => {
    if (data.needsClientLoad || orders.value.length === 0) {
      await loadOrders();
    }
  }, 100);
});

const loadOrders = async () => {
  // 尝试从 localStorage 获取用户信息
  let userId: number | null = null;
  
  if (userState.user) {
    userId = userState.user.id;
  } else {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id;
      }
    } catch (e) {
      console.error('Failed to get user from localStorage:', e);
    }
  }
  
  if (!userId) {
    console.log('No user ID found, skipping order load');
    return;
  }
  
  isLoading.value = true;
  try {
    const page = new URLSearchParams(window.location.search).get('page') || '1';
    const response = await fetch(`/api/orders?userId=${userId}&page=${page}`);
    const result = await response.json();
    if (result.success) {
      Object.assign(data, {
        orders: result.data.orders,
        pagination: result.data.pagination,
        needsClientLoad: false
      });
    }
  } catch (error) {
    console.error('Failed to load orders:', error);
  } finally {
    isLoading.value = false;
  }
};

const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: 'badge-warning',
    paid: 'badge-info',
    processing: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-error',
    refunded: 'badge-error'
  }
  return map[status] || 'badge-ghost'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return map[status] || status
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const formatPrice = (price: number) => {
  return `¥${price.toFixed(2)}`
}

const confirmDelivery = async (orderId: number) => {
  console.log('confirmDelivery called with orderId:', orderId)
  console.log('userState.user:', userState.user)
  
  if (!userState.user) {
    showToast?.('请先登录', 'error')
    return
  }
  
  const confirmed = await showConfirm?.('确认已收到货物？', '确认收货')
  if (!confirmed) {
    console.log('User cancelled confirmation')
    return
  }
  
  console.log('Sending confirmation request...')
  
  try {
    const response = await fetch(`/api/orders/${orderId}/confirm`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userState.user.id }),
      duplex: 'half',
    } as RequestInit)
    
    console.log('Response status:', response.status)
    
    const result = await response.json()
    console.log('Response data:', result)
    
    if (result.success) {
      showToast?.('确认收货成功！', 'success')
      // Reload orders
      await loadOrders()
    } else {
      showToast?.(result.message || '确认收货失败', 'error')
    }
  } catch (error) {
    console.error('Failed to confirm delivery:', error)
    showToast?.('确认收货失败，请稍后再试', 'error')
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">我的订单</h1>

    <!-- 未登录提示 -->
    <div v-if="!userState.user" class="text-center py-16">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <p class="text-xl text-base-content/60 mb-4">请先登录查看订单</p>
      <a href="/login" class="btn btn-primary">去登录</a>
    </div>

    <!-- 加载中 -->
    <div v-else-if="isLoading" class="text-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4 text-base-content/60">加载中...</p>
    </div>

    <!-- 无订单 -->
    <div v-else-if="orders.length === 0" class="text-center py-16">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-xl text-base-content/60 mb-4">暂无订单</p>
      <a href="/search" class="btn btn-primary">去购物</a>
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex justify-between items-center border-b border-base-200 pb-4 mb-4">
            <div class="flex items-center gap-4">
              <span class="text-sm text-base-content/60">订单号: {{ order.id }}</span>
              <span class="text-sm text-base-content/60">{{ formatDate(order.orderDate) }}</span>
              <span class="badge" :class="getStatusBadge(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </div>
            <div class="text-lg font-bold text-primary">
              {{ formatPrice(order.totalAmount) }}
            </div>
          </div>

          <div class="space-y-3">
            <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4">
              <div class="flex-1">
                <a :href="`/book/${item.bookId}`" class="link link-hover font-medium">
                  {{ item.bookTitle }}
                </a>
                <div class="text-sm text-base-content/60">
                  {{ formatPrice(item.unitPrice) }} × {{ item.quantity }}
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium">
                  {{ formatPrice(item.unitPrice * item.quantity) }}
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-base-200 pt-4 mt-4">
            <div class="text-sm">
              <span class="text-base-content/60">收货地址：</span>
              <span>{{ order.shippingAddress }}</span>
            </div>
          </div>

          <div class="card-actions justify-end mt-4">
            <button v-if="order.status === 'pending'" class="btn btn-sm btn-primary">去支付</button>
            <button 
              v-if="order.status === 'shipped'" 
              class="btn btn-sm btn-success"
              @click="confirmDelivery(order.id)"
            >
              确认收货
            </button>
          </div>
        </div>
      </div>

      <div v-if="pagination && pagination.totalPages > 1" class="flex justify-center mt-8">
        <div class="join">
          <a 
            v-if="pagination.page > 1"
            :href="`/orders?page=${pagination.page - 1}`"
            class="join-item btn"
          >
            «
          </a>
          <button class="join-item btn">
            {{ pagination.page }} / {{ pagination.totalPages }}
          </button>
          <a 
            v-if="pagination.page < pagination.totalPages"
            :href="`/orders?page=${pagination.page + 1}`"
            class="join-item btn"
          >
            »
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
