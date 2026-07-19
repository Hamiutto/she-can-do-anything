import axios from 'axios'

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.data?.error && !error.response.data.message) {
      error.response.data.message = error.response.data.error
    }
    return Promise.reject(error)
  }
)

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export async function getQuestions() {
  const response = await api.get('/questions')
  return response.data
}

export async function getQuestion(id) {
  const response = await api.get(`/questions/${id}`)
  return response.data
}

export async function submitQuestion({ content, author, time_type }) {
  const response = await api.post('/questions', { content, author, time_type })
  return response.data
}

export async function answerQuestion(id, { content, author }) {
  const response = await api.post(`/questions/${id}/answer`, { content, author })
  return response.data
}

export async function getNotifications(userName) {
  const response = await api.get(`/notifications/${encodeURIComponent(userName)}`)
  return response.data
}

export async function markNotificationRead(id) {
  const response = await api.post(`/notifications/${id}/read`)
  return response.data
}

export default api
