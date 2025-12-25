import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/analytics'

export const useAnalyticsStore = defineStore('analytics', {
    state: () => ({
        summary: {},
        dailySales: [],
        topProducts: []
    }),
    actions: {
        async fetchSummary() {
            try {
                const response = await axios.get(`${API_URL}/summary`)
                this.summary = response.data
            } catch (error) {
                console.error('Error fetching summary:', error)
            }
        },
        async fetchDailySales() {
            try {
                const response = await axios.get(`${API_URL}/daily-sales`)
                this.dailySales = response.data
            } catch (error) {
                console.error('Error fetching daily sales:', error)
            }
        }
    }
})
