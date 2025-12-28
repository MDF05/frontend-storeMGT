<script setup>
import { onMounted, ref, computed } from 'vue';
import { useProductStore } from '../stores/product';
import { useSettingsStore } from '../stores/settings';
import { exportToPDF } from '../utils/pdfExport';
import api from '../utils/api';

const productStore = useProductStore();
const settingsStore = useSettingsStore(); // Init settings store
const showModal = ref(false);
const showCategoryModal = ref(false);

const newProduct = ref({
    name: '',
    sku: '',
    price: 0,
    stock_quantity: 0,
    low_stock_threshold: 10,
    category_id: ''
});

// Watch for settings changes to update the default for new products (optional, but good for UX)
// We will just ensure it's set correctly when opening the modal or after fetch


const newCategory = ref('');
const showRestockModal = ref(false);
const showEditModal = ref(false);
const showHistoryModal = ref(false);
const showBulkModal = ref(false);
const bulkProducts = ref([
    { name: '', sku: '', category_id: '', price: 0, stock_quantity: 0, low_stock_threshold: 10 }
]);

const productHistory = ref([]);
const selectedProductHistory = ref(null);

const restockItem = ref({ id: null, name: '', current_stock: 0, add_quantity: 0 });
const editItem = ref({ id: null, name: '', sku: '', price: 0, stock_quantity: 0, low_stock_threshold: 10, category_id: '' });

const addBulkRow = () => {
    bulkProducts.value.push({ name: '', sku: '', category_id: '', price: 0, stock_quantity: 0, low_stock_threshold: 10 });
};

const removeBulkRow = (index) => {
    if (bulkProducts.value.length > 1) {
        bulkProducts.value.splice(index, 1);
    }
};

const handleBulkAdd = async () => {
    try {
        // Basic validation
        for (const p of bulkProducts.value) {
            if (!p.name || !p.sku || !p.category_id) {
                alert('Please fill in all required fields (Name, SKU, Category) for all rows.');
                return;
            }
        }
        await productStore.addProductsBulk(bulkProducts.value);
        showBulkModal.value = false;
        bulkProducts.value = [{ name: '', sku: '', category_id: '', price: 0, stock_quantity: 0, low_stock_threshold: 10 }]; // Reset
        alert('Products added successfully!');
    } catch (err) {
        alert('Failed to add products: ' + err.message);
    }
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('id-ID');
};

const viewHistory = async (product) => {
    selectedProductHistory.value = product;
    try {
        const res = await api.get(`/history/product/${product.id}`);
        productHistory.value = res.data;
        showHistoryModal.value = true;
    } catch (err) {
        alert('Failed to fetch history');
    }
};

onMounted(async () => {
    await productStore.fetchProducts();
    await productStore.fetchCategories();
    await settingsStore.fetchSettings();
    // Set initial default threshold
    if (settingsStore.defaultLowStockThreshold) {
        newProduct.value.low_stock_threshold = settingsStore.defaultLowStockThreshold;
    }
});

const exportInventory = async () => {
    try {
        const historyRes = await api.get('/history/restocks');
        const restockHistory = historyRes.data;

        const columns = ['Product Name', 'SKU', 'Category', 'Stock', 'Price', 'Last Restocks'];
        const data = productStore.products.map(p => {
            // Filter history for this product
            const pHistory = restockHistory.filter(h => h.product_id === p.id);
            // Take top 3 most recent
            const recent = pHistory.slice(0, 3).map(h =>
                `${formatDate(h.timestamp).split(',')[0]}: +${h.change_amount}`
            ).join('\n');

            return [
                p.name,
                p.sku,
                p.category_name,
                p.stock_quantity,
                formatCurrency(p.price),
                recent || '-'
            ];
        });
        exportToPDF('Inventory_Data', 'Product Inventory List', columns, data, settingsStore);
    } catch (err) {
        console.error(err);
        alert('Failed to generate report with history. Trying basic export...');
        // Fallback
        const columns = ['Product Name', 'SKU', 'Category', 'Stock', 'Price'];
        const data = productStore.products.map(p => [
            p.name, p.sku, p.category_name, p.stock_quantity, formatCurrency(p.price)
        ]);
        exportToPDF('Inventory_Data', 'Product Inventory List', columns, data, settingsStore);
    }
};

