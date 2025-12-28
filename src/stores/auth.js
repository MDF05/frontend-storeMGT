import { defineStore } from 'pinia'
import api from '../utils/api'
import router from '../router'

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
                const response = await api.post('/auth/login', { username, password })
                const { token, user } = response.data

                this.token = token
                this.user = user

                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))

                // No need to set global header manually, interceptor handles it

                router.push('/')
            } catch (err) {
                this.error = err.response?.data?.error || 'Login failed'
                throw err
            }
        },
        async register(username, email, password) {
            try {
                await api.post('/auth/register', { username, email, password })
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
            // No need to clear global header manually
            router.push('/login')
        }
    }
})
