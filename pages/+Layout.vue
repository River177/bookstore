<!-- pages/+Layout.vue - Main Layout -->
<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <!-- Toast Notification -->
    <div v-if="toast.show" class="toast toast-center z-[100] top-20">
      <div :class="['alert', toast.type === 'success' ? 'alert-success' : toast.type === 'error' ? 'alert-error' : 'alert-info']">
        <span>{{ toast.message }}</span>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <div v-if="confirmDialog.show" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">{{ confirmDialog.title }}</h3>
        <p class="py-4">{{ confirmDialog.message }}</p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="handleConfirmCancel">取消</button>
          <button class="btn btn-primary" @click="handleConfirmOk">确认</button>
        </div>
      </div>
    </div>

    <!-- Navbar -->
    <div class="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div class="navbar-start">
        <div class="dropdown">
          <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><a href="/">首页</a></li>
            <li><a href="/search">搜索图书</a></li>
            <li v-if="userState.user"><a href="/orders">我的订单</a></li>
            <li v-if="userState.admin"><a href="/admin" class="text-secondary">管理后台</a></li>
          </ul>
        </div>
        <a href="/" class="btn btn-ghost text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-2" viewBox="0 0 48 48" fill="none">
            <path d="M8 10C8 8.89543 8.89543 8 10 8H20C21.1046 8 22 8.89543 22 10V38C22 39.1046 21.1046 40 20 40H10C8.89543 40 8 39.1046 8 38V10Z" fill="currentColor" opacity="0.3" />
            <path d="M26 10C26 8.89543 26.8954 8 28 8H38C39.1046 8 40 8.89543 40 10V38C40 39.1046 39.1046 40 38 40H28C26.8954 40 26 39.1046 26 38V10Z" fill="currentColor" opacity="0.5" />
            <path d="M24 6L26 8L24 10L22 8L24 6Z" fill="currentColor" />
            <rect x="11" y="14" width="8" height="2" rx="1" fill="white" opacity="0.6" />
            <rect x="11" y="19" width="6" height="2" rx="1" fill="white" opacity="0.6" />
            <rect x="11" y="24" width="7" height="2" rx="1" fill="white" opacity="0.6" />
            <rect x="29" y="14" width="8" height="2" rx="1" fill="white" opacity="0.6" />
            <rect x="29" y="19" width="6" height="2" rx="1" fill="white" opacity="0.6" />
            <rect x="29" y="24" width="7" height="2" rx="1" fill="white" opacity="0.6" />
          </svg>
          网上书店
        </a>
      </div>
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          <li><a href="/" class="hover:text-primary">首页</a></li>
          <li><a href="/search" class="hover:text-primary">搜索图书</a></li>
          <!-- User orders menu item - visible only to logged-in users -->
          <li v-if="userState.user">
            <a href="/orders" class="hover:text-primary">我的订单</a>
          </li>
          <!-- Admin menu item - visible only to admins -->
          <li v-if="userState.admin">
            <a href="/admin" class="text-secondary font-semibold hover:bg-secondary hover:text-secondary-content">管理后台</a>
          </li>
        </ul>
      </div>
      <div class="navbar-end gap-2">
        <!-- Search -->
        <form action="/search" method="get" class="hidden sm:flex">
          <div class="form-control">
            <input type="text" name="keyword" placeholder="搜索图书..." class="input input-bordered w-24 md:w-auto" />
          </div>
        </form>
        
        <!-- Cart -->
        <a href="/cart" class="btn btn-ghost btn-circle">
          <div class="indicator">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span v-if="userState.cart.itemCount > 0" class="badge badge-sm badge-primary indicator-item">{{ userState.cart.itemCount }}</span>
          </div>
        </a>

        <!-- User Menu -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
            <!-- Show admin badge if admin is logged in -->
            <div v-if="userState.admin" class="w-8 h-8 rounded-full bg-secondary text-secondary-content flex items-center justify-center text-xs font-bold">
              管
            </div>
            <div v-else-if="userState.user" class="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
              {{ userState.user.username.charAt(0).toUpperCase() }}
            </div>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <!-- Admin section -->
            <template v-if="userState.admin">
              <li class="menu-title">
                <span class="flex items-center gap-2">
                  <span class="badge badge-secondary badge-sm">管理员</span>
                  {{ userState.admin.username }}
                </span>
              </li>
              <li><a href="/admin">管理后台</a></li>
              <li><a href="/admin/books">图书管理</a></li>
              <li><a href="/admin/orders">订单管理</a></li>
              <li><a href="/admin/users">用户管理</a></li>
              <div class="divider my-1"></div>
              <li><a @click="handleAdminLogout" class="text-error">退出管理</a></li>
            </template>
            
            <!-- User section -->
            <template v-if="userState.user">
              <li v-if="userState.admin" class="menu-title"><span>用户账户</span></li>
              <li v-else class="menu-title"><span>{{ userState.user.username }}</span></li>
              <li><a href="/orders">我的订单</a></li>
              <li><a href="/cart">购物车</a></li>
              <li><a @click="handleUserLogout">退出用户</a></li>
            </template>
            
            <!-- Not logged in -->
            <template v-if="!userState.user && !userState.admin">
              <li><a href="/login">登录</a></li>
              <li><a href="/register">注册</a></li>
            </template>
          </ul>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 flex-grow">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="footer footer-center p-10 bg-base-300 text-base-content">
      <aside>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" viewBox="0 0 48 48" fill="none">
          <path d="M8 10C8 8.89543 8.89543 8 10 8H20C21.1046 8 22 8.89543 22 10V38C22 39.1046 21.1046 40 20 40H10C8.89543 40 8 39.1046 8 38V10Z" fill="currentColor" opacity="0.3" />
          <path d="M26 10C26 8.89543 26.8954 8 28 8H38C39.1046 8 40 8.89543 40 10V38C40 39.1046 39.1046 40 38 40H28C26.8954 40 26 39.1046 26 38V10Z" fill="currentColor" opacity="0.5" />
          <path d="M24 6L26 8L24 10L22 8L24 6Z" fill="currentColor" />
          <rect x="11" y="14" width="8" height="2" rx="1" fill="currentColor" opacity="0.6" />
          <rect x="11" y="19" width="6" height="2" rx="1" fill="currentColor" opacity="0.6" />
          <rect x="11" y="24" width="7" height="2" rx="1" fill="currentColor" opacity="0.6" />
          <rect x="29" y="14" width="8" height="2" rx="1" fill="currentColor" opacity="0.6" />
          <rect x="29" y="19" width="6" height="2" rx="1" fill="currentColor" opacity="0.6" />
          <rect x="29" y="24" width="7" height="2" rx="1" fill="currentColor" opacity="0.6" />
        </svg>
        <p class="font-bold">网上书店 - Online Bookstore</p>
        <p>Copyright © 2026 - 专业的在线图书购物平台</p>
      </aside>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, provide } from "vue";
