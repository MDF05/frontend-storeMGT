<script setup>
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()
const route = useRoute()




const showSidebar = computed(() => !['login', 'register'].includes(route.name))
</script>

<template>
  <div class="app-container ">
    <main class="main-content" :style="{ gridTemplateColumns: gridColumns }">
      <nav v-if="!['login', 'register'].includes(route.name)" class="sidebar glass-panel">
        <div class="logo">
          <h2>Store<span class="accent">MGT</span></h2>
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
          <RouterLink to="/customers" class="nav-link" active-class="active">
            <span>👥</span> Customers
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
