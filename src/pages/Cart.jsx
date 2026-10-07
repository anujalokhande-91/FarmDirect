import { ArrowLeft, ArrowRight, CheckCircle2, ShoppingBasket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../app/CartContext'
import { useAuth } from '../app/AuthContext'
import { Button, CartLineItem } from '../components/ui'
import { createOrder } from '../api/orders'
import { getApiErrorMessage } from '../api/api'
import { useState } from 'react'

export default function Cart() {
  const { cartItems, subtotal, clearCart } = useCart()
  const { currentUser } = useAuth()
  const [address, setAddress] = useState('')
  const [state, setState] = useState({ loading: false, error: '', success: '' })
  const placeOrder = async () => {
    if (!address.trim()) return setState({ loading: false, error: 'Enter a delivery address before placing your order.', success: '' })
    setState({ loading: true, error: '', success: '' })
    try {
      await createOrder({ delivery_address: address.trim(), items: cartItems.map(({ productId, quantity }) => ({ product_id: productId, quantity })) })
      clearCart()
      setState({ loading: false, error: '', success: 'Your order was placed successfully.' })
    } catch (error) {
      setState({ loading: false, error: getApiErrorMessage(error, 'Your order could not be placed.'), success: '' })
    }
    if (currentUser?.role === 'farmer') {
      return <section className="container-page py-24 text-center"><h1 className="serif text-6xl">Customer checkout only.</h1><p className="mx-auto mt-4 max-w-md text-ink/60">Farmers can browse the marketplace, but customer ordering is restricted to customer accounts.</p><Button to="/" className="mt-8">Browse marketplace <ArrowRight size={16} /></Button></section>
    }
  }
  if (!cartItems.length) return <section className="container-page py-24 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-leaf"><ShoppingBasket size={25}/></div><h1 className="serif mt-7 text-6xl">{state.success || 'Your basket is empty.'}</h1><p className="mx-auto mt-4 max-w-sm text-ink/60">Fill it with something delicious from the farms and makers in our marketplace.</p><Button to="/shop" className="mt-8">Browse the harvest <ArrowRight size={16}/></Button></section>
  return <section className="container-page py-12 md:py-20"><Link to="/shop" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-leaf"><ArrowLeft size={16}/> Continue shopping</Link><div className="grid gap-12 lg:grid-cols-[1.25fr_.75fr]"><div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-clay">Your basket</p><h1 className="serif text-6xl leading-none">Good choices.</h1><p className="mt-4 text-sm text-ink/55">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} from local producers</p><div className="mt-8">{cartItems.map((item) => <CartLineItem key={item.productId} item={item}/>)}</div></div><aside className="h-fit bg-white p-6 shadow-soft md:p-8"><h2 className="serif text-3xl">Order summary</h2><label className="mt-6 block text-sm font-bold">Delivery address<input className="mt-2 min-h-12 w-full border border-line bg-oat px-3 font-normal outline-none focus:border-leaf" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Street, city, postal code" /></label>{state.error && <p className="mt-4 rounded-xl bg-[#f8e8df] px-3 py-2 text-sm font-bold text-clay">{state.error}</p>}<div className="mt-7 space-y-4 border-b border-line pb-6 text-sm"><div className="flex justify-between"><span className="text-ink/55">Subtotal</span><span className="font-bold">${subtotal.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-ink/55">Delivery</span><span className="font-bold text-herb">Free</span></div></div><div className="flex justify-between py-5 text-lg font-bold"><span>Total</span><span>${subtotal.toFixed(2)}</span></div><button onClick={placeOrder} disabled={state.loading} className="flex min-h-12 w-full items-center justify-center gap-2 bg-leaf text-sm font-bold text-white disabled:bg-ink/20">{state.loading ? 'Placing order...' : 'Place order'}</button><p className="mt-4 flex gap-2 text-xs leading-5 text-ink/50"><CheckCircle2 className="shrink-0 text-herb" size={15}/> Prices and stock are confirmed by the backend.</p></aside></div></section>
}