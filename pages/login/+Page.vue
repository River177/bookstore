<!-- pages/login/+Page.vue - Login Page -->
<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="card-title text-2xl justify-center mb-4">用户登录</h1>
        
        <div v-if="errorMessage" class="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">用户名</span>
            </label>
            <input v-model="username" type="text" placeholder="请输入用户名" 
                   class="input input-bordered" required />
          </div>

          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text">密码</span>
            </label>
            <input v-model="password" type="password" placeholder="请输入密码" 
                   class="input input-bordered" required />
            <label class="label">
              <a href="#" class="label-text-alt link link-hover">忘记密码?</a>
            </label>
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner"></span>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div class="divider">或</div>

        <p class="text-center text-gray-500">
          还没有账号? 
          <a href="/register" class="link link-primary">立即注册</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const username = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

async function handleLogin() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Store user info and redirect
      localStorage.setItem("user", JSON.stringify(result.data));
      window.location.href = "/";
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
