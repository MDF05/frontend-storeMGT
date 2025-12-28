import { defineStore } from 'pinia'
import api from '../utils/api'

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
                const response = await api.get('/products/')
                this.products = response.data
            } catch (err) {
                this.error = err.message
            } finally {
                this.loading = false
            }
        },
        async fetchCategories() {
            try {
                const response = await api.get('/products/categories')
                this.categories = response.data
            } catch (err) {
                console.error(err)
            }
        },
        async addProduct(productData) {
            try {
                // Append slash to avoid 308 redirect
                const response = await api.post('/products/', productData)
                this.products.push(response.data)
                return response.data
            } catch (err) {
                this.error = err.message
                throw err
            }
        },
        async addProductsBulk(productsArray) {
            try {
                const response = await api.post('/products/bulk', productsArray)
                this.products.push(...response.data)
                return response.data
            } catch (err) {
                this.error = err.message
                throw err
            }
        },
        async updateProduct(id, data) {
            try {
                const response = await api.put(`/products/${id}`, data)
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
                await api.delete(`/products/${id}`)
                this.products = this.products.filter(p => p.id !== id)
            } catch (err) {
                this.error = err.message
            }
        },
        async addCategory(name) {
            try {
                const response = await api.post('/products/categories', { name })
                this.categories.push(response.data)
            } catch (err) {
                this.error = err.message
            }
        }
    }
})
