<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useData } from 'vike-vue/useData'

const collapsed = ref(false)
const currentPath = ref('')

// Admin user from session (stored in localStorage for simplicity)
const adminUser = ref<{ id: number; username: string; fullName: string } | null>(null)

onMounted(() => {
  currentPath.value = window.location.pathname
  const stored = localStorage.getItem('adminUser')
  if (stored) {
    adminUser.value = JSON.parse(stored)
  }
})

const menuItems = [
  { path: '/admin', icon: '📊', label: '仪表盘', exact: true },
  { path: '/admin/users', icon: '👥', label: '用户管理' },
  { path: '/admin/books', icon: '📚', label: '图书管理' },
  { path: '/admin/orders', icon: '📦', label: '订单管理' },
  { path: '/admin/logs', icon: '📝', label: '操作日志' },
]

const isActive = (item: typeof menuItems[0]) => {
  if (item.exact) {
    return currentPath.value === item.path
  }
  return currentPath.value.startsWith(item.path)
}

const logout = () => {
  localStorage.removeItem('adminUser')
  localStorage.removeItem('adminToken')
  window.location.href = '/admin/login'
}
</script>

<template>
  <div class="min-h-screen bg-base-200 flex">
    <!-- Sidebar -->
    <aside 
      :class="[
        'bg-base-100 shadow-lg transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      ]"
    >
      <!-- Logo -->
      <div class="p-4 border-b border-base-200">
        <a href="/admin" class="flex items-center gap-2">
          <span class="text-2xl">📖</span>
          <span v-if="!collapsed" class="font-bold text-lg">书店管理</span>
        </a>
      </div>

      <!-- Menu -->
      <nav class="flex-1 p-2">
        <ul class="menu">
          <li v-for="item in menuItems" :key="item.path">
            <a 
              :href="item.path" 
              :class="{ 'active': isActive(item) }"
              class="flex items-center gap-3"
            >
              <span class="text-lg">{{ item.icon }}</span>
              <span v-if="!collapsed">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Collapse Button -->
      <button 
        @click="collapsed = !collapsed"
        class="p-4 border-t border-base-200 hover:bg-base-200 transition-colors"
      >
        <span v-if="collapsed">→</span>
        <span v-else>← 收起</span>
      </button>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Top Bar -->
      <header class="bg-base-100 shadow px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-semibold">
            <slot name="title">管理后台</slot>
          </h1>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Back to Store -->
          <a href="/" class="btn btn-ghost btn-sm">
            🏠 返回商城
          </a>
          
          <!-- Admin Dropdown -->
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost gap-2">
              <div class="avatar placeholder">
                <div class="bg-primary text-primary-content rounded-full w-8">
                  <span>{{ adminUser?.fullName?.[0] || 'A' }}</span>
                </div>
              </div>
              <span class="hidden sm:inline">{{ adminUser?.fullName || '管理员' }}</span>
            </label>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a href="/admin/profile">👤 个人资料</a></li>
              <li><hr class="my-1"></li>
              <li><a @click="logout" class="text-error">🚪 退出登录</a></li>
            </ul>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <slot></slot>
      </main>

      <!-- Footer -->
      <footer class="bg-base-100 p-4 text-center text-sm text-base-content/60">
        © 2025 网上书店管理系统 - 数据库课程设计项目
      </footer>
    </div>
  </div>
</template>
