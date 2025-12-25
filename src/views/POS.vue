<script setup>
import { onMounted, ref, computed } from 'vue';
import { useProductStore } from '../stores/product';
import axios from 'axios';

const productStore = useProductStore();
const cart = ref([]);
const searchQuery = ref('');
const customers = ref([]);
const selectedCustomerId = ref('');
const showPaymentModal = ref(false);
const paidAmount = ref(0);

onMounted(async () => {
    await productStore.fetchProducts();
    fetchCustomers();
});

const fetchCustomers = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/customers/');
        customers.value = res.data;
    } catch (err) {
        console.error("Failed to fetch customers", err);
    }
};

const filteredProducts = computed(() => {
    return productStore.products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const addToCart = (product) => {
    if (product.stock_quantity <= 0) return;
    
    const existing = cart.value.find(item => item.product_id === product.id);
    if (existing) {
        if (existing.quantity < product.stock_quantity) {
            existing.quantity++;
        }
    } else {
        cart.value.push({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            max_stock: product.stock_quantity
        });
    }
};

const removeFromCart = (index) => {
    cart.value.splice(index, 1);
};

const cartTotal = computed(() => {
    return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
});

const openCheckout = () => {
    if (cart.value.length === 0) return;
    paidAmount.value = parseFloat(cartTotal.value);
    showPaymentModal.value = true;
};

const processSale = async () => {
    const total = parseFloat(cartTotal.value);
    const paid = parseFloat(paidAmount.value);
    const debt = total - paid;
    
    if (debt > 0.01 && !selectedCustomerId.value) {
        alert('Please select a customer for debt transaction');
        return;
    }

    let method = 'cash';
    if (debt > 0.01) method = 'debt';

    try {
        await axios.post('http://localhost:5000/api/sales/', {
            items: cart.value.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            })),
            customer_id: selectedCustomerId.value || null,
            paid_amount: paid,
            payment_method: method
        });
        
        alert('Transaction Successful!');
        showPaymentModal.value = false;
        cart.value = [];
        selectedCustomerId.value = '';
        await productStore.fetchProducts(); // Refresh stock
    } catch (err) {
        alert('Transaction Failed: ' + (err.response?.data?.error || err.message));
    }
};
</script>

<template>
  <div class="pos-container fade-in">
    <!-- Product Grid -->
    <div class="products-section">
      <div class="search-bar">
        <input v-model="searchQuery" placeholder="Search products..." class="glass-input" style="width: 100%" />
      </div>
      
      <div class="products-grid">
        <div 
            v-for="product in filteredProducts" 
            :key="product.id" 
            class="product-card glass-panel"
            @click="addToCart(product)"
            :class="{'out-of-stock': product.stock_quantity <= 0}"
        >
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="sku">{{ product.sku }}</p>
            <div class="price-stock">
                <span class="price">${{ product.price }}</span>
                <span class="stock">Stats: {{ product.stock_quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart -->
    <div class="cart-section glass-panel">
      <h2>Current Order</h2>
      
      <div class="cart-items">
        <div v-for="(item, index) in cart" :key="item.product_id" class="cart-item">
            <div class="item-details">
                <h4>{{ item.name }}</h4>
                <p>${{ item.price }} x {{ item.quantity }}</p>
            </div>
            <div class="item-actions">
                <button @click="removeFromCart(index)" class="btn-danger small">x</button>
            </div>
        </div>
        <div v-if="cart.length === 0" class="empty-cart">
            Cart is empty
        </div>
      </div>

      <div class="cart-footer">
        <div class="total">
            <span>Total:</span>
            <span>${{ cartTotal }}</span>
        </div>
        <button class="btn-primary checkout-btn" @click="openCheckout" :disabled="cart.length === 0">
            Post / Checkout
        </button>
      </div>
    </div>

    <!-- Payment/Post Modal -->
    <Teleport to="body">
        <div v-if="showPaymentModal" class="modal-overlay">
            <div class="modal glass-panel">
                <h2>Process Transaction</h2>
                <div class="form-group">
                    <label>Customer (Optional for Cash)</label>
                    <select v-model="selectedCustomerId" class="glass-input">
                        <option value="">Guest / Walk-in</option>
                        <option v-for="c in customers" :key="c.id" :value="c.id">
                            {{ c.name }} (Debt: ${{ c.total_debt || 0 }})
                        </option>
                    </select>
                </div>
                
                <div class="summary-row">
                    <h3>Total: ${{ cartTotal }}</h3>
                </div>

                <div class="form-group">
                    <label>Amount Paid</label>
                    <input type="number" v-model="paidAmount" class="glass-input" step="0.01" />
                </div>

                <div class="debt-alert" v-if="parseFloat(cartTotal) - parseFloat(paidAmount) > 0.01">
                    <p class="warning">⚠️ Remaining ${{ (parseFloat(cartTotal) - parseFloat(paidAmount)).toFixed(2) }} will be recorded as DEBT.</p>
                </div>

                <div class="modal-actions">
                    <button class="btn-danger" @click="showPaymentModal = false">Cancel</button>
                    <button class="btn-primary" @click="processSale">Post Transaction</button>
                </div>
            </div>
        </div>
    </Teleport>
  </div>
</template>

<style scoped>
.pos-container {
    display: flex;
    gap: 2rem;
    height: calc(100vh - 4rem);
}
.products-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
}
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
    padding-bottom: 2rem;
}
.product-card {
    padding: 1rem;
    cursor: pointer;
    transition: transform 0.2s;
    border: 1px solid transparent;
}
.product-card:hover {
    transform: translateY(-5px);
    border-color: var(--primary);
}
.product-card.out-of-stock {
    opacity: 0.5;
    pointer-events: none;
}
.product-info h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
.sku { font-size: 0.8rem; color: var(--text-muted); }
.price-stock {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    font-weight: 600;
}
.price { color: var(--primary); }
.stock { color: var(--secondary); font-size: 0.9rem; }

/* Cart */
.cart-section {
    width: 350px;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
}
.cart-items {
    flex: 1;
    overflow-y: auto;
    margin: 1rem 0;
}
.cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--glass-border);
}
.cart-item h4 { margin: 0; font-size: 1rem; }
.cart-item p { margin: 0; color: var(--text-muted); font-size: 0.9rem; }
.small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
.empty-cart { text-align: center; color: var(--text-muted); margin-top: 2rem; }

.cart-footer {
    border-top: 1px solid var(--glass-border);
    padding-top: 1rem;
}
.total {
    display: flex;
    justify-content: space-between;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
}
.checkout-btn {
    width: 100%;
    padding: 1rem;
    font-size: 1.2rem;
}
.checkout-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
}
.modal {
    width: 450px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}
.debt-alert p {
    color: #fbbf24;
    font-size: 0.9rem;
    margin: 0;
}
/* Select Styling */
select.glass-input option {
    background: #1e293b;
    color: white;
}
</style>
