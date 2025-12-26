<script setup>
import { onMounted, ref } from 'vue';
import { useSettingsStore } from '../stores/settings';

const settingsStore = useSettingsStore();
const form = ref({
    storeName: '',
    storeAddress: '',
    defaultLowStockThreshold: 10
});
const isSaving = ref(false);

onMounted(async () => {
    await settingsStore.fetchSettings();
    form.value.storeName = settingsStore.storeName;
    form.value.storeAddress = settingsStore.storeAddress;
    form.value.defaultLowStockThreshold = settingsStore.defaultLowStockThreshold;
});

const handleSave = async () => {
    isSaving.value = true;
    const success = await settingsStore.updateSettings(form.value);
    isSaving.value = false;
    if (success) {
        alert('Settings saved!');
    } else {
        alert('Failed to save settings.');
    }
};
</script>

<template>
    <div class="settings fade-in">
        <div class="header">
            <h1>⚙️ Settings</h1>
            <p>Configure your store details and preferences.</p>
        </div>

        <div class="glass-panel form-container">
            <form @submit.prevent="handleSave">
                <div class="form-group">
                    <label>Store Name (Nama Toko)</label>
                    <input v-model="form.storeName" class="glass-input" required placeholder="e.g. Toko Makmur Jaya" />
                </div>
                
                <div class="form-group">
                    <label>Store Address (Alamat / Domisili)</label>
                    <textarea v-model="form.storeAddress" class="glass-input" rows="3" required placeholder="e.g. Jakarta, Indonesia"></textarea>
                    <small>Used for PDF Report Header and Signature logic.</small>
                </div>

                <div class="form-group">
                    <label>Default Low Stock Threshold</label>
                    <input type="number" v-model="form.defaultLowStockThreshold" class="glass-input" min="1" required />
                    <small>Default warning limit when adding new products.</small>
                </div>

                <div class="actions">
                    <button type="submit" class="btn-primary" :disabled="isSaving">
                        {{ isSaving ? 'Saving...' : 'Save Changes' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.header { margin-bottom: 2rem; }
.header p { color: var(--text-muted); }
.form-container { max-width: 600px; padding: 2rem; }
.form-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
textarea.glass-input { resize: vertical; }
small { color: var(--text-muted); font-size: 0.85rem; }
.actions { display: flex; justify-content: flex-end; }
</style>
