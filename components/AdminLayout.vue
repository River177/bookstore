<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { userState, adminLogout, initUserStore } from '../lib/stores/userStore'

const collapsed = ref(false)
const currentPath = ref('')
const isReady = ref(false)

onMounted(() => {
  initUserStore()
  currentPath.value = window.location.pathname
  isReady.value = true
  
  // Redirect to login if not admin (after store is initialized)
  setTimeout(() => {
    if (!userState.admin) {
      window.location.href = '/login'
    }
  }, 100)
})

const menuItems = [
  { path: '/admin', label: '仪表盘', exact: true },
  { path: '/admin/users', label: '用户管理' },
  { path: '/admin/books', label: '图书管理' },
  { path: '/admin/orders', label: '订单管理' },
  { path: '/admin/operations', label: '操作日志' },
]

const isActive = (item: typeof menuItems[0]) => {
  if (item.exact) {
    return currentPath.value === item.path
  }
  return currentPath.value.startsWith(item.path)
}

const isAdminLoggedIn = computed(() => userState.admin !== null)
</script>

<template>
  <div class="flex fixed inset-0 top-[68px]">
    <!-- Sidebar - 固定在最左侧 -->
    <aside 
      :class="[
        'bg-base-100 shadow-lg transition-all duration-300 flex flex-col border-r border-base-200',
        collapsed ? 'w-16' : 'w-56'
      ]"
    >
      <!-- Logo -->
      <div class="p-4 border-b border-base-200">
        <a href="/admin" class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span v-if="!collapsed" class="font-bold text-lg">书店管理</span>
        </a>
      </div>

      <!-- Menu -->
      <nav class="flex-1 p-2 overflow-y-auto">
        <ul class="menu menu-compact">
          <li v-for="item in menuItems" :key="item.path">
            <a 
              :href="item.path" 
              :class="{ 'active bg-secondary text-secondary-content': isActive(item) }"
              class="flex items-center gap-3"
            >
              <span>{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Collapse Button -->
      <button 
        @click="collapsed = !collapsed"
        class="p-4 border-t border-base-200 hover:bg-base-200 transition-colors text-sm"
      >
        <span v-if="collapsed" class="flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7" />
          </svg>
        </span>
        <span v-else class="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7" />
          </svg>
          收起
        </span>
      </button>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden bg-base-200">
      <!-- Top Bar -->
      <header class="bg-base-100 shadow px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-semibold">
            <slot name="title">管理后台</slot>
          </h1>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Admin Info -->
          <div v-if="userState.admin" class="flex items-center gap-2">
            <span class="badge badge-secondary">管理员</span>
            <span class="font-medium">{{ userState.admin.fullName || userState.admin.username }}</span>
          </div>
        </div>
      </header>

      <!-- Not logged in alert -->
      <div v-if="isReady && !isAdminLoggedIn" class="m-4 alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>请先登录管理员账号才能访问此页面</span>
        <a href="/login" class="btn btn-sm">去登录</a>
      </div>

      <!-- Page Content -->
      <main v-if="isAdminLoggedIn" class="flex-1 overflow-auto p-4">
        <slot></slot>
      </main>
    </div>
  </div>
</template>
