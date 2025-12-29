<script setup>
import { onMounted, ref } from 'vue';
import api from '../utils/api';
import { useSettingsStore } from '../stores/settings';
import { exportToPDF } from '../utils/pdfExport';

const settingsStore = useSettingsStore();
const transactions = ref([]);
const loading = ref(true);
const selectedIds = ref([]);
const selectAllChecked = ref(false);
const products = ref([]);
const categories = ref([]);
const selectedProductId = ref(null);
const selectedCategoryId = ref(null);

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

const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id);
  if (idx === -1) selectedIds.value.push(id);
  else selectedIds.value.splice(idx, 1);
  selectAllChecked.value = selectedIds.value.length === transactions.value.length;
}

const toggleSelectAll = () => {
  if (selectAllChecked.value) {
    // deselect all
    selectedIds.value = [];
    selectAllChecked.value = false;
  } else {
    selectedIds.value = transactions.value.map(t => t.id);
    selectAllChecked.value = true;
  }
}

const deleteSelected = async () => {
  if (!selectedIds.value.length) return alert('No transactions selected');
  if (!confirm(`Delete ${selectedIds.value.length} selected transactions? This will revert stock and remove debts.`)) return;
  try {
    const res = await api.post('/sales/bulk-delete', { ids: selectedIds.value });
    console.log(res.data);
    alert(`Deleted: ${res.data.deleted.length}, Failed: ${Object.keys(res.data.failed).length}`);
    selectedIds.value = [];
    await fetchTransactions();
  } catch (err) {
    console.error(err);
    alert('Failed to delete selected transactions');
  }
}

const deleteByProduct = async () => {
  const pid = selectedProductId.value;
  if (!pid) return alert('Please select a product');
  if (!confirm(`Delete all transactions containing product id ${pid}? This will revert stock and remove debts.`)) return;
  try {
    const res = await api.post('/sales/delete-by-filter', { product_id: pid });
    alert(`Deleted ${res.data.deleted_count} transactions.`);
    selectedProductId.value = null;
    await fetchTransactions();
  } catch (err) {
    console.error(err);
    alert('Failed to delete by product');
  }
}

const deleteByCategory = async () => {
  const cid = selectedCategoryId.value;
  if (!cid) return alert('Please select a category');
  if (!confirm(`Delete all transactions for category id ${cid}? This will revert stock and remove debts.`)) return;
  try {
    const res = await api.post('/sales/delete-by-filter', { category_id: cid });
    alert(`Deleted ${res.data.deleted_count} transactions.`);
    selectedCategoryId.value = null;
    await fetchTransactions();
  } catch (err) {
    console.error(err);
    alert('Failed to delete by category');
  }
}

onMounted(async () => {
  fetchTransactions();
  await settingsStore.fetchSettings();
  // load products and categories for the delete selects
  try {
    const [pRes, cRes] = await Promise.all([api.get('/products/'), api.get('/products/categories')]);
    products.value = pRes.data;
    categories.value = cRes.data;
  } catch (e) {
    console.error('Failed to load products/categories', e);
  }
});
</script>

<template>
  <div class="transactions fade-in">
    <div class="header">
      <h1>Sales History (In/Out)</h1>
      <div class="actions" style="display: flex; gap: 1rem; align-items: center;">
        <button @click="exportTransactions" class="btn-primary small" style="background: var(--text-muted)">📄 Export
          PDF</button>
        <button @click="fetchTransactions" class="btn-primary">Refresh</button>
        <div style="display:flex; flex-direction: column; gap:0.5rem; align-items:center;">
          <select v-model="selectedProductId">
            <option :value="null">Select product to delete...</option>
            <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }} (id: {{ p.id }})</option>
          </select>
          <button @click="deleteByProduct" class="btn-danger" :disabled="!selectedProductId">Delete by Product</button>
        </div>
        <div style="display:flex; flex-direction: column; gap:0.5rem; align-items:center;">
          <select v-model="selectedCategoryId">
            <option :value="null">Select category to delete...</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }} (id: {{ c.id }})</option>
          </select>
          <button @click="deleteByCategory" class="btn-danger" :disabled="!selectedCategoryId">Delete by
            Category</button>
        </div>
        <button @click="deleteSelected" class="btn-danger" :disabled="selectedIds.length === 0">Delete Selected</button>
      </div>
    </div>

    <div class="glass-panel table-container">
      <table>
        <thead>
          <tr>
            <th style="width:40px"><input type="checkbox" @change="toggleSelectAll" :checked="selectAllChecked" /></th>
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
            <td colspan="7" class="text-center">Loading transactions...</td>
          </tr>
          <tr v-else v-for="t in transactions" :key="t.id">
            <td><input type="checkbox" :value="t.id" @change="toggleSelect(t.id)"
                :checked="selectedIds.includes(t.id)" /></td>
            <td>{{ formatDate(t.date) }}</td>
            <td><span class="badge sale">SALE</span></td>
            <td class="amount">{{ formatCurrency(t.total_amount) }}</td>
            <td>
              <span :class="{ 'text-green': t.payment_method === 'cash', 'text-yellow': t.payment_method === 'debt' }">
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
            <td colspan="7" class="text-center">No transactions found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  align-items: center;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
}

.badge.sale {
  background: var(--success);
  color: #000;
}

.text-green {
  color: var(--success);
  font-weight: bold;
}

.text-yellow {
  color: var(--warning);
  font-weight: bold;
}

.tiny {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.amount {
  font-weight: bold;
  font-size: 1.1rem;
}

.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--glass-border);
  color: var(--text-main);
}

.text-center {
  text-align: center;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
