<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProductStore } from '../stores/product';
import api from '../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSettingsStore } from '../stores/settings';

const productStore = useProductStore();
const settingsStore = useSettingsStore();

const searchQuery = ref('');
const selectedProduct = ref(null);
const history = ref([]);
const loading = ref(false);

const filteredProducts = computed(() => {
    if (!searchQuery.value) return [];
    return productStore.products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
    ).slice(0, 10); // Limit to 10 suggestions
});

const stats = computed(() => {
    if (!history.value.length) return { sold: 0, restocked: 0, current: 0 };
    
    let sold = 0;
    let restocked = 0;
    
    history.value.forEach(h => {
        if (h.change_type === 'sale') {
            sold += Math.abs(h.change_amount);
        } else if (h.change_type === 'restock' || h.change_type === 'initial') {
            restocked += h.change_amount;
        }
    });

    return {
        sold,
        restocked,
        current: selectedProduct.value?.stock_quantity || 0
    };
});

const selectProduct = async (product) => {
    selectedProduct.value = product;
    searchQuery.value = ''; // Clear search
    await fetchHistory(product.id);
};

const fetchHistory = async (id) => {
    loading.value = true;
    try {
        const res = await api.get(`/history/product/${id}`);
        history.value = res.data;
    } catch (e) {
        console.error(e);
        alert('Failed to fetch history');
    } finally {
        loading.value = false;
    }
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Reuse PDF logic manually or import if refactored
const exportHistoryPDF = () => {
    const doc = new jsPDF();
    const config = settingsStore; 
    
    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(config.storeName || "My Store", 105, 15, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(config.storeAddress || "", 105, 22, { align: "center" });

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Product Tracking: ${selectedProduct.value.name}`, 14, 35);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal"); 
    doc.text(`SKU: ${selectedProduct.value.sku}`, 14, 42);
    doc.text(`Current Stock: ${selectedProduct.value.stock_quantity}`, 14, 47);

    // Table
    const columns = ["Date", "Type", "Change", "Note"];
    const rows = history.value.map(h => [
        formatDate(h.timestamp),
        h.change_type.toUpperCase(),
        h.change_amount > 0 ? `+${h.change_amount}` : h.change_amount,
        h.note || '-'
    ]);

    autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66] }
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    const rightMargin = 180;
    
    // Signature
    doc.text(`Dibuat Oleh,`, rightMargin - 20, finalY, { align: 'center' });
    doc.line(rightMargin - 40, finalY + 25, rightMargin, finalY + 25);
    doc.text(`( ${config.picName || 'Manager'} )`, rightMargin - 20, finalY + 30, { align: 'center' });

    doc.save(`Tracking_${selectedProduct.value.sku}.pdf`);
};

onMounted(() => {
    productStore.fetchProducts();
    settingsStore.fetchSettings();
});
</script>

<template>
    <div class="tracking fade-in">
        <div class="header">
            <h1>🔍 Product Tracking</h1>
            <p>Track history and movements of specific items.</p>
        </div>

        <!-- Search Section -->
        <div class="glass-panel" style="margin-bottom: 2rem;">
            <div class="search-box">
                <input 
                    v-model="searchQuery" 
                    class="glass-input large-search" 
                    placeholder="Search product by Name or SKU..."
                />
                <div v-if="searchQuery && filteredProducts.length" class="dropdown-results">
                    <div 
                        v-for="product in filteredProducts" 
                        :key="product.id" 
                        class="result-item" 
                        @click="selectProduct(product)"
                    >
                        <strong>{{ product.name }}</strong> 
                        <span class="text-muted">({{ product.sku }})</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Selected Product View -->
        <div v-if="selectedProduct" class="product-details fade-in">
            <div class="stats-grid">
                <div class="stat-card glass-panel" style="border-left: 4px solid var(--primary);">
                    <h3>Current Stock</h3>
                    <p class="stat-value">{{ stats.current }}</p>
                </div>
                <div class="stat-card glass-panel" style="border-left: 4px solid #10b981;">
                    <h3>Total In (Restock)</h3>
                    <p class="stat-value text-success">+{{ stats.restocked }}</p>
                </div>
                <div class="stat-card glass-panel" style="border-left: 4px solid #ef4444;">
                    <h3>Total Out (Sold)</h3>
                    <p class="stat-value text-danger">-{{ stats.sold }}</p>
                </div>
                <div class="stat-card glass-panel price-card">
                    <h3>Price</h3>
                    <p class="stat-value">{{ formatCurrency(selectedProduct.price) }}</p>
                </div>
            </div>

            <div class="glass-panel mt-4">
                <div class="flex justify-between items-center mb-4">
                    <h2>History Log: {{ selectedProduct.name }}</h2>
                    <button @click="exportHistoryPDF" class="btn-primary">📄 Export PDF</button>
                </div>
                
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Change</th>
                            <th>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="h in history" :key="h.id">
                            <td>{{ formatDate(h.timestamp) }}</td>
                            <td>
                                <span :class="['badge', h.change_type]">
                                    {{ h.change_type.toUpperCase() }}
                                </span>
                            </td>
                            <td :class="h.change_amount > 0 ? 'text-success' : 'text-danger'">
                                {{ h.change_amount > 0 ? '+' : '' }}{{ h.change_amount }}
                            </td>
                            <td>{{ h.note }}</td>
                        </tr>
                        <tr v-if="history.length === 0">
                            <td colspan="4" class="text-center">No history found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div v-else class="text-center text-muted mt-4">
            <p>Select a product to view its tracking details.</p>
        </div>
    </div>
</template>

<style scoped>
.header { margin-bottom: 2rem; }
.header p { color: var(--text-muted); }

.search-box { position: relative; max-width: 600px; margin: 0 auto; }
.large-search { font-size: 1.2rem; padding: 1rem; width: 100%; border-radius: 12px; }

.dropdown-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(30, 41, 59, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0 0 12px 12px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
}

.result-item {
    padding: 1rem;
    cursor: pointer;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: background 0.2s;
}
.result-item:hover { background: rgba(255, 255, 255, 0.1); }
.text-muted { color: #94a3b8; font-size: 0.9rem; }

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}
.stat-card { padding: 1.5rem; }
.stat-card h3 { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem; }
.stat-value { font-size: 2rem; font-weight: bold; }
.text-success { color: #10b981; }
.text-danger { color: #ef4444; }

.history-table { width: 100%; border-collapse: collapse; }
.history-table th, .history-table td { padding: 1rem; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.history-table th { color: var(--text-muted); font-weight: 600; }

.badge { padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; }
.badge.restock { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.badge.initial { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.badge.sale { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.badge.correction { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }

.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.mb-4 { margin-bottom: 1rem; }
.mt-4 { margin-top: 1rem; }
.text-center { text-align: center; }
</style>
