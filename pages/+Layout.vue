<!-- pages/+Layout.vue - Main Layout -->
<template>
  <div class="min-h-screen bg-base-200">
    <!-- Toast Notification -->
    <div v-if="toast.show" class="toast toast-top toast-end z-[100]">
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
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
            <a href="/orders" class="hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              我的订单
            </a>
          </li>
          <!-- Admin menu item - visible only to admins -->
          <li v-if="userState.admin">
            <a href="/admin" class="text-secondary font-semibold hover:bg-secondary hover:text-secondary-content">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              管理后台
            </a>
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
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="footer footer-center p-10 bg-base-300 text-base-content">
      <aside>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p class="font-bold">网上书店 - Online Bookstore</p>
        <p>Copyright © 2024 - 专业的在线图书购物平台</p>
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
