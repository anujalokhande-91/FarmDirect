import { CheckCircle2, Edit3, PackagePlus, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useFarmerData } from '../app/FarmerDataContext'
import { toSafeNumber } from '../utils/numbers'
import ProductImage from '../components/ProductImage'

const statusTone = {
  Active: 'bg-[#e8eee3] text-leaf',
  Draft: 'bg-oat text-ink/65',
  Paused: 'bg-[#f8eee5] text-clay',
}

export default function FarmerProducts() {
  const { products, deleteProduct, loading, error } = useFarmerData()
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [deletingId, setDeletingId] = useState(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')

  const categories = useMemo(() => ['All', ...new Set(products.map((product) => product.category))], [products])
  const statuses = useMemo(() => ['All', ...new Set(products.map((product) => product.status))], [products])

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.description} ${product.location}`.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = category === 'All' || product.category === category
    const matchesStatus = status === 'All' || product.status === status
    return matchesQuery && matchesCategory && matchesStatus
  }), [category, products, query, status])

  const remove = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return
    setMessage('')
    setDeletingId(product.id)
    try {
      await deleteProduct(product.id)
      setMessageType('success')
      setMessage(`${product.name} was removed.`)
    } catch (requestError) {
      setMessageType('error')
      setMessage(requestError.message || 'The product could not be removed.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">Inventory</p>
          <h1 className="serif mt-3 text-4xl leading-none md:text-6xl">Products</h1>
          <p className="mt-4 max-w-2xl text-ink/60">
            Manage what customers can buy from your farm. Search, filter, edit, or remove products as your inventory changes.
          </p>
        </div>
        <Link to="/farmer/products/add" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-leaf px-5 text-sm font-bold text-white transition hover:bg-ink">
          <PackagePlus size={17} />
          Add Product
        </Link>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[1.3fr_.8fr_.8fr] md:p-5">
        <label className="flex items-center gap-3 rounded-full border border-line bg-oat px-4 py-3">
          <Search size={18} className="text-ink/40" />
          <input
            className="w-full bg-transparent outline-none placeholder:text-ink/35"
            type="search"
            placeholder="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select className="min-h-12 rounded-full border border-line bg-oat px-4 outline-none focus:border-leaf" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((value) => <option key={value}>{value}</option>)}
        </select>
        <select className="min-h-12 rounded-full border border-line bg-oat px-4 outline-none focus:border-leaf" value={status} onChange={(event) => setStatus(event.target.value)}>
          {statuses.map((value) => <option key={value}>{value}</option>)}
        </select>
      </div>

      {message && (
        <p className={`mt-6 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${messageType === 'success' ? 'bg-[#e8eee3] text-leaf' : 'bg-[#f8e8df] text-clay'}`}>
          {messageType === 'success' && <CheckCircle2 size={17} />}
          {message}
        </p>
      )}

      {error && <p className="mt-6 rounded-2xl bg-[#f8e8df] px-4 py-3 text-sm font-bold text-clay">{error}</p>}
      {loading ? <p className="mt-8 rounded-2xl bg-white p-10 text-center text-sm text-ink/55">Loading products...</p> : <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-line px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ink/45 md:grid">
          <span>Product</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-line">
          {filteredProducts.map((product) => (
            <div className="grid gap-4 px-5 py-5 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] md:items-center md:px-6" key={product.id}>
              <div className="flex items-center gap-4">
                <ProductImage className="h-16 w-16 rounded-2xl object-cover" src={product.image} alt="" />
                <div>
                  <p className="font-bold text-ink">{product.name}</p>
                  <p className="mt-1 text-xs text-ink/50">{product.location}</p>
                  <p className="mt-2 text-sm text-ink/55">{product.description}</p>
                </div>
              </div>

              <div className="text-sm text-ink/60">
                <span className="font-bold text-ink/40 md:hidden">Category: </span>
                {product.category}
              </div>

              <div className="text-sm font-bold text-ink">
                <span className="font-bold text-ink/40 md:hidden">Price: </span>
                ${toSafeNumber(product.price).toFixed(2)} / {product.unit}
              </div>

              <div className="text-sm text-ink/60">
                <span className="font-bold text-ink/40 md:hidden">Stock: </span>
                {product.quantity} available
              </div>

              <div className="md:hidden">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">Status</p>
                <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusTone[product.status] || 'bg-oat text-ink/65'}`}>
                  {product.status}
                </span>
              </div>

              <div className="hidden md:block">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusTone[product.status] || 'bg-oat text-ink/65'}`}>
                  {product.status}
                </span>
              </div>

              <div className="flex gap-2">
                <Link className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink/55 transition hover:border-leaf hover:text-leaf" to={`/farmer/products/edit/${product.id}`} aria-label={`Edit ${product.name}`}>
                  <Edit3 size={16} />
                </Link>
                <button className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink/55 transition hover:border-clay hover:text-clay disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={() => remove(product)} disabled={deletingId !== null} aria-label={`Delete ${product.name}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {!filteredProducts.length && (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-bold text-ink">No products match your filters.</p>
          <p className="mt-2 text-sm text-ink/55">Try changing the search term, category, or status.</p>
        </div>
      )}
    </div>
  )
}
