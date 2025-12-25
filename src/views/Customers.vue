<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';

const customers = ref([]);
const showModal = ref(false);
const newCustomer = ref({ name: '', email: '', phone: '' });

const fetchCustomers = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/customers/');
        customers.value = res.data;
    } catch (err) {
        console.error(err);
    }
};

const addCustomer = async () => {
    try {
        await axios.post('http://localhost:5000/api/customers/', newCustomer.value);
        showModal.value = false;
        newCustomer.value = { name: '', email: '', phone: '' };
        fetchCustomers();
    } catch (err) {
        alert('Error adding customer');
    }
};

const deleteCustomer = async (id) => {
    if(!confirm('Delete customer?')) return;
    try {
        await axios.delete(`http://localhost:5000/api/customers/${id}`);
        fetchCustomers();
    } catch (err) {
        console.error(err);
    }
};

const showPaymentModal = ref(false);
const showHistoryModal = ref(false);
const selectedCustomer = ref({});
const paymentAmount = ref(0);
const debtHistory = ref([]);

const openPayment = (c) => {
    selectedCustomer.value = c;
    paymentAmount.value = 0;
    showPaymentModal.value = true;
};

const submitPayment = async () => {
    try {
        await axios.post(`http://localhost:5000/api/customers/${selectedCustomer.value.id}/pay_debt`, {
            amount: paymentAmount.value
        });
        alert('Payment Recorded');
        showPaymentModal.value = false;
        fetchCustomers();
    } catch (err) {
        alert(err.response?.data?.error || 'Payment failed');
    }
};

const viewHistory = async (c) => {
    selectedCustomer.value = c;
    try {
        const res = await axios.get(`http://localhost:5000/api/customers/${c.id}/debt_history`);
        debtHistory.value = res.data;
        showHistoryModal.value = true;
    } catch (err) {
        console.error(err);
    }
};

onMounted(fetchCustomers);
</script>

<template>
  <div class="customers fade-in">
    <div class="header">
      <h1>Customer Management (CRM)</h1>
      <button @click="showModal = true" class="btn-primary">+ Add Customer</button>
    </div>

    <div class="glass-panel table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Points</th>
            <th>Total Debt</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in customers" :key="c.id">
            <td>{{ c.name }}</td>
            <td>{{ c.email }}</td>
            <td>{{ c.phone }}</td>
            <td><span class="badge">{{ c.points }}</span></td>
            <td>
                <span :class="{'text-red': c.total_debt > 0, 'text-green': c.total_debt <= 0}">
                    ${{ c.total_debt || 0 }}
                </span>
            </td>
            <td class="actions-cell">
                <button class="small" @click="viewHistory(c)">History</button>
                <button v-if="c.total_debt > 0" class="small btn-primary" @click="openPayment(c)">Pay</button>
                <button class="btn-danger small" @click="deleteCustomer(c.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal glass-panel">
        <h2>New Customer</h2>
        <form @submit.prevent="addCustomer">
            <div class="form-group">
                <label>Name</label>
                <input v-model="newCustomer.name" class="glass-input" required />
            </div>
            <div class="form-group">
                <label>Email</label>
                <input v-model="newCustomer.email" type="email" class="glass-input" />
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input v-model="newCustomer.phone" class="glass-input" />
            </div>
            <div class="modal-actions">
                <button type="button" @click="showModal = false" class="btn-danger">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="modal-overlay">
        <div class="modal glass-panel">
            <h2>Record Payment</h2>
            <p>Customer: {{ selectedCustomer.name }}</p>
            <p>Current Debt: ${{ selectedCustomer.total_debt }}</p>
            
            <div class="form-group">
                <label>Payment Amount</label>
                <input type="number" v-model="paymentAmount" class="glass-input" step="0.01" />
            </div>
            
            <div class="modal-actions">
                <button @click="showPaymentModal = false" class="btn-danger">Cancel</button>
                <button @click="submitPayment" class="btn-primary">Submit Payment</button>
            </div>
        </div>
    </div>

    <!-- History Modal -->
    <div v-if="showHistoryModal" class="modal-overlay">
        <div class="modal glass-panel wide-modal">
            <h2>Debt History: {{ selectedCustomer.name }}</h2>
            <div class="history-list">
                <div v-if="debtHistory.length === 0">No history found.</div>
                <div v-for="rec in debtHistory" :key="rec.id" class="history-item">
                    <div class="row">
                        <span>{{ new Date(rec.date).toLocaleDateString() }}</span>
                        <span :class="rec.type === 'debt' ? 'text-red' : 'text-green'">{{ rec.type.toUpperCase() }}</span>
                    </div>
                    <div class="row">
                        <small>{{ rec.description }}</small>
                        <strong>${{ rec.amount }}</strong>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button @click="showHistoryModal = false">Close</button>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
.badge { background: var(--secondary); padding: 2px 8px; border-radius: 12px; font-size: 0.9rem; color: #000; font-weight: bold; }
.small { padding: 4px 8px; font-size: 0.8rem; }
/* Reuse table/modal styles from Inventory or Global */
.table-container { padding: 1rem; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--glass-border); color: var(--text-main); }
th { font-weight: 600; color: var(--text-muted); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
.modal { width: 400px; padding: 2rem; }
.form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.text-red { color: #f87171; font-weight: bold; }
.text-green { color: #4ade80; font-weight: bold; }
.actions-cell { display: flex; gap: 0.5rem; }
.wide-modal { width: 600px; }
.history-item { padding: 0.5rem; border-bottom: 1px solid var(--glass-border); }
.history-item .row { display: flex; justify-content: space-between; }
</style>
