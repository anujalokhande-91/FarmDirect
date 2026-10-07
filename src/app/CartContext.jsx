import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'farmdirect.cart'
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
      return Array.isArray(value) ? value : []
    } catch {
      return []
    }
  })
  const persist = (next) => {
    setItems(next)
    localStorage.setItem(CART_KEY, JSON.stringify(next))
  }
  const addItem = (product, quantity = 1) => setItems((current) => {
    const productId = typeof product === 'object' ? product.id : product
    const found = current.find((item) => item.productId === productId)
    const next = found
      ? current.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + quantity, product: typeof product === 'object' ? product : item.product } : item)
      : [...current, { productId, quantity, product: typeof product === 'object' ? product : null }]
    localStorage.setItem(CART_KEY, JSON.stringify(next))
    return next
  })
  const updateQuantity = (productId, quantity) => {
    const next = quantity < 1 ? items.filter((item) => item.productId !== productId) : items.map((item) => item.productId === productId ? { ...item, quantity } : item)
    persist(next)
  }
  const removeItem = (productId) => updateQuantity(productId, 0)
  const clearCart = () => persist([])
  const cartItems = useMemo(() => items.filter((item) => item.product), [items])
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
  return <CartContext.Provider value={{ cartItems, count, subtotal, addItem, updateQuantity, removeItem, clearCart }}>{children}</CartContext.Provider>
}
export const useCart = () => useContext(CartContext)