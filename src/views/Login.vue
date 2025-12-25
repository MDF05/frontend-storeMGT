<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const error = ref('');
const route = useRoute();

console.log("Current route name:", route.name);

const handleLogin = async () => {
    try {
        await authStore.login(username.value, password.value);
    } catch (err) {
        error.value = 'Invalid username or password';
    }
};
</script>

<template>
    <!-- <div class="auth-container fade-in "> -->
    <div class="auth-container fade-in ">
        <div class="auth-card glass-panel ">
            <div class="logo">
                <h2>Store<span class="accent">MGT</span></h2>
                <p>Welcome back! Please sign in.</p>
            </div>

            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label>Username</label>
                    <input v-model="username" class="glass-input" required placeholder="Enter your username" />
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" v-model="password" class="glass-input" required
                        placeholder="Enter your password" />
                </div>

                <div v-if="error" class="message error">{{ error }}</div>

                <button type="submit" class="btn-primary w-100">Sign In</button>
            </form>

            <div class="footer-link">
                <p>Don't have an account? <RouterLink to="/register" class="link">Register here</RouterLink>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at top right, #1e1b4b, var(--bg-dark), #0f172a);
    background-size: 200% 200%;
    animation: gradientMove 15s ease infinite;
}

@keyframes gradientMove {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.auth-card {
    width: 100%;
    max-width: 420px;
    padding: 3rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.logo {
    text-align: center;
    margin-bottom: 2.5rem;
}

.logo h2 {
    margin: 0;
    font-size: 2.2rem;
    background: linear-gradient(to right, #fff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.logo p {
    margin: 0.5rem 0 0;
    color: var(--text-muted);
    font-size: 0.95rem;
}

.accent {
    color: var(--primary);
    -webkit-text-fill-color: var(--primary);
}

.form-group {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #e2e8f0;
}

.glass-input {
    background: rgba(30, 41, 59, 0.6);
    transition: all 0.3s;
}

.glass-input:focus {
    background: rgba(30, 41, 59, 0.9);
    transform: translateY(-2px);
}

.w-100 {
    width: 100%;
    margin-top: 1rem;
    padding: 1rem;
    font-size: 1rem;
    letter-spacing: 0.5px;
}

.message {
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 0.9rem;
}

.error {
    background: rgba(244, 63, 94, 0.1);
    color: #fb7185;
    border: 1px solid rgba(244, 63, 94, 0.2);
}

.footer-link {
    margin-top: 2rem;
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-muted);
}

.link {
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
}

.link:hover {
    color: #818cf8;
    text-decoration: underline;
}
</style>
