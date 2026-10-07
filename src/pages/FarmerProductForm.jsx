import { ArrowLeft, ImagePlus, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useFarmerData } from '../app/FarmerDataContext'
import ProductImage from '../components/ProductImage'

const emptyProduct = {
  name: '',
  category: 'Vegetables',
  price: '',
  unit: 'per lb',
  description: '',
  quantity: '',
  location: '',
  image_url: '',
  status: 'Active',
  farmingType: 'Organic',
}

const categories = ['Vegetables', 'Organic Vegetables', 'Fruits', 'Grains', 'Dairy', 'Pantry', 'Herbs', 'Meat', 'Other']
const statuses = ['Active', 'Draft', 'Paused']
const farmingTypes = ['Organic', 'Conventional', 'Mixed']

function ProductField({ label, children, className = '' }) {
  return (
    <label className={`block text-sm font-bold text-ink ${className}`}>
      {label}
      {children}
    </label>
  )
}

function ProductInput({ className = '', ...props }) {
  return (
    <input
      className={`mt-2 min-h-12 w-full rounded-2xl border border-line bg-oat px-4 font-normal outline-none transition focus:border-leaf ${className}`}
      {...props}
    />
  )
}

function ProductTextarea(props) {
  return (
    <textarea
      className="mt-2 min-h-32 w-full rounded-2xl border border-line bg-oat px-4 py-3 font-normal outline-none transition focus:border-leaf"
      {...props}
    />
  )
}

export default function FarmerProductForm() {
  const params = useParams()
  const productId = params.id || params.productId
  const navigate = useNavigate()
  const { products, addProduct, updateProduct } = useFarmerData()
  const existing = useMemo(() => products.find((product) => String(product.id) === productId), [productId, products])
  const [form, setForm] = useState(emptyProduct)
  const [error, setError] = useState('')

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || '',
        category: existing.category || 'Vegetables',
        price: existing.price ?? '',
        unit: existing.unit || 'per lb',
        description: existing.description || '',
        quantity: existing.quantity ?? '',
        location: existing.location || '',
        image_url: existing.image_url || existing.image || '',
        status: existing.status || 'Active',
        farmingType: existing.farmingType || 'Organic',
      })
    } else {
      setForm(emptyProduct)
    }
  }, [existing])

  const update = (field) => (event) => {
    setError('')
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const requiredFields = ['name', 'category', 'price', 'unit', 'description', 'quantity', 'location']
    if (requiredFields.some((field) => String(form[field] ?? '').trim() === '') || Number(form.price) <= 0 || Number(form.quantity) < 0) {
      setError('Complete all required product fields before saving.')
      return
    }

    const payload = {
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
      image_url: form.image_url.trim() || null,
    }

    try {
      if (existing) await updateProduct(existing.id, payload)
      else await addProduct(payload)
      navigate('/farmer/products')
    } catch (requestError) {
      setError(requestError.message || 'The product could not be saved.')
    }
  }

  if (productId && !existing) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="serif text-4xl text-ink">Product not found</h1>
        <Link className="mt-4 inline-block font-bold text-leaf" to="/farmer/products">
          Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/farmer/products" className="inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-leaf">
        <ArrowLeft size={16} />
        Back to products
      </Link>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">Inventory</p>
          <h1 className="serif mt-3 text-4xl leading-none md:text-6xl">
            {existing ? 'Edit Product' : 'Add Product'}
          </h1>
          <p className="mt-4 max-w-2xl text-ink/60">
            Use this form to save product details, pricing, stock, and availability.
          </p>
        </div>
      </div>

      <form className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8" onSubmit={submit}>
        {error && <p className="mb-6 rounded-2xl bg-[#f8e8df] px-4 py-3 text-sm font-bold text-clay">{error}</p>}

        <div className="grid gap-6 md:grid-cols-2">
          <ProductField label="Product Name" className="md:col-span-2">
            <ProductInput value={form.name} onChange={update('name')} placeholder="Heirloom Tomatoes" />
          </ProductField>

          <ProductField label="Category">
            <select className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-oat px-4 outline-none focus:border-leaf" value={form.category} onChange={update('category')}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </ProductField>

          <ProductField label="Availability / Status">
            <select className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-oat px-4 outline-none focus:border-leaf" value={form.status} onChange={update('status')}>
              {statuses.map((value) => <option key={value}>{value}</option>)}
            </select>
          </ProductField>

          <ProductField label="Price">
            <ProductInput type="number" min="0" step="0.01" value={form.price} onChange={update('price')} placeholder="4.50" />
          </ProductField>

          <ProductField label="Unit">
            <ProductInput value={form.unit} onChange={update('unit')} placeholder="per lb" />
          </ProductField>

          <ProductField label="Available Quantity">
            <ProductInput type="number" min="0" value={form.quantity} onChange={update('quantity')} placeholder="100" />
          </ProductField>

          <ProductField label="Location">
            <ProductInput value={form.location} onChange={update('location')} placeholder="Hudson Valley, NY" />
          </ProductField>

          <ProductField label="Farming Type">
            <select className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-oat px-4 outline-none focus:border-leaf" value={form.farmingType} onChange={update('farmingType')}>
              {farmingTypes.map((value) => <option key={value}>{value}</option>)}
            </select>
          </ProductField>

          <ProductField label="Product Image URL">
            <ProductInput value={form.image_url} onChange={update('image_url')} placeholder="https://..." />
          </ProductField>

          <ProductField label="Description" className="md:col-span-2">
            <ProductTextarea
              value={form.description}
              onChange={update('description')}
              placeholder="Tell customers about this harvest."
            />
          </ProductField>

          <div className="rounded-2xl border border-dashed border-line bg-oat/45 p-5 md:col-span-2">
            <div className="flex items-start gap-3">
              <ImagePlus className="mt-0.5 text-herb" size={24} />
              <div>
                <p className="text-sm font-bold text-ink">Image preview placeholder</p>
                <p className="mt-1 text-xs text-ink/50">
                  Use the image URL field above for now. Upload support can be added later.
                </p>
                <div className="mt-4 overflow-hidden rounded-2xl bg-white">
                  <ProductImage
                    src={form.image_url}
                    alt=""
                    className="h-44 w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
          <Link className="inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-bold text-ink/55 hover:text-leaf" to="/farmer/products">
            Cancel
          </Link>
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-leaf px-6 text-sm font-bold text-white hover:bg-ink" type="submit">
            <Save size={17} />
            {existing ? 'Save Changes' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
