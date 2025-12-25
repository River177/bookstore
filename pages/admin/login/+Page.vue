<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  username: '',
  password: ''
})
const loading = ref(false)
const error = ref('')

const login = async () => {
  if (!form.value.username || !form.value.password) {
    error.value = '请填写用户名和密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      error.value = data.message || '登录失败'
      return
    }

    // Store admin info
    localStorage.setItem('adminUser', JSON.stringify(data.data))
    localStorage.setItem('adminToken', 'admin-session') // Simplified for demo
    
    // Redirect to dashboard
    window.location.href = '/admin'
  } catch (err) {
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
    <div class="card bg-base-100 shadow-2xl w-full max-w-md">
      <div class="card-body">
        <!-- Logo -->
        <div class="text-center mb-6">
          <div class="text-5xl mb-2">📖</div>
          <h1 class="text-2xl font-bold">书店管理系统</h1>
          <p class="text-base-content/60">管理员登录</p>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="login" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">用户名</span>
            </label>
            <input 
              v-model="form.username"
              type="text" 
              placeholder="请输入管理员用户名" 
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">密码</span>
            </label>
            <input 
              v-model="form.password"
              type="password" 
              placeholder="请输入密码" 
              class="input input-bordered w-full"
              required
            />
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-full"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            {{ loading ? '登录中...' : '登 录' }}
          </button>
        </form>

        <!-- Demo Account -->
        <div class="divider">测试账号</div>
        <div class="text-center text-sm text-base-content/60">
          <p>用户名: <span class="font-mono bg-base-200 px-2 py-0.5 rounded">admin</span></p>
          <p>密码: <span class="font-mono bg-base-200 px-2 py-0.5 rounded">admin123</span></p>
        </div>

        <!-- Back to Store -->
        <div class="text-center mt-4">
          <a href="/" class="link link-primary">← 返回商城首页</a>
        </div>
      </div>
    </div>
  </div>
</template>
