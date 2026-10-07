import api from './api'

export const createOrder = (order) => api.post('/orders', order).then(({ data }) => data)
export const listOrders = () => api.get('/orders').then(({ data }) => data)
export const getOrder = (id) => api.get(`/orders/${id}`).then(({ data }) => data)
export const listFarmerOrders = () => api.get('/farmer/orders').then(({ data }) => data)
export const updateFarmerOrderStatus = (id, status) =>
  api.put(`/farmer/orders/${id}/status`, { status }).then(({ data }) => data)
