<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import AdminLayout from '../../../components/AdminLayout.vue'
import { getAdmin } from '../../../lib/stores/userStore'

interface OrderItem {
  id: number
  quantity: number
  unitPrice: number
  book: { title: string; coverImage: string | null }
}

interface Order {
  id: number
  userId: number
  totalAmount: number
  status: string
  shippingAddress: string
  orderDate: string
  updatedAt: string
  user: { username: string; fullName: string; email: string }
  items: OrderItem[]
}

const orders = ref<Order[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)
const statusFilter = ref('')
const selectedOrder = ref<Order | null>(null)
const showDetail = ref(false)
const showStatusModal = ref(false)
const statusToUpdate = ref('')
const orderIdToUpdate = ref(0)

const statusOptions = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待付款' },
  { value: 'paid', label: '已付款' },
  { value: 'shipped', label: '已发货' },
  { value: 'delivered', label: '已送达' },
  { value: 'cancelled', label: '已取消' }
]

const statusMap: Record<string, { label: string; class: string }> = {
  pending: { label: '待付款', class: 'badge-warning' },
  paid: { label: '已付款', class: 'badge-info' },
  shipped: { label: '已发货', class: 'badge-primary' },
  delivered: { label: '已送达', class: 'badge-success' },
  cancelled: { label: '已取消', class: 'badge-error' }
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      pageSize: String(pageSize.value),
    })
    if (statusFilter.value) params.set('status', statusFilter.value)

    const res = await fetch(`/api/admin/orders?${params}`)
    const data = await res.json()
    orders.value = data.data || []
    total.value = data.total || 0
    totalPages.value = data.totalPages || 0
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

const updateOrderStatus = async (orderId: number, status: string) => {
  try {
    const admin = getAdmin()
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status,
        adminId: admin?.id,
        adminName: admin?.fullName || admin?.username
      })
    })
    await fetchOrders()
    if (selectedOrder.value?.id === orderId) {
      selectedOrder.value = { ...selectedOrder.value, status }
    }
    showStatusModal.value = false
  } catch (error) {
    console.error('Failed to update order status:', error)
  }
}

const openStatusModal = (orderId: number, currentStatus: string) => {
  orderIdToUpdate.value = orderId
  statusToUpdate.value = currentStatus
  showStatusModal.value = true
}

const confirmStatusUpdate = async () => {
  if (!statusToUpdate.value) return
  await updateOrderStatus(orderIdToUpdate.value, statusToUpdate.value)
}

