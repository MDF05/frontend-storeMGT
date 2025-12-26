<script setup>
import { onMounted, computed, ref } from 'vue';
import { useAnalyticsStore } from '../stores/analytics';
import { useProductStore } from '../stores/product';
import { useSettingsStore } from '../stores/settings';
import { exportToPDF } from '../utils/pdfExport';
import StatCard from '../components/StatCard.vue';
import SalesChart from '../components/SalesChart.vue';

const analyticsStore = useAnalyticsStore();
const productStore = useProductStore();
const settingsStore = useSettingsStore();

onMounted(async () => {
    analyticsStore.fetchSummary();
    await productStore.fetchProducts();
    await settingsStore.fetchSettings();
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

const totalStockValue = computed(() => {
    return productStore.products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
});

const lowStockItems = computed(() => {
    return productStore.products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10));
});

const exportInventoryReport = () => {
    const columns = ['Product Name', 'SKU', 'Stock', 'Threshold', 'Price', 'Status'];
    const data = productStore.products.map(p => {
        let status = 'OK';
        if (p.stock_quantity <= 0) status = 'Out of Stock';
        else if (p.stock_quantity <= (p.low_stock_threshold || 10)) status = 'Low Stock';
        
        return [
            p.name, 
            p.sku, 
            p.stock_quantity, 
            p.low_stock_threshold || 10,
            formatCurrency(p.price),
            status
        ];
    });

    exportToPDF(
        'Inventory_Report', 
        'Full Inventory Report', 
        columns, 
        data, 
        settingsStore
    );
};
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
        :value="formatCurrency(analyticsStore.summary.total_revenue || 0)" 
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

    <div class="inventory-report glass-panel" style="margin-top: 2rem;">
        <div class="report-header">
            <h3>📦 Inventory Report</h3>
            <div class="header-actions">
                <button @click="exportInventoryReport" class="btn-primary small">📄 Export PDF</button>
                <span class="value-badge">Total Stock Value: {{ formatCurrency(totalStockValue) }}</span>
            </div>
        </div>
        
        <div class="low-stock-list">
            <h4>⚠️ Low Stock Alerts</h4>
            <div v-if="lowStockItems.length === 0" class="good-state">
                All stock levels are healthy! ✅
            </div>
            <div v-else class="alert-grid">
                <div v-for="p in lowStockItems" :key="p.id" class="alert-card">
                    <span class="p-name">{{ p.name }}</span>
                    <span class="p-stock red">{{ p.stock_quantity }} left</span>
                    <span class="p-limit">(Limit: {{ p.low_stock_threshold || 10 }})</span>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--glass-border);
    padding-bottom: 1rem;
}
.header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
}
.value-badge {
    background: var(--primary);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: bold;
}
.alert-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
}
.alert-card {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid var(--accent);
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}
.p-name { font-weight: bold; }
.p-stock.red { color: var(--accent); font-weight: 800; font-size: 1.1rem; }
.p-limit { font-size: 0.8rem; color: var(--text-muted); }
.good-state { color: var(--success); font-weight: bold; padding: 1rem; text-align: center; background: rgba(16, 185, 129, 0.1); border-radius: 8px;}

</style>
