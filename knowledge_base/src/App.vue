<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import {ref, onMounted} from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const isRestoring = ref(true)
const restoreError = ref('')
onMounted(async ()=>{
  try {
    await authStore.restoreSession()
    console.log('恢复后的用户：', authStore.user)
    
  } catch(err) {
    restoreError.value = '暂时无法确认登录状态，请刷新重试'
  } finally {
    isRestoring.value = false
  }
})
</script>

<template>
  <main v-if="isRestoring" class="startup-screen" aria-busy="true">
    <section class="startup-card" role="status">
      <span class="startup-spinner" aria-hidden="true"></span>
      <h1 class="startup-title">正在加载…</h1>
    </section>
  </main>
  <main v-else-if="restoreError" class="startup-screen">
    <section class="startup-card" role="alert">
      <span class="startup-error-icon" aria-hidden="true">!</span>
      <h1 class="startup-title">暂时无法加载</h1>
      <p class="startup-message">{{ restoreError }}</p>
    </section>
  </main>
  <RouterView v-else/>
</template>

<style scoped>
.startup-screen {
  display: flex;
  min-height: 100vh;
  min-height: 100svh;
  padding: 32px 16px;
  background-color: #f5f6f8;
  color: #242830;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.startup-card {
  width: 100%;
  max-width: 448px;
  margin: auto;
  padding: 40px;
  border: 1px solid #e3e6eb;
  border-radius: 24px;
  background-color: #fff;
  box-shadow:
    0 12px 36px rgb(24 34 50 / 6%),
    0 1px 2px rgb(24 34 50 / 3%);
  text-align: center;
}

.startup-spinner,
.startup-error-icon {
  display: block;
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border-radius: 50%;
}

.startup-spinner {
  border: 3px solid #e8eef7;
  border-top-color: #526f9f;
  animation: startup-spin 1s linear infinite;
}

.startup-error-icon {
  border: 1px solid #f0dada;
  background-color: #fdf4f4;
  color: #b54949;
  font-size: 22px;
  font-weight: 600;
  line-height: 38px;
}

.startup-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
}

.startup-message {
  margin-top: 12px;
  color: #626b78;
  font-size: 14px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

@keyframes startup-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .startup-card {
    padding: 32px 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .startup-spinner {
    animation: none;
  }
}
</style>
