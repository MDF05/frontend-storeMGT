<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const success = ref('');

const handleRegister = async () => {
    try {
        await authStore.register(username.value, email.value, password.value);
        success.value = 'Registration successful! Redirecting...';
        setTimeout(() => {
            router.push('/login');
        }, 1500);
    } catch (err) {
        error.value = authStore.error;
    }
};
</script>

<template>
  <div class="auth-container fade-in">
    <div class="auth-card glass-panel">
      <div class="logo">
        <h2>Store<span class="accent">MGT</span></h2>
        <p>Create your account</p>
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
            <label>Username</label>
            <input v-model="username" class="glass-input" required placeholder="Choose a username" />
        </div>
        <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="email" class="glass-input" required placeholder="Enter your email" />
        </div>
        <div class="form-group">
            <label>Password</label>
            <input type="password" v-model="password" class="glass-input" required placeholder="Create a password" />
        </div>
        
        <div v-if="error" class="message error">{{ error }}</div>
        <div v-if="success" class="message success">{{ success }}</div>
        
        <button type="submit" class="btn-primary w-100">Sign Up</button>
      </form>

      <div class="footer-link">
        <p>Already have an account? <RouterLink to="/login" class="link">Login here</RouterLink></p>
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
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
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
.logo h2 { margin: 0; font-size: 2.2rem; background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.logo p { margin: 0.5rem 0 0; color: var(--text-muted); font-size: 0.95rem; }
.accent { color: var(--primary); -webkit-text-fill-color: var(--primary); }

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

.w-100 { width: 100%; margin-top: 1rem; padding: 1rem; font-size: 1rem; letter-spacing: 0.5px; }

.message {
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 0.9rem;
}
.error { background: rgba(244, 63, 94, 0.1); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.2); }
.success { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }

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
