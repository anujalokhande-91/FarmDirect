import api from './api'

const mapProduct = (product) => ({ ...product, image: product.image_url || '' })

export const listProducts = () => api.get('/products').then(({ data }) => data.map(mapProduct))
export const getProduct = (id) => api.get(`/products/${id}`).then(({ data }) => mapProduct(data))
export const createProduct = (product) => api.post('/products', product).then(({ data }) => mapProduct(data))
export const updateProduct = (id, product) => api.put(`/products/${id}`, product).then(({ data }) => mapProduct(data))
export const deleteProduct = (id) => api.delete(`/products/${id}`)
