import { ArrowLeft, Check, Plus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getProduct } from '../api/products'
import { getApiErrorMessage } from '../api/api'
import { useCart } from '../app/CartContext'
import { useAuth } from '../app/AuthContext'
import { Badge, Button, QuantityStepper } from '../components/ui'
import ProductImage from '../components/ProductImage'

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { currentUser } = useAuth()
  const canOrder = currentUser?.role === 'customer'
  const [product, setProduct] = useState(null)
  const [state, setState] = useState({ loading: true, error: '' })
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    getProduct(productId).then((data) => {
      setProduct(data)
      setState({ loading: false, error: '' })
    }).catch((error) => setState({ loading: false, error: getApiErrorMessage(error, 'Product could not be loaded.') }))
  }, [productId])

  if (state.loading) return <div className="container-page py-24 text-center text-sm text-ink/55">Loading product...</div>
  if (state.error || !product) return <div className="container-page py-24"><h1 className="serif text-5xl">{state.error || 'Product not found'}</h1><Link className="mt-5 inline-block text-leaf underline" to="/shop">Return to shop</Link></div>
  return <section className="container-page py-8 md:py-14"><Link to="/shop" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-leaf"><ArrowLeft size={16}/> Back to shop</Link><div className="grid gap-10 md:grid-cols-2 md:gap-16"><div className="aspect-square bg-[#e8eadf]"><ProductImage className="h-full w-full object-cover" src={product.image} alt={product.name}/></div><div className="flex flex-col justify-center"><Badge>{product.stock > 0 ? 'In stock' : 'Sold out'}</Badge><h1 className="serif mt-5 text-6xl leading-[.95]">{product.name}</h1><p className="mt-4 text-lg text-ink/60">{product.description}</p><div className="mt-8 flex items-end gap-2 border-b border-line pb-6"><span className="text-2xl font-bold">${Number(product.price).toFixed(2)}</span><span className="pb-1 text-sm text-ink/50">{product.unit}</span></div><p className="mt-6 leading-7 text-ink/70">{product.category} · {product.stock} available</p><p className="mt-3 text-sm font-bold text-ink/60">Sold by: {product.farmer?.name || 'FarmDirect farmer'}</p>{canOrder ? <div className="mt-7 flex items-center gap-3"><QuantityStepper quantity={quantity} onChange={(value) => setQuantity(Math.max(1, Math.min(product.stock, value)))} /><Button disabled={product.stock < 1} onClick={() => { addItem(product, quantity); navigate('/cart') }}>Add to basket <Plus size={16}/></Button></div> : <p className="mt-7 rounded-xl bg-oat px-4 py-3 text-sm font-bold text-ink/60">Farmers can browse the marketplace but cannot place customer orders.</p>}<p className="mt-8 flex items-center gap-2 border-t border-line pt-6 text-sm text-ink/60"><Check size={16} className="text-herb"/> Backend inventory is checked again at checkout.</p></div></div></section>
}
