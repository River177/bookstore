<script setup lang="ts">
import { useData } from 'vike-vue/useData'
import AdminLayout from '../../components/AdminLayout.vue'
import type { Data } from './+data'

const { stats } = useData<Data>()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const orderStatusMap: Record<string, { label: string; class: string }> = {
  pending: { label: '待付款', class: 'badge-warning' },
  paid: { label: '已付款', class: 'badge-info' },
  shipped: { label: '已发货', class: 'badge-primary' },
  delivered: { label: '已送达', class: 'badge-success' },
  cancelled: { label: '已取消', class: 'badge-error' }
}
</script>

<template>
  <AdminLayout>
    <template #title>仪表盘</template>
    
    <div class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Users -->
        <div class="stat bg-base-100 rounded-box shadow">
          <div class="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="stat-title">注册用户</div>
          <div class="stat-value text-primary">{{ stats.totalUsers }}</div>
          <div class="stat-desc">累计注册用户数</div>
        </div>

        <!-- Total Books -->
        <div class="stat bg-base-100 rounded-box shadow">
          <div class="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div class="stat-title">图书数量</div>
          <div class="stat-value text-secondary">{{ stats.totalBooks }}</div>
          <div class="stat-desc">
            <span v-if="stats.lowStockBooks > 0" class="text-warning">
              {{ stats.lowStockBooks }} 本库存不足
            </span>
            <span v-else>库存充足</span>
          </div>
        </div>

        <!-- Total Orders -->
        <div class="stat bg-base-100 rounded-box shadow">
          <div class="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div class="stat-title">总订单数</div>
          <div class="stat-value text-accent">{{ stats.totalOrders }}</div>
          <div class="stat-desc">
            今日新增 <span class="text-success">+{{ stats.todayOrders }}</span>
          </div>
        </div>

        <!-- Monthly Revenue -->
        <div class="stat bg-base-100 rounded-box shadow">
          <div class="stat-figure text-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-title">本月销售额</div>
          <div class="stat-value text-success text-2xl">{{ formatCurrency(stats.monthlyRevenue) }}</div>
          <div class="stat-desc">
            待处理订单 <span class="text-warning">{{ stats.pendingOrders }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Recent Orders -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Actions -->
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">快捷操作</h2>
            <div class="grid grid-cols-2 gap-3">
              <a href="/admin/books" class="btn btn-outline btn-primary">
                📚 图书管理
              </a>
              <a href="/admin/orders" class="btn btn-outline btn-secondary">
                📦 订单管理
              </a>
              <a href="/admin/users" class="btn btn-outline btn-accent">
                👥 用户管理
              </a>
              <a href="/admin/logs" class="btn btn-outline">
                📝 操作日志
              </a>
            </div>

            <!-- Alerts -->
            <div class="divider">提醒事项</div>
            <div class="space-y-2">
              <div v-if="stats.pendingOrders > 0" class="alert alert-warning">
                <span>⏳ 有 {{ stats.pendingOrders }} 个订单待处理</span>
              </div>
              <div v-if="stats.lowStockBooks > 0" class="alert alert-error">
                <span>📦 有 {{ stats.lowStockBooks }} 本图书库存不足</span>
              </div>
              <div v-if="stats.pendingOrders === 0 && stats.lowStockBooks === 0" class="alert alert-success">
                <span>✅ 一切正常，没有待处理事项</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="card bg-base-100 shadow lg:col-span-2">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h2 class="card-title">最近订单</h2>
              <a href="/admin/orders" class="btn btn-sm btn-ghost">查看全部 →</a>
            </div>
            
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>用户</th>
                    <th>商品</th>
                    <th>金额</th>
                    <th>状态</th>
                    <th>时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in stats.recentOrders" :key="order.id">
                    <td class="font-mono text-sm">#{{ order.id }}</td>
                    <td>{{ order.user?.fullName || order.user?.username }}</td>
                    <td class="max-w-[150px] truncate">
                      {{ order.items?.[0]?.book?.title }}
                      <span v-if="order.items?.length > 1" class="text-base-content/60">
                        等{{ order.items.length }}件
                      </span>
                    </td>
                    <td class="font-semibold">{{ formatCurrency(Number(order.totalAmount)) }}</td>
                    <td>
                      <span 
                        class="badge badge-sm"
                        :class="orderStatusMap[order.status]?.class || 'badge-ghost'"
                      >
                        {{ orderStatusMap[order.status]?.label || order.status }}
                      </span>
                    </td>
                    <td class="text-sm text-base-content/60">
                      {{ formatDate(order.orderDate) }}
                    </td>
                  </tr>
                  <tr v-if="!stats.recentOrders?.length">
                    <td colspan="6" class="text-center text-base-content/60 py-8">
                      暂无订单记录
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
