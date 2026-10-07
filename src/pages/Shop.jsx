import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listProducts } from '../api/products'
import { getApiErrorMessage } from '../api/api'
import { ProductGrid } from '../components/ui'
import { normalizeCategory } from '../utils/categories'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [state, setState] = useState({ loading: true, error: '' })
  const category = params.get('category') || 'all'
  const sort = params.get('sort') || 'featured'

  useEffect(() => {
    listProducts().then((data) => {
      setProducts(data)
      setState({ loading: false, error: '' })
    }).catch((error) => setState({ loading: false, error: getApiErrorMessage(error, 'Products could not be loaded.') }))
  }, [])

  const visible = useMemo(() => {
    const filtered = products.filter((product) => (category === 'all' || normalizeCategory(product.category) === normalizeCategory(category)) && `${product.name} ${product.description || ''}`.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'price-low') return [...filtered].sort((a, b) => Number(a.price) - Number(b.price))
    if (sort === 'price-high') return [...filtered].sort((a, b) => Number(b.price) - Number(a.price))
    return filtered
  }, [category, products, search, sort])
  const categories = [...new Set(products.map((product) => product.category))]
  const clearFilters = () => { setSearch(''); setParams({}) }

  return <section className="container-page min-w-0 py-12 md:py-20">
    <div className="mb-10 max-w-2xl"><p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-clay">The marketplace</p><h1 className="serif text-6xl leading-none md:text-7xl">Shop the harvest.</h1><p className="mt-5 text-ink/60">Fresh picks and thoughtful pantry staples, sourced from the farms and makers we trust.</p></div>
    <div className="mb-8 min-w-0 overflow-hidden border-y border-line py-4"><div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex min-w-0 gap-2 overflow-x-auto pb-1"><button className={`shrink-0 whitespace-nowrap px-3 py-2 text-sm font-bold ${category === 'all' ? 'bg-leaf text-white' : 'text-ink/55 hover:text-leaf'}`} onClick={() => setParams({})}>All goods</button>{categories.map((value) => <button key={value} className={`shrink-0 whitespace-nowrap px-3 py-2 text-sm font-bold ${category === value.toLowerCase() ? 'bg-leaf text-white' : 'text-ink/55 hover:text-leaf'}`} onClick={() => setParams({ category: value.toLowerCase() })}>{value}</button>)}</div><div className="flex min-w-0 flex-col gap-3 sm:flex-row"><label className="flex h-11 min-w-0 items-center gap-2 border border-line bg-white px-3"><Search size={16} className="shrink-0 text-ink/45" /><span className="sr-only">Search products</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink/40 sm:w-44" placeholder="Search goods" /></label><label className="flex h-11 items-center gap-2 border border-line bg-white px-3 text-sm"><SlidersHorizontal size={15} className="text-ink/45" /><span className="sr-only">Sort products</span><select value={sort} onChange={(event) => setParams({ ...(category === 'all' ? {} : { category }), sort: event.target.value })} className="min-w-0 bg-transparent outline-none"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div></div></div>
    {(search || category !== 'all' || sort !== 'featured') && <button className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-leaf" onClick={clearFilters}>Clear filters <X size={15} /></button>}
    {state.loading ? <p className="py-20 text-center text-sm text-ink/55">Loading products...</p> : state.error ? <p className="rounded-2xl bg-[#f8e8df] px-4 py-3 text-sm font-bold text-clay">{state.error}</p> : <><p className="mb-6 text-sm text-ink/50">Showing {visible.length} of {products.length} products</p>{!visible.length && category !== 'all' ? <div className="border border-line bg-white py-16 text-center"><p className="serif text-3xl">No products available in this category yet.</p></div> : <ProductGrid products={visible} />}</>}
  </section>
}
