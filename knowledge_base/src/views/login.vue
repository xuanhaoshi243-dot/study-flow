<template>
  <main class="login-page">
    <section class="box" aria-labelledby="login-title">
      <header class="login-header">
        <h1 id="login-title">知序</h1>
        <p>个人知识库 + AI助手</p>
      </header>

      <!-- 两个路由共用这个表单，邮箱和密码不会因切换模式而重新创建。 -->
      <form class="login-form" @submit.prevent="handleSubmit">
        <div v-if="isRegister" class="form-field">
          <label for="nickname">昵称</label>
          <input
            id="nickname"
            v-model="nickname"
            name="nickname"
            type="text"
            placeholder="请输入昵称"
            autocomplete="off"
            required
          />
        </div>

        <div class="form-field">
          <label for="email">邮箱</label>
          <input
            required
            id="email"
            name="email"
            type="email"
            placeholder="请输入邮箱"
            autocomplete="off"
            v-model="email"
          />
        </div>

        <div class="form-field">
          <label for="password">密码</label>
          <input
            required
            id="password"
            name="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="off"
            v-model="password"
          />
        </div>
        <div v-if="isRegister" class="form-field">
          <label for="confirm-password">确认密码</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            autocomplete="off"
            required
          />
        </div>

        <p v-if="error" id="errorTip" role="alert">{{ error }}</p>
        <p v-if="success" id="successTip" role="status">{{ success }}</p>
        <button class="login-btn" type="submit" :disabled="loading">{{ loading ? '提交中...' : isRegister ? '注册' : '登录' }}</button>
      </form>

      <RouterLink :to="isRegister ? '/login' : '/register'" class="register-hint">
        {{ isRegister ? '已有账号？前往登录' : '还没有账号？前往注册' }}
      </RouterLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const isRegister = computed(() => route.name === 'register')

const nickname = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
//注册页显示的错误信息
const error = ref('')
//注册按钮放置重复提交
const loading = ref(false)
//注册成功后的提示
const success = ref('')

// 只清理当前模式专有的内容；邮箱、密码保留在组件内存中。
watch(isRegister, () => {
  nickname.value = ''
  confirmPassword.value = ''
  error.value = ''
  success.value = ''
})

async function handleSubmit() {
  if (loading.value) return
  // 目前只验收表单展示和切换，真实注册、登录接口留待后续接入。
  error.value = ''
  success.value = ''
  if (isRegister.value) {
    const tirmmedNikedName = nickname.value.trim()
    if (tirmmedNikedName.length < 2 || tirmmedNikedName.length > 20) {
      error.value = '昵称需要为 2~20 个字符'
      return
    }
    if (password.value.length < 6 || password.value.length > 20) {
      error.value = '密码需要为 6~20 个字符'
      return
    }
    if (confirmPassword.value !== password.value) {
      error.value = '两次输入密码不同'
      return 
    }
  } else {
    return 
  }

  loading.value = true
  try {
    await axios.post('/api/auth/register', {
      nickname: nickname.value.trim(),
      email: email.value,
      password: password.value,
    })
    //清空输入框并跳转至登录页，（编程式路由导航）
    password.value = ''
    confirmPassword.value = ''
    email.value = ''
    await router.push('/login')
    success.value = '注册成功'
  } catch(err) {
    if (axios.isAxiosError(err) && err.response) {
      // data 不为 null/undefined 才读取 message，否则不读取，赋 message 为 undefined
      const message = err.response.data?.message

      error.value = 
        typeof message === 'string' ? message :
        '请求失败，请稍后重试'
    } else {
      error.value = '请求失败，请检查网络或后端服务'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 居中由登录页自己负责，不把其他路由的 body 也改成 flex。 */
.login-page {
  display: flex;
  min-height: 100vh;
  min-height: 100svh;
  padding: 32px 16px;
  background-color: #f5f6f8;
  color: #242830;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.box {
  width: 100%;
  max-width: 448px;
  margin: auto;
  padding: 40px;
  background-color: #fff;
  border: 1px solid #e3e6eb;
  border-radius: 24px;
  box-shadow:
    0 12px 36px rgb(24 34 50 / 6%),
    0 1px 2px rgb(24 34 50 / 3%);
}

.login-header {
  margin-bottom: 36px;
  text-align: center;
}

.login-header h1 {
  margin-bottom: 8px;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 1px;
}

.login-header p {
  color: #626b78;
  font-size: 15px;
  line-height: 1.6;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.form-field input {
  width: 100%;
  min-width: 0;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #dde1e7;
  border-radius: 12px;
  background-color: #fff;
  color: #242830;
  font: inherit;
  font-size: 15px;
  box-shadow: 0 1px 2px rgb(24 34 50 / 5%);
  transition:
    border-color 150ms,
    box-shadow 150ms;
}

.form-field input::placeholder {
  color: #858d99;
}

.form-field input:focus-visible {
  border-color: #526f9f;
  outline: 2px solid #e8eef7;
  outline-offset: 2px;
}

.login-btn {
  width: 100%;
  min-height: 44px;
  margin-top: 4px;
  padding: 10px 16px;
  border: 1px solid transparent;
  border-radius: 12px;
  background-color: #111827;
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgb(17 24 39 / 8%);
  transition: background-color 150ms;
}

.login-btn:hover {
  background-color: #253044;
}

.login-btn:focus-visible {
  outline: 2px solid #526f9f;
  outline-offset: 3px;
}

.register-hint {
  display: block;
  width: fit-content;
  margin: 24px auto 0;
  padding: 0;
  position: relative;
  color: #626b78;
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
  cursor: pointer;
}

.register-hint::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 1px;
  background-color: currentColor;
}

.register-hint:hover {
  background-color: transparent;
}

/* 窄屏只缩小内边距，不固定卡片高度，短屏仍能自然滚动。 */
@media (max-width: 480px) {
  .box {
    padding: 32px 24px;
  }
}

#errorTip {
  padding: 10px 12px;
  border: 1px solid #f0dada;
  border-radius: 8px;
  background-color: #fdf4f4;
  color: #b54949;
  font-size: 13px;
  line-height: 1.6;
  text-align: left;
  overflow-wrap: anywhere;
}

#successTip {
  padding: 10px 12px;
  border: 1px solid #dde1e7;
  border-radius: 8px;
  background-color: #e8eef7;
  color: #526f9f;
  font-size: 13px;
  line-height: 1.6;
  text-align: left;
  overflow-wrap: anywhere;
}
</style>
