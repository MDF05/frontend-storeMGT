import { defineStore } from 'pinia'
import api from '../utils/api'

export const useAnalyticsStore = defineStore('analytics', {
    state: () => ({
        summary: {},
        dailySales: [],
        topProducts: []
    }),
    actions: {
        async fetchSummary() {
            try {
                const response = await api.get('/analytics/summary')
                this.summary = response.data
            } catch (error) {
                console.error('Error fetching summary:', error)
            }
        },
        async fetchDailySales() {
            try {
                const response = await api.get('/analytics/daily-sales')
                this.dailySales = response.data
            } catch (error) {
                console.error('Error fetching daily sales:', error)
            }
        }
    }
})
