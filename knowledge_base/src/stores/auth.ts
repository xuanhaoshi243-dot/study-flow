import {ref} from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export interface User {
  id: number,
  username: string, 
  email: string,
}

export const useAuthStore = defineStore('auth', ()=>{
  const user = ref<User | null>(null)

  async function fetchCurrentUser(){
    const res = await axios.get<{user: User}>('/api/auth/me')
    user.value = res.data.user
  }

  async function restoreSession() {
    try {
      await fetchCurrentUser()
    } catch(err) {
      if (axios.isAxiosError(err) && 
      err.response?.status === 401) {
        user.value = null
        return
      }
      throw err
    }
  }
  return {user, fetchCurrentUser, restoreSession }
})

