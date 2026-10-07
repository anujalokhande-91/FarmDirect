import { Link } from 'react-router-dom'
import { ArrowRight, Minus, Plus, ShoppingBasket, Trash2 } from 'lucide-react'
import { useCart } from '../app/CartContext'
import { useAuth } from '../app/AuthContext'
import ProductImage from './ProductImage'

export function Button({ children, to, variant = 'primary', className = '', ...props }) {
  const classes = `inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm font-bold transition ${variant === 'primary' ? 'bg-leaf text-white hover:bg-ink' : 'border border-leaf text-leaf hover:bg-leaf hover:text-white'} ${className}`
  return to ? <Link className={classes} to={to}>{children}</Link> : <button className={classes} {...props}>{children}</button>
}

export function Badge({ children }) {
  return <span className="inline-flex bg-oat px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-leaf">{children}</span>
}

export function ProductCard({ product }) {
  const { addItem } = useCart()
  const { currentUser } = useAuth()
  const canOrder = currentUser?.role === 'customer'
  return <article className="group flex h-full flex-col">
    <Link to={`/products/${product.id}`} className="block">
      <div className="relative aspect-[4/4.5] overflow-hidden bg-[#e8eadf]"><ProductImage className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={product.image} alt={product.name} /><div className="absolute left-3 top-3 flex gap-1.5"><Badge>{product.stock > 0 ? 'In stock' : 'Sold out'}</Badge></div></div>
      <div className="pt-4"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-ink group-hover:text-leaf">{product.name}</h3><p className="shrink-0 text-sm font-bold text-ink">${Number(product.price).toFixed(2)}</p></div><p className="mt-1 text-sm text-ink/55">{product.category} · {product.unit}</p><p className="mt-2 text-xs text-ink/55">{product.stock} available</p><p className="mt-2 text-xs font-bold text-ink/55">Sold by: {product.farmer?.name || 'FarmDirect farmer'}</p></div>
    </Link>
    <div className="mt-auto flex gap-2 pt-4"><Link to={`/products/${product.id}`} className="inline-flex min-h-11 flex-1 items-center justify-center border border-line px-3 text-xs font-bold text-ink/65 transition hover:border-leaf hover:text-leaf">View Details</Link>{canOrder && <button disabled={product.stock < 1} onClick={() => addItem(product)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 bg-leaf px-3 text-xs font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-ink/20"><ShoppingBasket size={15} /> {product.stock < 1 ? 'Sold out' : 'Add to Cart'}</button>}</div>
  </article>
}

export function QuantityStepper({ quantity, onChange }) {
  return <div className="inline-flex h-11 items-center border border-line bg-white"><button className="grid h-full w-10 place-items-center text-ink/60 transition hover:text-leaf" onClick={() => onChange(quantity - 1)} aria-label="Decrease quantity"><Minus size={15} /></button><span className="w-7 text-center text-sm font-bold">{quantity}</span><button className="grid h-full w-10 place-items-center text-ink/60 transition hover:text-leaf" onClick={() => onChange(quantity + 1)} aria-label="Increase quantity"><Plus size={15} /></button></div>
}

export function ProductGrid({ products }) {
  return products.length ? <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="col-span-full py-20 text-center"><p className="serif text-3xl">Nothing in this harvest</p><p className="mt-2 text-sm text-ink/55">Try a different search or category.</p></div>
}

export function SectionHeading({ eyebrow, title, link }) {
  return <div className="mb-8 flex items-end justify-between gap-4"><div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-clay">{eyebrow}</p><h2 className="serif text-4xl leading-none text-ink md:text-5xl">{title}</h2></div>{link && <Link className="hidden items-center gap-2 text-sm font-bold text-leaf hover:text-clay sm:flex" to={link.to}>{link.label}<ArrowRight size={16} /></Link>}</div>
}

export function CartLineItem({ item }) {
  const { updateQuantity, removeItem } = useCart()
  const product = item.product
  return <div className="flex flex-col gap-4 border-b border-line py-5 sm:flex-row"><ProductImage className="h-36 w-full object-cover sm:h-24 sm:w-20" src={product.image} alt={product.name} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold">{product.name}</h3><p className="mt-1 text-sm text-ink/55">{product.category}</p><p className="mt-1 text-xs text-ink/45">${Number(product.price).toFixed(2)} / {product.unit}</p></div><p className="font-bold">${(Number(product.price) * item.quantity).toFixed(2)}</p></div><div className="mt-4 flex items-center justify-between gap-3"><QuantityStepper quantity={item.quantity} onChange={(quantity) => updateQuantity(item.productId, Math.min(product.stock, quantity))} /><button className="inline-flex items-center gap-1 text-xs font-bold text-ink/45 transition hover:text-clay" onClick={() => removeItem(item.productId)}><Trash2 size={14} /> Remove</button></div><p className="mt-2 text-xs text-ink/45">{product.stock} available</p></div></div>
}
