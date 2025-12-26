import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/products'

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        categories: [],
        loading: false,
        error: null
    }),
    actions: {
        async fetchProducts() {
            this.loading = true
            try {
                // Append slash to avoid 308 redirect
                const response = await axios.get(`${API_URL}/`)
                this.products = response.data
            } catch (err) {
                this.error = err.message
            } finally {
                this.loading = false
            }
        },
        async fetchCategories() {
            try {
                const response = await axios.get(`${API_URL}/categories`)
                this.categories = response.data
            } catch (err) {
                console.error(err)
            }
        },
        async addProduct(productData) {
            try {
                // Append slash to avoid 308 redirect
                const response = await axios.post(`${API_URL}/`, productData)
                this.products.push(response.data)
                return response.data
            } catch (err) {
                this.error = err.message
                throw err
            }
        },
        async addProductsBulk(productsArray) {
            try {
                const response = await axios.post(`${API_URL}/bulk`, productsArray)
                this.products.push(...response.data)
                return response.data
            } catch (err) {
                this.error = err.message
                throw err
            }
        },
        async updateProduct(id, data) {
            try {
                const response = await axios.put(`${API_URL}/${id}`, data)
                const index = this.products.findIndex(p => p.id === id)
                if (index !== -1) {
                    this.products[index] = response.data
                }
                return response.data
            } catch (err) {
                this.error = err.message
                throw err
            }
        },
        async deleteProduct(id) {
            try {
                await axios.delete(`${API_URL}/${id}`)
                this.products = this.products.filter(p => p.id !== id)
            } catch (err) {
                this.error = err.message
            }
        },
        async addCategory(name) {
            try {
                const response = await axios.post(`${API_URL}/categories`, { name })
                this.categories.push(response.data)
            } catch (err) {
                this.error = err.message
            }
        }
    }
})
