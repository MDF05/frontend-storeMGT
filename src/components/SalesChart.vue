<script setup>
import { onMounted, ref } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { useAnalyticsStore } from '../stores/analytics'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const analyticsStore = useAnalyticsStore()
const chartData = ref({
  labels: [],
  datasets: []
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
        labels: { color: '#94a3b8' }
    }
  },
  scales: {
    y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
    },
    x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
    }
  }
}

onMounted(async () => {
    await analyticsStore.fetchDailySales()
    
    // Transform data
    const labels = analyticsStore.dailySales.map(d => d.date)
    const data = analyticsStore.dailySales.map(d => d.total_amount)
    
    chartData.value = {
        labels,
        datasets: [{
            label: 'Daily Sales ($)',
            backgroundColor: '#6366f1',
            borderColor: '#818cf8',
            data,
            tension: 0.4
        }]
    }
})
</script>

<template>
  <Line :data="chartData" :options="chartOptions" v-if="chartData.labels.length > 0" />
  <div v-else class="no-data">No sales data available yet.</div>
</template>

<style scoped>
.no-data {
    color: var(--text-muted);
    text-align: center;
    padding: 2rem;
}
</style>
