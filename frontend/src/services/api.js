import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    }
})

// Attach JWT token dynamically before EVERY request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Clean response interceptor without hard browser redirects
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Just reject the error promise so individual try/catch blocks 
        // or AuthContext can handle it natively
        return Promise.reject(error)
    }
)

export default api