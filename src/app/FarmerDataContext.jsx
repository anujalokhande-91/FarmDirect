import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../api/api'
import { createProduct, deleteProduct as removeProduct, listProducts, updateProduct } from '../api/products'
import { listFarmerOrders, updateFarmerOrderStatus } from '../api/orders'
import { useAuth } from './AuthContext'
import { toSafeNumber } from '../utils/numbers'

const FarmerDataContext = createContext(null)
function toUiProduct(product) {
  return {
    ...product,
    price: toSafeNumber(product.price),
    quantity: toSafeNumber(product.stock),
    stock: toSafeNumber(product.stock),
    status: 'Active',
    location: 'FarmDirect marketplace',
  }
}

function toUiOrder(item) {
  return {
    ...item,
    id: String(item.order_id),
    customer: `Customer #${item.customer_id}`,
    product: item.product?.name || 'Product',
    amount: toSafeNumber(item.subtotal),
    date: new Date(item.created_at).toLocaleDateString(),
  }
}

function countByStatus(items, values) {
  return items.filter((item) => values.includes(item.status)).length
}

export function FarmerDataProvider({ children }) {
  const { currentUser } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [state, setState] = useState({ loading: true, error: '' })

  const refresh = async () => {
    try {
      const [productData, orderData] = await Promise.all([listProducts(), listFarmerOrders()])
      setProducts(productData.map(toUiProduct))
      setOrders(orderData.map(toUiOrder))
      setState({ loading: false, error: '' })
    } catch (error) {
      setState({ loading: false, error: getApiErrorMessage(error, 'Farmer data could not be loaded.') })
    }
  }

  useEffect(() => {
    if (currentUser?.role === 'farmer') refresh()
    else {
      setProducts([])
      setOrders([])
      setState({ loading: false, error: '' })
    }
  }, [currentUser?.id, currentUser?.role])

  const addProduct = async (product) => {
    try {
      const created = await createProduct({
      name: product.name,
      description: product.description,
      price: Number(product.price),
      unit: product.unit,
      category: product.category,
      image_url: product.image_url || null,
      stock: Number(product.quantity),
      })
      setProducts((current) => [...current, toUiProduct(created)])
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'The product could not be saved.'))
    }
  }
  const updateProductRecord = async (id, product) => {
    try {
      const updated = await updateProduct(id, {
      name: product.name,
      description: product.description,
      price: Number(product.price),
      unit: product.unit,
      category: product.category,
      image_url: product.image_url || null,
      stock: Number(product.quantity),
      })
      setProducts((current) => current.map((item) => item.id === id ? toUiProduct(updated) : item))
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'The product could not be saved.'))
    }
  }
  const deleteProduct = async (id) => {
    try {
      await removeProduct(id)
      setProducts((current) => current.filter((product) => product.id !== id))
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'The product could not be removed.'))
    }
  }
  const setOrderStatus = async (id, nextStatus) => {
    try {
      await updateFarmerOrderStatus(id, nextStatus.toLowerCase())
      await refresh()
    } catch (error) {
      const message = getApiErrorMessage(error, 'The order status could not be updated.')
      setState((current) => ({ ...current, error: message }))
      throw new Error(message)
    }
  }

  const summary = useMemo(() => ({
    totalProducts: products.length,
    activeProducts: products.filter((product) => product.stock > 0).length,
    pendingOrders: countByStatus(orders, ['pending', 'confirmed']),
    completedOrders: countByStatus(orders, ['delivered']),
    totalSales: orders.filter((order) => order.status === 'delivered').reduce((sum, order) => sum + order.amount, 0),
  }), [orders, products])

  const value = useMemo(() => ({
    products, orders, summary, loading: state.loading, error: state.error,
    addProduct, updateProduct: updateProductRecord, deleteProduct, updateOrderStatus: setOrderStatus, refresh,
  }), [orders, products, summary, state])
  return <FarmerDataContext.Provider value={value}>{children}</FarmerDataContext.Provider>
}

export const useFarmerData = () => useContext(FarmerDataContext)
