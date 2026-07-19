import { reactive } from 'vue'
import { login as apiLogin, register as apiRegister, fetchMe as apiFetchMe, logout as apiLogout } from '../api/auth'

const state = reactive({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoggedIn: false,
  loading: false,
})

function setAuth(token, user) {
  state.token = token
  state.user = user
  state.isLoggedIn = true
  localStorage.setItem('token', token)
}

function clearAuth() {
  state.token = null
  state.user = null
  state.isLoggedIn = false
  localStorage.removeItem('token')
}

export function useAuth() {
  async function login(email, password) {
    state.loading = true
    try {
      const result = await apiLogin(email, password)
      setAuth(result.token, result.user)
      return result
    } catch (err) {
      throw err.response?.data?.error || '登录失败，请稍后重试'
    } finally {
      state.loading = false
    }
  }

  async function register(email, password, nickname) {
    state.loading = true
    try {
      const result = await apiRegister(email, password, nickname)
      setAuth(result.token, result.user)
      return result
    } catch (err) {
      throw err.response?.data?.error || '注册失败，请稍后重试'
    } finally {
      state.loading = false
    }
  }

  async function restoreSession() {
    if (!state.token) return
    state.loading = true
    try {
      const result = await apiFetchMe()
      state.user = result.user
      state.isLoggedIn = true
    } catch {
      clearAuth()
    } finally {
      state.loading = false
    }
  }

  async function logout() {
    try {
      await apiLogout()
    } catch {
      // Ignore errors — clear local state anyway
    }
    clearAuth()
  }

  return {
    state,
    login,
    register,
    restoreSession,
    logout,
  }
}

export default useAuth
