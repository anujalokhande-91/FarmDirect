import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { useFarmerData } from '../app/FarmerDataContext'
import { toSafeNumber } from '../utils/numbers'

const nextStatus = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'delivered' }
const labels = { pending: 'Confirm', confirmed: 'Start Preparing', preparing: 'Mark Ready', ready: 'Mark Delivered' }

export default function FarmerOrders() {
  const { orders, updateOrderStatus, loading, error } = useFarmerData()
  const [actionError, setActionError] = useState('')

  const changeStatus = async (order, status) => {
    setActionError('')
    try {
      await updateOrderStatus(order.order_id, status)
    } catch (requestError) {
      setActionError(requestError.message)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">Fulfillment</p>
      <h1 className="serif mt-3 text-4xl leading-none md:text-6xl">Orders</h1>
      <p className="mt-4 max-w-2xl text-ink/60">Keep customers informed as their harvest makes its way to them.</p>
      {(error || actionError) && <p className="mt-6 rounded-xl bg-[#f8e8df] px-4 py-3 text-sm font-bold text-clay">{actionError || error}</p>}

      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="hidden grid-cols-[1fr_1.2fr_1fr_.7fr_1fr_1fr_auto] gap-4 border-b border-line px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ink/45 md:grid">
          <span>Order ID</span><span>Customer</span><span>Product</span><span>Amount</span><span>Date</span><span>Status</span><span>Actions</span>
        </div>
        {loading ? <p className="p-10 text-center text-sm text-ink/55">Loading orders...</p> : (
          <div className="divide-y divide-line">
            {orders.map((order) => (
              <div className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_1.2fr_1fr_.7fr_1fr_1fr_auto] md:items-center md:px-6" key={`${order.order_id}-${order.product?.id}`}>
                <div className="font-bold text-ink">#{order.order_id}</div>
                <div>{order.customer}</div>
                <div>{order.product}<span className="text-xs text-ink/45"> × {order.quantity}</span></div>
                <div className="font-bold">${toSafeNumber(order.amount).toFixed(2)}</div>
                <div className="text-sm text-ink/55">{order.date}</div>
                <div><span className="inline-flex rounded-full bg-oat px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">{order.status}</span></div>
                <div className="flex flex-wrap gap-2">
                  {nextStatus[order.status] && <button className="rounded-full border border-line px-3 py-2 text-xs font-bold text-ink/60 hover:border-leaf hover:text-leaf" type="button" onClick={() => changeStatus(order, nextStatus[order.status])}>{labels[order.status]}</button>}
                  {!['delivered', 'cancelled'].includes(order.status) && <button className="rounded-full border border-line px-3 py-2 text-xs font-bold text-ink/60 hover:border-clay hover:text-clay" type="button" onClick={() => changeStatus(order, 'cancelled')}>Cancel</button>}
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && !orders.length && <div className="grid min-h-48 place-items-center p-8 text-center"><ClipboardList className="text-ink/25" size={30} /><p className="mt-3 text-sm text-ink/55">No orders yet.</p></div>}
      </div>
    </div>
  )
}
