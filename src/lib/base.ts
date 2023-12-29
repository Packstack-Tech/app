import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  timeout: 1000 * 60 * 2,
})

http.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})
