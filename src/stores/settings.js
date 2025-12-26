import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/settings'

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        storeName: 'My Store',
        storeAddress: 'Jakarta, Indonesia',
        defaultLowStockThreshold: 10,
        loading: false
    }),

    actions: {
        async fetchSettings() {
            this.loading = true
            try {
                const response = await axios.get(`${API_URL}/`)
                this.storeName = response.data.store_name
                this.storeAddress = response.data.store_address
                this.defaultLowStockThreshold = response.data.default_low_stock_threshold
            } catch (error) {
                console.error('Failed to fetch settings:', error)
            } finally {
                this.loading = false
            }
        },

        async updateSettings(settings) {
            try {
                const response = await axios.put(`${API_URL}/`, {
                    store_name: settings.storeName,
                    store_address: settings.storeAddress,
                    default_low_stock_threshold: settings.defaultLowStockThreshold
                })
                this.storeName = response.data.store_name
                this.storeAddress = response.data.store_address
                this.defaultLowStockThreshold = response.data.default_low_stock_threshold
                return true
            } catch (error) {
                console.error('Failed to update settings:', error)
                return false
            }
        }
    }
})