const handleAddProduct = async () => {
    await productStore.addProduct(newProduct.value);
    showModal.value = false;
    // Reset form with default threshold from settings
    const defaultThreshold = settingsStore.defaultLowStockThreshold || 10;
    newProduct.value = {
        name: '',
        sku: '',
        price: 0,
        stock_quantity: 0,
        low_stock_threshold: defaultThreshold,
        category_id: ''
    };
    await productStore.fetchProducts();
};

const openEdit = (product) => {
    editItem.value = { ...product };
    // ensure threshold exists or default to 10
    if (!editItem.value.low_stock_threshold) editItem.value.low_stock_threshold = 10;
    showEditModal.value = true;
};

const handleEditProduct = async () => {
    await productStore.updateProduct(editItem.value.id, editItem.value);
    showEditModal.value = false;
    // Refresh products to show updates
    await productStore.fetchProducts();
};

const handleAddCategory = async () => {
    await productStore.addCategory(newCategory.value);
    showCategoryModal.value = false;
    newCategory.value = '';
};

const deleteProduct = async (id) => {
    if (confirm('Are you sure?')) {
        await productStore.deleteProduct(id);
    }
};

const openRestock = (product) => {
    restockItem.value = {
        id: product.id,
        name: product.name,
        current_stock: product.stock_quantity,
        add_quantity: 0
    };
    showRestockModal.value = true;
};

const submitRestock = async () => {
    try {
        const newStock = restockItem.value.current_stock + parseInt(restockItem.value.add_quantity);
        await productStore.updateProduct(restockItem.value.id, {
            stock_quantity: newStock
        });
        showRestockModal.value = false;
        await productStore.fetchProducts(); // Refresh to update alert icons based on new stock/threshold
        alert('Stock updated!');
    } catch (err) {
        alert('Failed to update stock');
    }
};
</script>

