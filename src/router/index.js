import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Dashboard from '../views/Dashboard.vue'
import Inventory from '../views/Inventory.vue'
import POS from '../views/POS.vue'
import Login from '../views/Login.vue'
import Customers from '../views/Customers.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/Register.vue')
        },
        {
            path: '/',
            name: 'dashboard',
            component: Dashboard,
            meta: { requiresAuth: true }
        },
        {
            path: '/inventory',
            name: 'inventory',
            component: Inventory,
            meta: { requiresAuth: true }
        },
        {
            path: '/pos',
            name: 'pos',
            component: POS,
            meta: { requiresAuth: true }
        },
        {
            path: '/customers',
            name: 'customers',
            component: Customers,
            meta: { requiresAuth: true }
        },
        {
            path: '/transactions',
            name: 'transactions',
            component: () => import('../views/Transactions.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('../views/Settings.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/tracking',
            name: 'tracking',
            component: () => import('../views/ProductTracking.vue'),
            meta: { requiresAuth: true }
        }
    ]
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
    } else {
        next()
    }
})

export default router
