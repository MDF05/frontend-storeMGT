<script setup>
import { onMounted, ref } from 'vue';
import api from '../utils/api';
import { useSettingsStore } from '../stores/settings';
import { exportToPDF } from '../utils/pdfExport';

const settingsStore = useSettingsStore();
const transactions = ref([]);
const loading = ref(true);

const fetchTransactions = async () => {
    loading.value = true;
    try {
        const res = await api.get('/sales/');
        transactions.value = res.data;
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
};

const exportTransactions = () => {
    const columns = ['Date', 'Type', 'Amount', 'Payment', 'Items', 'Customer'];
    const data = transactions.value.map(t => [
        formatDate(t.date),
        'SALE',
        formatCurrency(t.total_amount),
        t.payment_method.toUpperCase(),
        t.items.length + ' Items',
        t.customer_id ? `Customer #${t.customer_id}` : 'Guest'
    ]);
    exportToPDF('Sales_History', 'Sales Transactions Report', columns, data, settingsStore);
};

onMounted(async () => {
    fetchTransactions();
    await settingsStore.fetchSettings();
});
</script>

<template>
  <div class="transactions fade-in">
    <div class="header">
      <h1>Sales History (In/Out)</h1>
      <div class="actions" style="display: flex; gap: 1rem;">
          <button @click="exportTransactions" class="btn-primary small" style="background: var(--text-muted)">📄 Export PDF</button>
          <button @click="fetchTransactions" class="btn-primary">Refresh</button>
      </div>
    </div>

    <div class="glass-panel table-container">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Total Amount</th>
            <th>Payment</th>
            <th>Items</th>
            <th>Customer</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
             <td colspan="6" class="text-center">Loading transactions...</td>
          </tr>
          <tr v-else v-for="t in transactions" :key="t.id">
            <td>{{ formatDate(t.date) }}</td>
            <td><span class="badge sale">SALE</span></td>
            <td class="amount">{{ formatCurrency(t.total_amount) }}</td>
            <td>
                <span :class="{'text-green': t.payment_method === 'cash', 'text-yellow': t.payment_method === 'debt'}">
                    {{ t.payment_method.toUpperCase() }}
                </span>
                <div v-if="t.paid_amount < t.total_amount" class="tiny">
                    Paid: {{ formatCurrency(t.paid_amount) }}
                </div>
            </td>
            <td>
                <ul class="item-list">
                    <li v-for="item in t.items" :key="item.product_id">
                        {{ item.product_name }} (x{{ item.quantity }}) @ {{ formatCurrency(item.price_at_sale) }}
                    </li>
                </ul>
            </td>
            <td>{{ t.customer_id ? `Customer #${t.customer_id}` : 'Guest' }}</td>
          </tr>
           <tr v-if="!loading && transactions.length === 0">
            <td colspan="6" class="text-center">No transactions found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.header { display: flex; justify-content: space-between; margin-bottom: 2rem; align-items: center; }
.badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; }
.badge.sale { background: var(--success); color: #000; }
.text-green { color: var(--success); font-weight: bold; }
.text-yellow { color: var(--warning); font-weight: bold; }
.tiny { font-size: 0.75rem; color: var(--text-muted); }
.amount { font-weight: bold; font-size: 1.1rem; }
.item-list { list-style: none; padding: 0; margin: 0; font-size: 0.9rem; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--glass-border); color: var(--text-main); }
.text-center { text-align: center; }

@media (max-width: 768px) { 
    .header {
        flex-direction: column;
        gap: 1rem;
    }
}

</style>
