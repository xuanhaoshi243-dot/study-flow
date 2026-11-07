import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login.vue'
import NotesView from '@/views/NotesView.vue'
import AppLayout from '@/layouts/AppLayout.vue'

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
    {
      path: '/app',
      component: AppLayout,
      redirect: '/app/notes',
      children: [
        {
          path: 'notes',
          name: 'notes',
          component: NotesView,
        }
      ]
    },
  ],
})

export default router