<template>
    <div class="inventory fade-in">
        <div class="header">
            <h1>Inventory Management</h1>
            <div class="actions">
                <button @click="exportInventory" class="btn-primary" style="background: var(--text-muted)">📄 Export
                    PDF</button>
                <button @click="showCategoryModal = true" class="btn-primary" style="background: var(--secondary)">+ Add
                    Category</button>
                <button @click="showBulkModal = true" class="btn-primary" style="background: #8b5cf6">++ Bulk
                    Add</button>
                <button @click="showModal = true" class="btn-primary">+ Add Product</button>
            </div>
        </div>

        <!-- Inventory Table -->
        <div class="glass-panel table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product in productStore.products" :key="product.id">
                        <td>{{ product.name }}</td>
                        <td>{{ product.sku }}</td>
                        <td>{{ product.category_name }}</td>
                        <td>{{ formatCurrency(product.price) }}</td>
                        <td :class="{ 'low-stock': product.stock_quantity <= (product.low_stock_threshold || 10) }">
                            {{ product.stock_quantity }}
                            <span v-if="product.stock_quantity <= (product.low_stock_threshold || 10)"
                                class="alert-icon">⚠️</span>
                        </td>
                        <td class="inventory-table-actions">
                            <button class="small btn-primary" @click="openEdit(product)">Edit</button>
                            <button class="small btn-warning" @click="openRestock(product)">Restock</button>
                            <button class="small btn-secondary text-black"
                                @click="viewHistory(product)">History</button>
                            <button class="btn-danger small" @click="deleteProduct(product.id)">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="productStore.products.length === 0">
                        <td colspan="6" class="text-center">No products found.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Add Product Modal -->
        <div v-if="showModal" class="modal-overlay">
            <div class="modal glass-panel">
                <h2>Add New Product</h2>
                <form @submit.prevent="handleAddProduct">
                    <div class="form-group">
                        <label>Name</label>
                        <input v-model="newProduct.name" class="glass-input" required />
                    </div>
                    <div class="form-group">
                        <label>SKU</label>
                        <input v-model="newProduct.sku" class="glass-input" required />
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select v-model="newProduct.category_id" class="glass-input" required>
                            <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}
                            </option>
                        </select>
                    </div>
                    <div class="form-cols">
                        <div class="form-group">
                            <label>Price</label>
                            <input type="number" step="0.01" v-model="newProduct.price" class="glass-input" required />
                        </div>
                        <div class="form-group">
                            <label>Stock</label>
                            <input type="number" v-model="newProduct.stock_quantity" class="glass-input" required />
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Stock Warning Limit</label>
                        <input type="number" v-model="newProduct.low_stock_threshold" class="glass-input" required />
                    </div>

                    <div class="modal-actions">
                        <button type="button" @click="showModal = false" class="btn-danger">Cancel</button>
                        <button type="submit" class="btn-primary">Save Product</button>
                    </div>
                </form>
            </div>
        </div>



        <!-- Restock Modal -->
        <div v-if="showRestockModal" class="modal-overlay">
            <div class="modal glass-panel">
                <h2>Restock Product</h2>
                <p>Product: <strong>{{ restockItem.name }}</strong></p>
                <p>Current Stock: {{ restockItem.current_stock }}</p>

                <form @submit.prevent="submitRestock">
                    <div class="form-group">
                        <label>Add Quantity (Stock In)</label>
                        <input type="number" v-model="restockItem.add_quantity" class="glass-input" min="1" required />
                    </div>
                    <div class="modal-actions">
                        <button type="button" @click="showRestockModal = false" class="btn-danger">Cancel</button>
                        <button type="submit" class="btn-primary">Update Stock</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Edit Product Modal -->
        <div v-if="showEditModal" class="modal-overlay">
            <div class="modal glass-panel">
                <h2>Edit Product</h2>
                <form @submit.prevent="handleEditProduct">
                    <div class="form-group">
                        <label>Name</label>
                        <input v-model="editItem.name" class="glass-input" required />
                    </div>
                    <div class="form-group">
                        <label>SKU</label>
                        <input v-model="editItem.sku" class="glass-input" required />
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select v-model="editItem.category_id" class="glass-input" required>
                            <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}
                            </option>
                        </select>
                    </div>
                    <div class="form-cols">
                        <div class="form-group">
                            <label>Price</label>
                            <input type="number" step="0.01" v-model="editItem.price" class="glass-input" required />
                        </div>
                        <div class="form-group">
                            <label>Stock Warning Limit</label>
                            <input type="number" v-model="editItem.low_stock_threshold" class="glass-input" required />
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" @click="showEditModal = false" class="btn-danger">Cancel</button>
                        <button type="submit" class="btn-primary">Update Product</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Stock History Modal -->
        <div v-if="showHistoryModal" class="modal-overlay">
            <div class="modal glass-panel wide-modal">
                <h2>Stock History: {{ selectedProductHistory?.name }}</h2>
                <div class="history-list">
                    <div v-if="productHistory.length === 0">No history found.</div>
                    <table v-else class="simple-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Change</th>
                                <th>Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="h in productHistory" :key="h.id">
                                <td>{{ formatDate(h.timestamp) }}</td>
                                <td><span class="badge" :class="h.change_type">{{ h.change_type.toUpperCase() }}</span>
                                </td>
                                <td :class="h.change_amount > 0 ? 'text-green' : 'text-red'">
                                    {{ h.change_amount > 0 ? '+' : '' }}{{ h.change_amount }}
                                </td>
                                <td>{{ h.note }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="modal-actions">
                    <button @click="showHistoryModal = false" class="btn-primary">Close</button>
                </div>
            </div>
        </div>

        <!-- Add Category Modal -->
        <div v-if="showCategoryModal" class="modal-overlay">
            <div class="modal glass-panel">
                <h2>Add Category</h2>
                <form @submit.prevent="handleAddCategory">
                    <div class="form-group">
                        <label>Category Name</label>
                        <input v-model="newCategory" class="glass-input" required />
                    </div>
                    <div class="modal-actions">
                        <button type="button" @click="showCategoryModal = false" class="btn-danger">Cancel</button>
                        <button type="submit" class="btn-primary">Save Category</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Bulk Add Modal -->
        <div v-if="showBulkModal" class="modal-overlay">
            <div class="modal glass-panel wide-modal" style="width: 900px;">
                <h2>Bulk Add Products</h2>
                <div class="bulk-container">
                    <table class="simple-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in bulkProducts" :key="index">
                                <td><input v-model="item.name" class="glass-input small-input" placeholder="Name"
                                        required /></td>
                                <td><input v-model="item.sku" class="glass-input small-input" placeholder="SKU"
                                        required /></td>
                                <td>
                                    <select v-model="item.category_id" class="glass-input small-input" required>
                                        <option value="" disabled>Select</option>
                                        <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{
                                            cat.name }}</option>
                                    </select>
                                </td>
                                <td><input type="number" v-model="item.price" class="glass-input small-input"
                                        placeholder="0" required /></td>
                                <td><input type="number" v-model="item.stock_quantity" class="glass-input small-input"
                                        placeholder="0" required /></td>
                                <td>
                                    <button type="button" @click="removeBulkRow(index)" class="btn-danger small"
                                        v-if="bulkProducts.length > 1">X</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <button type="button" @click="addBulkRow" class="btn-secondary small mt-2">+ Add Row</button>
                </div>
                <div class="modal-actions">
                    <button type="button" @click="showBulkModal = false" class="btn-danger">Cancel</button>
                    <button type="button" @click="handleBulkAdd" class="btn-primary">Save All Products</button>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.actions {
    display: flex;
    gap: 1rem;
}

