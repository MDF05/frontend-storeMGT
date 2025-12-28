<script setup>
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { ref, computed, watch } from 'vue'

const authStore = useAuthStore()
const route = useRoute()
const showMobileMenu = ref(false)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// Close mobile menu on route change
watch(() => route.path, () => {
  showMobileMenu.value = false
})

const showSidebar = computed(() => !['login', 'register'].includes(route.name))
</script>

<template>
  <div class="app-container">
    <button v-if="showSidebar" class="mobile-menu-btn" @click="toggleMobileMenu">
      ☰
    </button>

    <main class="main-content" :class="{ 'with-sidebar': showSidebar }">
      <nav v-if="showSidebar" class="sidebar glass-panel" :class="{ 'open': showMobileMenu }">
        <div class="logo-row">
            <div class="logo">
            <h2>Store<span class="accent">MGT</span></h2>
            </div>
            <button class="close-menu-btn" @click="showMobileMenu = false">✕</button>
        </div>

        <div class="nav-links">
          <RouterLink to="/" class="nav-link" active-class="active">
            <span>📊</span> Dashboard
          </RouterLink>
          <RouterLink to="/inventory" class="nav-link" active-class="active">
            <span>📦</span> Inventory
          </RouterLink>
          <RouterLink to="/pos" class="nav-link" active-class="active">
            <span>💳</span> Point of Sale
          </RouterLink>
          <RouterLink to="/tracking" class="nav-link" active-class="active">
            <span>🔍</span> Tracking
          </RouterLink>
          <RouterLink to="/customers" class="nav-link" active-class="active">
            <span>👥</span> Customers
          </RouterLink>
          <RouterLink to="/transactions" class="nav-link" active-class="active">
            <span>🧾</span> Transactions
          </RouterLink>
          <RouterLink to="/settings" class="nav-link" active-class="active">
            <span>⚙️</span> Settings
          </RouterLink>

          <div class="divider"></div>

          <button @click="authStore.logout()" class="nav-link logout-btn">
            <span>🚪</span> Logout
          </button>
        </div>
      </nav>

      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.mobile-menu-btn {
  display: none;
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 50;
  background: var(--glass-card);
  border: 1px solid var(--glass-border);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-menu-btn {
    display: none;
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
}

.logo-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

@media (max-width: 1024px) {
  .mobile-menu-btn {
    display: block;
  }
  
  .close-menu-btn {
      display: block;
  }
  
  .main-content {
      display: block !important; /* Reset grid */
  }
}

.logo {
  padding: 0 1rem;
  margin-bottom: 2rem;
}

.logo h2 {
  font-size: 1.5rem;
  color: white;
}

.accent {
  color: var(--primary);
}
</style>