import { userState, initUserStore, logout, adminLogout } from "../lib/stores/userStore";

// Toast notification
const toast = reactive({
  show: false,
  message: "",
  type: "info" as "success" | "error" | "info",
});

function showToast(message: string, type: "success" | "error" | "info" = "info") {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3000);
}

// Confirm dialog
const confirmDialog = reactive({
  show: false,
  title: "确认",
  message: "",
  resolve: null as ((value: boolean) => void) | null,
});

function showConfirm(message: string, title: string = "确认"): Promise<boolean> {
  return new Promise((resolve) => {
    confirmDialog.title = title;
    confirmDialog.message = message;
    confirmDialog.resolve = resolve;
    confirmDialog.show = true;
  });
}

function handleConfirmOk() {
  confirmDialog.show = false;
  if (confirmDialog.resolve) {
    confirmDialog.resolve(true);
    confirmDialog.resolve = null;
  }
}

function handleConfirmCancel() {
  confirmDialog.show = false;
  if (confirmDialog.resolve) {
    confirmDialog.resolve(false);
    confirmDialog.resolve = null;
  }
}

// Provide functions to child components
provide("showToast", showToast);
provide("showConfirm", showConfirm);

// Initialize user store on mount
onMounted(() => {
  initUserStore();
});

function handleUserLogout() {
  logout();
  showToast("已退出用户登录", "success");
  window.location.href = "/";
}

function handleAdminLogout() {
  adminLogout();
  showToast("已退出管理员", "success");
  window.location.href = "/";
}
</script>
