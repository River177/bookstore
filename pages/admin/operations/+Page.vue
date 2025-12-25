<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import AdminLayout from '../../../components/AdminLayout.vue'

interface OperationLog {
  id: bigint
  adminId: number | null
  adminName: string | null
  module: string
  action: string
  targetType: string | null
  targetId: number | null
  content: string | null
  requestUrl: string | null
  requestMethod: string | null
  responseCode: number | null
  ipAddress: string | null
  executionTime: number | null
  status: number
  errorMessage: string | null
  createdAt: string
  admin: { username: string; fullName: string } | null
}

const logs = ref<OperationLog[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const totalPages = ref(0)
const moduleFilter = ref('')
const actionFilter = ref('')

const modules = ['用户', '图书', '订单', '系统', '认证']
const actions = ['登录', '登出', '创建', '更新', '删除', '查询']

const fetchLogs = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      pageSize: String(pageSize.value),
    })
    if (moduleFilter.value) params.set('module', moduleFilter.value)
    if (actionFilter.value) params.set('action', actionFilter.value)

    const res = await fetch(`/api/admin/logs?${params}`)
    const data = await res.json()
    logs.value = data.data || []
    total.value = data.total || 0
    totalPages.value = data.totalPages || 0
  } catch (error) {
    console.error('Failed to fetch logs:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const getStatusClass = (status: number) => {
  return status === 1 ? 'badge-success' : 'badge-error'
}

const getMethodClass = (method: string | null) => {
  const map: Record<string, string> = {
    GET: 'badge-info',
    POST: 'badge-success',
    PUT: 'badge-warning',
    DELETE: 'badge-error'
  }
  return map[method || ''] || 'badge-ghost'
}

onMounted(fetchLogs)
watch([page, moduleFilter, actionFilter], fetchLogs)

const resetFilters = () => {
  moduleFilter.value = ''
  actionFilter.value = ''
  page.value = 1
  fetchLogs()
}
</script>

<template>
  <AdminLayout>
    <template #title>操作日志</template>
    
    <div class="space-y-4">
      <div class="card bg-base-100 shadow">
        <div class="card-body py-4">
          <div class="flex flex-wrap gap-4 items-end">
            <div class="form-control">
              <label class="label"><span class="label-text">模块</span></label>
              <select v-model="moduleFilter" class="select select-bordered select-sm">
                <option value="">全部</option>
                <option v-for="m in modules" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">操作</span></label>
              <select v-model="actionFilter" class="select select-bordered select-sm">
                <option value="">全部</option>
                <option v-for="a in actions" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
            <button class="btn btn-ghost btn-sm" @click="resetFilters">重置</button>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>操作员</th>
                  <th>模块</th>
                  <th>操作</th>
                  <th>请求</th>
                  <th>状态</th>
                  <th>耗时</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="8" class="text-center py-8">
                    <span class="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
                <tr v-else-if="logs.length === 0">
                  <td colspan="8" class="text-center py-8 text-base-content/60">
                    暂无日志记录
                  </td>
                </tr>
                <tr v-for="log in logs" :key="String(log.id)">
                  <td class="text-sm whitespace-nowrap">{{ formatDate(log.createdAt) }}</td>
                  <td>
                    <div class="font-medium">{{ log.adminName || log.admin?.fullName || '-' }}</div>
                    <div v-if="log.admin" class="text-xs text-base-content/60">
                      @{{ log.admin.username }}
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-ghost badge-sm">{{ log.module }}</span>
                  </td>
                  <td>{{ log.action }}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span 
                        v-if="log.requestMethod"
                        class="badge badge-sm"
                        :class="getMethodClass(log.requestMethod)"
                      >
                        {{ log.requestMethod }}
                      </span>
                      <span class="text-xs text-base-content/60 max-w-[150px] truncate">
                        {{ log.requestUrl || '-' }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span 
                      class="badge badge-sm"
                      :class="getStatusClass(log.status)"
                    >
                      {{ log.status === 1 ? '成功' : '失败' }}
                    </span>
                    <span v-if="log.responseCode" class="text-xs ml-1">
                      ({{ log.responseCode }})
                    </span>
                  </td>
                  <td class="text-sm">
                    {{ log.executionTime ? `${log.executionTime}ms` : '-' }}
                  </td>
                  <td class="text-sm font-mono">{{ log.ipAddress || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

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

      <div class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>操作日志会记录管理员的所有重要操作，用于审计和追踪系统变更。</span>
      </div>
    </div>
  </AdminLayout>
</template>
