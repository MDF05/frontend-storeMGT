<script setup>
import { onMounted } from 'vue';
import { useAnalyticsStore } from '../stores/analytics';
import StatCard from '../components/StatCard.vue';
import SalesChart from '../components/SalesChart.vue';

const analyticsStore = useAnalyticsStore();

onMounted(() => {
    analyticsStore.fetchSummary();
});
</script>

<template>
  <div class="dashboard fade-in">
    <div class="header">
      <h1>Dashboard Overview</h1>
      <p>Real-time updates on store performance</p>
    </div>

    <div class="stats-grid">
      <StatCard 
        title="Total Revenue" 
        :value="`$${analyticsStore.summary.total_revenue || 0}`" 
        icon="💰" 
        color="primary"
      />
      <StatCard 
        title="Total Sales" 
        :value="analyticsStore.summary.total_sales_count || 0" 
        icon="🛒" 
        color="secondary"
      />
      <StatCard 
        title="Products in Stock" 
        :value="analyticsStore.summary.total_products || 0" 
        icon="📦" 
        color="accent"
      />
    </div>

    <div class="charts-section glass-panel">
      <h3>Sales Analytics</h3>
      <div class="chart-container">
        <SalesChart />
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
    margin-bottom: 2rem;
}
.header p {
    color: var(--text-muted);
}
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}
.charts-section {
    padding: 2rem;
    min-height: 400px;
}
.chart-container {
    height: 300px;
    margin-top: 1rem;
}
</style>
