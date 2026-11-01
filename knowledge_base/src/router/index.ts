import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      // 与登录路由复用同一组件，切换时保留邮箱、密码的响应式状态。
      component: Login,
    },
  ],
})

export default router