.table-container {
    padding: 1rem;
    overflow-x: auto;
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

th {
    font-weight: 600;
    color: var(--text-muted);
}

.low-stock {
    color: var(--accent);
    font-weight: bold;
}

.text-center {
    text-align: center;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(4px);
}

.modal {
    width: 500px;
    padding: 2rem;
}

.form-group {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
}

select.glass-input option {
    background: #1e293b;
}

.small {
    padding: 4px 8px;
    font-size: 0.8rem;
    margin-right: 5px;
}

.alert-icon {
    margin-left: 5px;
    font-size: 0.8rem;
}

.wide-modal {
    width: 700px;
    max-width: 90vw;
}

.text-green {
    color: #4ade80;
    font-weight: bold;
}

.text-red {
    color: #f87171;
    font-weight: bold;
}

.text-white {
    color: white !important;
}

.badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
    background: #334155;
    color: white;
}

.badge.restock {
    background: #10b981;
}

/* Green */
.badge.sale {
    background: #3b82f6;
}

/* Blue */
.badge.correction {
    background: #f59e0b;
}

/* Orange */
.simple-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
}

.simple-table th,
.simple-table td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.history-list {
    max-height: 400px;
    overflow-y: auto;
}

.small-input {
    padding: 4px;
    font-size: 0.9rem;
    width: 100%;
    box-sizing: border-box;
}

.mt-2 {
    margin-top: 0.5rem;
}

.bulk-container {
    max-height: 60vh;
    overflow-y: auto;
}

@media (max-width: 768px) { 
    .header {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .header .actions {
        display: flex;
        gap: 1rem;
        overflow-x: hidden;
        flex-wrap: wrap;
        flex-direction: row;
    }

    .inventory-table-actions {
        display: flex;
        gap: 1rem;
    }
}
</style>
