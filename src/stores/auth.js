import { defineStore } from 'pinia'
import axios from 'axios'
import router from '../router'

const API_URL = 'http://localhost:5000/api/auth'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        error: null
    }),
    getters: {
        isAuthenticated: (state) => !!state.token
    },
    actions: {
        async login(username, password) {
            try {
                const response = await axios.post(`${API_URL}/login`, { username, password })
                const { token, user } = response.data

                this.token = token
                this.user = user

                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))

                // Configure axios global header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

                router.push('/')
            } catch (err) {
                this.error = err.response?.data?.error || 'Login failed'
                throw err
            }
        },
        async register(username, email, password) {
            try {
                await axios.post(`${API_URL}/register`, { username, email, password })
                // Auto login or redirect to login? Let's redirect to login with a message or just login directly using the logic above?
                // For simplicity, let's just return true so the component can redirect.
                return true
            } catch (err) {
                this.error = err.response?.data?.error || 'Registration failed'
                throw err
            }
        },
        logout() {
            this.token = null
            this.user = null
            this.error = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            delete axios.defaults.headers.common['Authorization']
            router.push('/login')
        }
    }
})
