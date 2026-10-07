import { ArrowRight, Check, MapPin, Plus, Search, ShieldCheck, Sprout, Truck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../app/CartContext'
import ProductImage from '../ProductImage'
import { categories } from '../../data/mockData'

const featureCards = [
  { icon: Users, title: 'Direct From Farmers', copy: 'Know exactly who grows, harvests, and packs your food.' },
  { icon: Sprout, title: 'Fair Prices', copy: 'More of your purchase goes back to the people who grow it.' },
  { icon: Truck, title: 'Fresh Products', copy: 'Seasonal goods move from nearby fields to your table quickly.' },
  { icon: ShieldCheck, title: 'Trusted Local Sellers', copy: 'Every seller is part of a community we know and trust.' },
]

export function HomeHero({ query, onQueryChange, onSearch }) {
  return <section className="overflow-hidden bg-[#eef4e9]">
    <div className="container-page grid gap-10 py-12 md:grid-cols-[.95fr_1.05fr] md:items-center md:py-20">
      <div className="reveal">
        <p className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-clay"><Sprout size={15} /> The local harvest marketplace</p>
        <h1 className="serif max-w-2xl text-6xl leading-[.92] text-ink md:text-8xl">Fresh From Farmers. <span className="text-leaf">Directly To You.</span></h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-ink/65 md:text-lg">Buy fresh agricultural products directly from farmers and local food makers. Better food for your table, better support for the people who grow it.</p>
        <form onSubmit={onSearch} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <label className="flex min-h-14 flex-1 items-center gap-3 border border-line bg-white px-4 shadow-sm focus-within:border-leaf"><Search size={19} className="shrink-0 text-ink/45" /><span className="sr-only">Search products</span><input value={query} onChange={(event) => onQueryChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink/40" placeholder="Search vegetables, fruits, grains..." /></label>
          <button className="min-h-14 bg-leaf px-6 text-sm font-bold text-white transition hover:bg-ink" type="submit">Search</button>
        </form>
        <Link to="/shop" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-leaf hover:text-clay">Explore Products <ArrowRight size={16} /></Link>
      </div>
      <div className="relative min-h-[390px] overflow-hidden bg-[#cbd8c6] md:min-h-[560px]">
        <img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=90" alt="Farmer tending green rows of crops" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">This week's pick</p><p className="mt-1 text-xl font-bold">Grown close. Delivered fresh.</p></div><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-leaf"><Sprout size={22} /></span></div>
      </div>
    </div>
  </section>
}

export function CategoryStrip({ activeCategory, onCategoryChange }) {
  return <section id="categories" className="border-y border-line bg-white py-14"><div className="container-page"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-clay">Shop the harvest</p><h2 className="serif text-4xl leading-none text-ink md:text-5xl">Browse by category</h2></div><Link className="hidden items-center gap-2 text-sm font-bold text-leaf sm:flex" to="/shop">View all <ArrowRight size={16} /></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{categories.map((category) => <button key={category.id} onClick={() => onCategoryChange(activeCategory === category.value ? '' : category.value)} className={`group relative aspect-[1.05] overflow-hidden text-left ${activeCategory === category.value ? 'ring-4 ring-herb ring-offset-2' : ''}`}><img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={category.image} alt="" /><span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" /><span className="absolute bottom-4 left-4 text-white"><span className="block font-bold">{category.label}</span><span className="mt-1 block text-xs text-white/70">{category.count} products</span></span></button>)}</div></div></section>
}

export function ProductShowcase({ products }) {
  const { addItem } = useCart()
  return <section id="products" className="container-page py-16"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-clay">Picked for your table</p><h2 className="serif text-4xl leading-none text-ink md:text-5xl">Featured products</h2></div><Link className="hidden items-center gap-2 text-sm font-bold text-leaf sm:flex" to="/products">Shop all products <ArrowRight size={16} /></Link></div>{products.length ? <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <article className="group" key={product.id}><Link to={`/products/${product.id}`} className="block"><div className="relative aspect-[.94] overflow-hidden bg-[#e6ede1]"><ProductImage className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={product.image} alt={product.name} /><span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-leaf">{product.category}</span></div><div className="pt-4"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-ink group-hover:text-leaf">{product.name}</h3><p className="shrink-0 text-sm font-bold text-ink">${Number(product.price).toFixed(2)}</p></div><p className="mt-1 text-sm text-ink/55">{product.unit}</p><p className="mt-3 flex items-center gap-1 text-xs text-ink/55"><MapPin size={13} /> {product.stock} available</p></div></Link><button disabled={product.stock < 1} onClick={() => addItem(product)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-leaf text-sm font-bold text-leaf transition hover:bg-leaf hover:text-white disabled:opacity-40"><Plus size={16} /> Add to Cart</button></article>)}</div> : <div className="border border-line bg-white py-16 text-center"><p className="serif text-3xl">No products found</p><p className="mt-2 text-sm text-ink/55">Try another search or category.</p></div>}</section>
}

export function WhyFarmDirect() {
  return <section id="about" className="bg-leaf py-16 text-white"><div className="container-page"><div className="max-w-xl"><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-herb">Why FarmDirect</p><h2 className="serif text-5xl leading-[.98] md:text-6xl">Good food has a story worth knowing.</h2></div><div className="mt-12 grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-4">{featureCards.map(({ icon: Icon, title, copy }) => <div key={title} className="bg-leaf p-6"><Icon size={25} className="text-herb" /><h3 className="mt-8 font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/65">{copy}</p></div>)}</div></div></section>
}

export function HomeCta() {
  return <section className="container-page py-16"><div className="relative overflow-hidden bg-[#dce8d5] px-6 py-14 text-center md:px-12"><div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[24px] border-white/45" /><div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full border-[18px] border-herb/25" /><div className="relative"><Check className="mx-auto text-leaf" size={28} /><h2 className="serif mt-4 text-5xl leading-none text-ink md:text-6xl">Bring the harvest home.</h2><p className="mx-auto mt-5 max-w-md leading-7 text-ink/65">Start shopping fresh, local products and make your next meal a little more meaningful.</p><Link to="/shop" className="mt-7 inline-flex min-h-12 items-center gap-2 bg-leaf px-6 text-sm font-bold text-white transition hover:bg-ink">Start shopping <ArrowRight size={16} /></Link></div></div></section>
}