const openDetail = (order: Order) => {
  selectedOrder.value = order
  showDetail.value = true
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(fetchOrders)
watch([page, statusFilter], fetchOrders)
</script>

<template>
  <AdminLayout>
    <template #title>订单管理</template>
    
    <div class="space-y-4">
      <!-- Filter -->
      <div class="card bg-base-100 shadow">
        <div class="card-body py-4">
          <div class="flex flex-wrap gap-4 items-end">
            <div class="form-control">
              <label class="label"><span class="label-text">订单状态</span></label>
              <select v-model="statusFilter" class="select select-bordered select-sm">
                <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <button @click="statusFilter = ''" class="btn btn-ghost btn-sm">重置筛选</button>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>用户</th>
                  <th>商品</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>下单时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="7" class="text-center py-8">
                    <span class="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
                <tr v-else-if="orders.length === 0">
                  <td colspan="7" class="text-center py-8 text-base-content/60">
                    暂无订单数据
                  </td>
                </tr>
                <tr v-for="order in orders" :key="order.id">
                  <td class="font-mono">#{{ order.id }}</td>
                  <td>
                    <div>
                      <div class="font-medium">{{ order.user.fullName }}</div>
                      <div class="text-sm text-base-content/60">{{ order.user.email }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <div v-if="order.items[0]?.book?.coverImage" class="avatar">
                        <div class="w-10 h-12 rounded">
                          <img :src="order.items[0].book.coverImage" />
                        </div>
                      </div>
                      <div>
                        <div class="max-w-[150px] truncate">{{ order.items[0]?.book?.title }}</div>
                        <div v-if="order.items.length > 1" class="text-sm text-base-content/60">
                          等 {{ order.items.length }} 件商品
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="font-semibold text-primary">{{ formatCurrency(order.totalAmount) }}</td>
                  <td>
                    <span 
                      class="badge"
                      :class="statusMap[order.status]?.class || 'badge-ghost'"
                    >
                      {{ statusMap[order.status]?.label || order.status }}
                    </span>
                  </td>
                  <td class="text-sm">{{ formatDate(order.orderDate) }}</td>
                  <td>
                    <div class="flex gap-1">
                      <button @click="openDetail(order)" class="btn btn-ghost btn-xs">详情</button>
                      <button @click="openStatusModal(order.id, order.status)" class="btn btn-ghost btn-xs">状态 ▼</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex justify-between items-center mt-4">
            <div class="text-sm text-base-content/60">共 {{ total }} 条记录</div>
            <div class="join">
              <button class="join-item btn btn-sm" :disabled="page <= 1" @click="page--">«</button>
              <button class="join-item btn btn-sm">{{ page }} / {{ totalPages }}</button>
              <button class="join-item btn btn-sm" :disabled="page >= totalPages" @click="page++">»</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <dialog :class="['modal', { 'modal-open': showDetail }]">
      <div class="modal-box max-w-2xl" v-if="selectedOrder">
        <h3 class="font-bold text-lg mb-4">订单详情 #{{ selectedOrder.id }}</h3>
        
        <div class="space-y-4">
          <!-- Order Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-base-content/60">下单时间</div>
              <div>{{ formatDate(selectedOrder.orderDate) }}</div>
            </div>
            <div>
              <div class="text-sm text-base-content/60">订单状态</div>
              <span 
                class="badge"
                :class="statusMap[selectedOrder.status]?.class"
              >
                {{ statusMap[selectedOrder.status]?.label }}
              </span>
            </div>
          </div>

          <!-- User Info -->
          <div class="divider">用户信息</div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-base-content/60">用户名</div>
              <div>{{ selectedOrder.user.username }}</div>
            </div>
            <div>
              <div class="text-sm text-base-content/60">姓名</div>
              <div>{{ selectedOrder.user.fullName }}</div>
            </div>
            <div class="col-span-2">
              <div class="text-sm text-base-content/60">邮箱</div>
              <div>{{ selectedOrder.user.email }}</div>
            </div>
            <div class="col-span-2">
              <div class="text-sm text-base-content/60">收货地址</div>
              <div>{{ selectedOrder.shippingAddress }}</div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="divider">商品列表</div>
          <table class="table table-sm">
            <thead>
              <tr>
                <th>商品</th>
                <th>单价</th>
                <th>数量</th>
                <th>小计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedOrder.items" :key="item.id">
                <td>{{ item.book.title }}</td>
                <td>{{ formatCurrency(item.unitPrice) }}</td>
                <td>{{ item.quantity }}</td>
                <td class="font-semibold">{{ formatCurrency(item.unitPrice * item.quantity) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right font-bold">订单总额：</td>
                <td class="font-bold text-primary">{{ formatCurrency(selectedOrder.totalAmount) }}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Quick Actions -->
          <div class="flex gap-2 mt-4">
            <button 
              v-if="selectedOrder.status === 'pending'"
              @click="updateOrderStatus(selectedOrder.id, 'paid')"
              class="btn btn-info btn-sm"
            >
              标记已付款
            </button>
            <button 
              v-if="selectedOrder.status === 'paid'"
              @click="updateOrderStatus(selectedOrder.id, 'shipped')"
              class="btn btn-primary btn-sm"
            >
              标记已发货
            </button>
            <button 
              v-if="selectedOrder.status === 'shipped'"
              @click="updateOrderStatus(selectedOrder.id, 'delivered')"
              class="btn btn-success btn-sm"
            >
              标记已送达
            </button>
            <button 
              v-if="['pending', 'paid'].includes(selectedOrder.status)"
              @click="updateOrderStatus(selectedOrder.id, 'cancelled')"
              class="btn btn-error btn-sm"
            >
              取消订单
            </button>
          </div>
        </div>

        <div class="modal-action">
          <button @click="showDetail = false" class="btn">关闭</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showDetail = false">close</button>
      </form>
    </dialog>

    <!-- Status Update Modal -->
    <dialog :class="['modal', { 'modal-open': showStatusModal }]">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">更新订单状态</h3>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">选择新状态</span>
          </label>
          <select v-model="statusToUpdate" class="select select-bordered">
            <option v-for="opt in statusOptions.slice(1)" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="modal-action">
          <button @click="showStatusModal = false" class="btn btn-ghost">取消</button>
          <button @click="confirmStatusUpdate" class="btn btn-primary">确认</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showStatusModal = false">close</button>
      </form>
    </dialog>
  </AdminLayout>
</template>
