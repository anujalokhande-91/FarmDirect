import { ArrowRight, Boxes, ClipboardList, DollarSign, Package2, Sprout, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFarmerAuth } from '../app/FarmerAuthContext'
import { useFarmerData } from '../app/FarmerDataContext'
import { toSafeNumber } from '../utils/numbers'
import ProductImage from '../components/ProductImage'

const summaryCards = [
  { key: 'totalProducts', label: 'Total Products', icon: Boxes, tone: 'bg-[#e8eee3] text-leaf' },
  { key: 'activeProducts', label: 'Active Products', icon: Sprout, tone: 'bg-[#edf3e8] text-herb' },
  { key: 'pendingOrders', label: 'Pending Orders', icon: ClipboardList, tone: 'bg-[#f8eee5] text-clay' },
  { key: 'completedOrders', label: 'Completed Orders', icon: TrendingUp, tone: 'bg-[#e7f1ec] text-herb' },
  { key: 'totalSales', label: 'Total Sales', icon: DollarSign, tone: 'bg-[#e8eee3] text-leaf', format: (value) => `$${toSafeNumber(value).toFixed(2)}` },
]

const statusClassMap = {
  Active: 'bg-[#e8eee3] text-leaf',
  Draft: 'bg-oat text-ink/65',
  Paused: 'bg-[#f8eee5] text-clay',
}

const orderStatusClassMap = {
  pending: 'bg-[#f8eee5] text-clay',
  confirmed: 'bg-[#e7f1ec] text-herb',
  preparing: 'bg-oat text-ink/65',
  ready: 'bg-[#edf3e8] text-herb',
  delivered: 'bg-[#e8eee3] text-leaf',
  cancelled: 'bg-[#f8e8df] text-clay',
}

export default function FarmerDashboard() {
  const { currentFarmer } = useFarmerAuth()
  const { summary, orders, products } = useFarmerData()

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">Overview</p>
          <h1 className="serif mt-3 text-4xl leading-none text-ink md:text-6xl">
            Welcome back, {currentFarmer?.name?.split(' ')[0] || 'Farmer'}
          </h1>
          <p className="mt-4 max-w-2xl text-ink/60">
            Here is how {currentFarmer?.farmName || 'your farm'} is performing today. Keep products fresh,
            orders moving, and customers informed.
          </p>
        </div>
        <Link
          to="/farmer/products/add"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-leaf px-5 text-sm font-bold text-white transition hover:bg-ink"
        >
          <Package2 size={17} />
          Add Product
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map(({ key, label, icon: Icon, tone, format }) => (
          <div key={key} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <span className={`grid h-11 w-11 place-items-center rounded-full ${tone}`}>
                <Icon size={20} />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-ink/30">Live</span>
            </div>
            <p className="mt-8 text-sm text-ink/55">{label}</p>
            <p className="mt-1 text-3xl font-extrabold text-ink">
              {format ? format(summary[key]) : summary[key]}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-clay">Latest activity</p>
              <h2 className="serif mt-2 text-3xl">Recent orders</h2>
            </div>
            <Link className="inline-flex items-center gap-1 text-sm font-bold text-leaf" to="/farmer/orders">
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {orders.slice(0, 4).map((order) => (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4" key={order.id}>
                <div>
                  <p className="font-bold text-ink">{order.product}</p>
                  <p className="mt-1 text-xs text-ink/50">
                    {order.id} · {order.customer} · {order.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-ink">${toSafeNumber(order.amount).toFixed(2)}</p>
                  <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${orderStatusClassMap[order.status] || 'bg-oat text-ink/65'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-[#e8eee3] p-6 md:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-clay">Inventory highlight</p>
          <h2 className="serif mt-3 text-4xl leading-none">Products overview</h2>
          <p className="mt-4 text-sm leading-6 text-ink/60">
            Quick view of the products currently in your catalogue.
          </p>
          <div className="mt-6 space-y-4">
            {products.slice(0, 4).map((product) => (
              <div key={product.id} className="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
                <ProductImage className="mb-4 h-32 w-full rounded-xl object-cover" src={product.image} alt={product.name} />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-ink">{product.name}</p>
                    <p className="mt-1 text-sm text-ink/55">{product.category}</p>
                  </div>
                  <Link
                    to={`/farmer/products/edit/${product.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-xs font-bold text-ink/60 transition hover:border-leaf hover:text-leaf"
                  >
                    Edit
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-ink/40">Price</p>
                    <p className="mt-1 font-bold text-ink">${toSafeNumber(product.price).toFixed(2)} / {product.unit}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-ink/40">Stock</p>
                    <p className="mt-1 font-bold text-ink">{product.quantity} available</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusClassMap[product.status] || 'bg-oat text-ink/65'}`}>
                    {product.status}
                  </span>
                  <p className="text-xs text-ink/45">{product.location}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/farmer/products" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-leaf">
            Manage products
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  )
}
