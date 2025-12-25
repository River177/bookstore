<!-- pages/login/+Page.vue - Unified Login Page -->
<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <!-- Login Type Tabs -->
        <div class="tabs tabs-boxed justify-center mb-4">
          <a 
            class="tab" 
            :class="{ 'tab-active': loginType === 'user' }"
            @click="loginType = 'user'"
          >
            用户登录
          </a>
          <a 
            class="tab" 
            :class="{ 'tab-active': loginType === 'admin' }"
            @click="loginType = 'admin'"
          >
            管理员登录
          </a>
        </div>

        <h1 class="card-title text-2xl justify-center mb-4">
          {{ loginType === 'user' ? '用户登录' : '管理员登录' }}
        </h1>
        
        <div v-if="errorMessage" class="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">{{ loginType === 'user' ? '用户名' : '管理员账号' }}</span>
            </label>
            <input v-model="username" type="text" 
                   :placeholder="loginType === 'user' ? '请输入用户名' : '请输入管理员账号'" 
                   class="input input-bordered" required />
          </div>

          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text">密码</span>
            </label>
            <input v-model="password" type="password" placeholder="请输入密码" 
                   class="input input-bordered" required />
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner"></span>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- User specific options -->
        <template v-if="loginType === 'user'">
          <div class="divider">或</div>
          <p class="text-center text-gray-500">
            还没有账号? 
            <a href="/register" class="link link-primary">立即注册</a>
          </p>
        </template>

        <!-- Demo accounts -->
        <div class="divider">测试账号</div>
        <div class="text-center text-sm text-base-content/60">
          <template v-if="loginType === 'user'">
            <p>用户名: <span class="font-mono bg-base-200 px-2 py-0.5 rounded">testuser</span></p>
            <p>密码: <span class="font-mono bg-base-200 px-2 py-0.5 rounded">123456</span></p>
          </template>
          <template v-else>
            <p>管理员: <span class="font-mono bg-base-200 px-2 py-0.5 rounded">admin</span></p>
            <p>密码: <span class="font-mono bg-base-200 px-2 py-0.5 rounded">admin123</span></p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject } from "vue";
import { login, adminLogin } from "../../lib/stores/userStore";

const loginType = ref<"user" | "admin">("user");
const username = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

// Get showToast from parent layout
const showToast = inject<(message: string, type: "success" | "error" | "info") => void>("showToast");

async function handleLogin() {
  loading.value = true;
  errorMessage.value = "";

  try {
    let result;
    
    if (loginType.value === "user") {
      result = await login(username.value, password.value);
    } else {
      result = await adminLogin(username.value, password.value);
    }

    if (result.success) {
      showToast?.("登录成功", "success");
      // Redirect based on login type - use timeout to ensure toast is shown
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      setTimeout(() => {
        if (redirect) {
          window.location.href = redirect;
        } else if (loginType.value === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }, 500);
    } else {
      errorMessage.value = result.message || "登录失败";
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = "网络错误，请重试";
  } finally {
    loading.value = false;
  }
}
</script>
