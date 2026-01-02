<!-- pages/register/+Page.vue - Registration Page -->
<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="card-title text-2xl justify-center mb-4">注册账号</h1>
        
        <div v-if="errorMessage" class="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleRegister">
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text w-24">用户名 *</span>
            </label>
            <input v-model="form.username" type="text" placeholder="请输入用户名" 
                   class="input input-bordered w-full" required minlength="3" maxlength="50" />
          </div>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text w-24">邮箱 *</span>
            </label>
            <input v-model="form.email" type="email" placeholder="请输入邮箱" 
                   class="input input-bordered w-full" required />
          </div>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text w-24">姓名 *</span>
            </label>
            <input v-model="form.fullName" type="text" placeholder="请输入真实姓名" 
                   class="input input-bordered w-full" required />
          </div>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text w-24">手机号</span>
            </label>
            <input v-model="form.phone" type="tel" placeholder="请输入手机号" 
                   class="input input-bordered w-full" />
          </div>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text w-24">密码 *</span>
            </label>
            <input v-model="form.password" type="password" placeholder="请输入密码 (至少6位)" 
                   class="input input-bordered w-full" required minlength="6" />
          </div>

          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text w-24">确认密码 *</span>
            </label>
            <input v-model="confirmPassword" type="password" placeholder="请再次输入密码" 
                   class="input input-bordered w-full" required />
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner"></span>
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>

        <div class="divider">或</div>

        <p class="text-center text-gray-500">
          已有账号? 
          <a href="/login" class="link link-primary">立即登录</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";

const form = reactive({
  username: "",
  email: "",
  fullName: "",
  phone: "",
  password: "",
});
const confirmPassword = ref("");
const loading = ref(false);
const errorMessage = ref("");

async function handleRegister() {
  if (form.password !== confirmPassword.value) {
    errorMessage.value = "两次输入的密码不一致";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetch("/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      duplex: "half",
    } as RequestInit);

    const result = await response.json();

    if (result.success) {
      // Store user info and redirect
      localStorage.setItem("user", JSON.stringify(result.data));
      window.location.href = "/";
    } else {
      errorMessage.value = result.message || "注册失败";
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = "网络错误，请重试";
  } finally {
    loading.value = false;
  }
}
</script>
