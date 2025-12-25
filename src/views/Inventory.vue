<script setup>
import { onMounted, ref, computed } from 'vue';
import { useProductStore } from '../stores/product';

const productStore = useProductStore();
const showModal = ref(false);
const showCategoryModal = ref(false);

const newProduct = ref({
    name: '',
    sku: '',
    price: 0,
    stock_quantity: 0,
    category_id: ''
});

const newCategory = ref('');

onMounted(async () => {
    await productStore.fetchProducts();
    await productStore.fetchCategories();
});

const handleAddProduct = async () => {
    await productStore.addProduct(newProduct.value);
    showModal.value = false;
    newProduct.value = { name: '', sku: '', price: 0, stock_quantity: 0, category_id: '' };
};

const handleAddCategory = async () => {
    await productStore.addCategory(newCategory.value);
    showCategoryModal.value = false;
    newCategory.value = '';
};

const deleteProduct = async (id) => {
    if(confirm('Are you sure?')) {
        await productStore.deleteProduct(id);
    }
};
</script>

<template>
  <div class="inventory fade-in">
    <div class="header">
      <h1>Inventory Management</h1>
      <div class="actions">
        <button @click="showCategoryModal = true" class="btn-primary" style="background: var(--secondary)">+ Add Category</button>
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
            <td>${{ product.price }}</td>
            <td :class="{'low-stock': product.stock_quantity < 10}">{{ product.stock_quantity }}</td>
            <td>
                <button class="btn-danger" @click="deleteProduct(product.id)">Delete</button>
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
                    <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
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
            <div class="modal-actions">
                <button type="button" @click="showModal = false" class="btn-danger">Cancel</button>
                <button type="submit" class="btn-primary">Save Product</button>
            </div>
        </form>
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
th, td {
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
.text-center { text-align: center; }

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7);
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
</style>
