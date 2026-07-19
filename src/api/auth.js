import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth APIs
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function register(email, password, nickname) {
  const { data } = await api.post('/auth/register', { email, password, nickname })
  return data
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function logout() {
  await api.post('/auth/logout')
}

export async function getProfile() {
  const { data } = await api.get('/profile')
  return data
}

export async function updateProfile(data) {
  const { data: result } = await api.put('/profile', data)
  return result
}

export async function getPublicProfile(userId) {
  const { data } = await api.get(`/profile/${userId}`)
  return data
}
