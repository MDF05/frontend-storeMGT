import { defineStore } from 'pinia'
import api from '../utils/api'

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        storeName: 'My Store',
        storeAddress: 'Jakarta, Indonesia',
        defaultLowStockThreshold: 10,
        picName: 'Manager',
        loading: false
    }),

    actions: {
        async fetchSettings() {
            this.loading = true
            try {
                const response = await api.get('/settings/')
                this.storeName = response.data.store_name
                this.storeAddress = response.data.store_address
                this.defaultLowStockThreshold = response.data.default_low_stock_threshold
                this.picName = response.data.pic_name
            } catch (error) {
                console.error('Failed to fetch settings:', error)
            } finally {
                this.loading = false
            }
        },

        async updateSettings(settings) {
            try {
                const response = await api.put('/settings/', {
                    store_name: settings.storeName,
                    store_address: settings.storeAddress,
                    default_low_stock_threshold: settings.defaultLowStockThreshold,
                    pic_name: settings.picName
                })
                this.storeName = response.data.store_name
                this.storeAddress = response.data.store_address
                this.defaultLowStockThreshold = response.data.default_low_stock_threshold
                this.picName = response.data.pic_name
                return true
            } catch (error) {
                console.error('Failed to update settings:', error)
                return false
            }
        }
    }
})
