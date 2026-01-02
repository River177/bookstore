<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import AdminLayout from '../../../components/AdminLayout.vue'
import { getAdmin } from '../../../lib/stores/userStore'

interface User {
  id: number
  username: string
  email: string
  fullName: string
  phone: string | null
  address: string | null
  city: string | null
  status: number
  createdAt: string
  _count: { orders: number }
}

const users = ref<User[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)
const keyword = ref('')
const statusFilter = ref<number | undefined>(undefined)

const fetchUsers = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      pageSize: String(pageSize.value),
    })
    if (keyword.value) params.set('keyword', keyword.value)
    if (statusFilter.value !== undefined) params.set('status', String(statusFilter.value))

    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    users.value = data.data || []
    total.value = data.total || 0
    totalPages.value = data.totalPages || 0
  } catch (error) {
    console.error('Failed to fetch users:', error)
  } finally {
    loading.value = false
  }
}

const updateStatus = async (userId: number, status: number) => {
  try {
    const admin = getAdmin()
    await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status,
        adminId: admin?.id,
        adminName: admin?.fullName || admin?.username
      }),
      duplex: 'half',
    } as RequestInit)
    await fetchUsers()
  } catch (error) {
    console.error('Failed to update status:', error)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(fetchUsers)
watch([page, statusFilter], fetchUsers)

const handleSearch = () => {
  page.value = 1
  fetchUsers()
}
</script>

<template>
  <AdminLayout>
    <template #title>用户管理</template>
    
    <div class="space-y-4">
      <!-- Search & Filter -->
      <div class="card bg-base-100 shadow">
        <div class="card-body py-4">
          <div class="flex flex-wrap gap-4 items-end">
            <div class="form-control">
              <label class="label"><span class="label-text">搜索</span></label>
              <input 
                v-model="keyword"
                type="text" 
                placeholder="用户名/邮箱/姓名" 
                class="input input-bordered input-sm w-60"
                @keyup.enter="handleSearch"
              />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">状态</span></label>
              <select v-model="statusFilter" class="select select-bordered select-sm">
                <option :value="undefined">全部</option>
                <option :value="1">正常</option>
                <option :value="0">禁用</option>
              </select>
            </div>
            <button @click="handleSearch" class="btn btn-primary btn-sm">搜索</button>
            <button @click="keyword = ''; statusFilter = undefined; handleSearch()" class="btn btn-ghost btn-sm">重置</button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户名</th>
                  <th>邮箱</th>
                  <th>姓名</th>
                  <th>电话</th>
                  <th>订单数</th>
                  <th>状态</th>
                  <th>注册时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="9" class="text-center py-8">
                    <span class="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
                <tr v-else-if="users.length === 0">
                  <td colspan="9" class="text-center py-8 text-base-content/60">
                    暂无用户数据
                  </td>
                </tr>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td class="font-medium">{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.fullName }}</td>
                  <td>{{ user.phone || '-' }}</td>
                  <td>
                    <span class="badge badge-ghost">{{ user._count.orders }}</span>
                  </td>
                  <td>
                    <span 
                      class="badge badge-sm"
                      :class="user.status === 1 ? 'badge-success' : 'badge-error'"
                    >
                      {{ user.status === 1 ? '正常' : '禁用' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>
                    <div class="dropdown dropdown-end">
                      <label tabindex="0" class="btn btn-ghost btn-xs">操作 ▼</label>
                      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                        <li v-if="user.status === 1">
                          <a @click="updateStatus(user.id, 0)" class="text-error">禁用账户</a>
                        </li>
                        <li v-else>
                          <a @click="updateStatus(user.id, 1)" class="text-success">启用账户</a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex justify-between items-center mt-4">
            <div class="text-sm text-base-content/60">
              共 {{ total }} 条记录
            </div>
            <div class="join">
              <button 
                class="join-item btn btn-sm"
                :disabled="page <= 1"
                @click="page--"
              >«</button>
              <button class="join-item btn btn-sm">{{ page }} / {{ totalPages }}</button>
              <button 
                class="join-item btn btn-sm"
                :disabled="page >= totalPages"
                @click="page++"
              >»</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
