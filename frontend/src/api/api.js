import axios from 'axios'

const apiPort = import.meta.env.VITE_API_PORT || '5000'
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://localhost:${apiPort}/api` : '/api')

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('erp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('erp_token')
      localStorage.removeItem('erp_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// Auth
export const loginUser = (data) => api.post('/login', data)
export const registerUser = (data) => api.post('/register', data)

// Projects
export const fetchProjects = (search = '') => api.get(`/projects${search ? `?search=${search}` : ''}`)
export const fetchProject = (id) => api.get(`/projects/${id}`)
export const createProject = (data) => api.post('/projects', data)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data)
export const deleteProject = (id) => api.delete(`/projects/${id}`)

// Client Payments
export const fetchPayments = (projectId) => api.get(`/projects/${projectId}/payments`)
export const addPayment = (projectId, data) => api.post(`/projects/${projectId}/payments`, data)
export const deletePayment = (projectId, paymentId) => api.delete(`/projects/${projectId}/payments/${paymentId}`)

// Product Expenses
export const fetchProductExpenses = (projectId) => api.get(`/projects/${projectId}/expenses/products`)
export const addProductExpense = (projectId, data) => api.post(`/projects/${projectId}/expenses/products`, data)
export const updateProductExpense = (projectId, expenseId, data) => api.put(`/projects/${projectId}/expenses/products/${expenseId}`, data)
export const deleteProductExpense = (projectId, expenseId) => api.delete(`/projects/${projectId}/expenses/products/${expenseId}`)

// Service Expenses
export const fetchServiceExpenses = (projectId) => api.get(`/projects/${projectId}/expenses/services`)
export const addServiceExpense = (projectId, data) => api.post(`/projects/${projectId}/expenses/services`, data)
export const updateServiceExpense = (projectId, expenseId, data) => api.put(`/projects/${projectId}/expenses/services/${expenseId}`, data)
export const deleteServiceExpense = (projectId, expenseId) => api.delete(`/projects/${projectId}/expenses/services/${expenseId}`)

export default api
