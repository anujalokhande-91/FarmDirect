import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types/order';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCustomerOrders();
      let filteredOrders = (response as any).orders;
      if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter((o: Order) => o.orderStatus === statusFilter);
      }
      setOrders(filteredOrders);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(orderId);
      await apiService.cancelOrder(orderId, 'Customer requested cancellation');
      await fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(null);
    }
  };

  const downloadInvoice = (order: Order) => {
    const deliveryCharge = (order as any).deliveryCharge || 0;
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Invoice - ${order.orderNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; background: #fff; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #16a34a; }
          .brand { font-size: 28px; font-weight: 800; color: #16a34a; }
          .brand span { color: #111; }
          .invoice-title { font-size: 14px; color: #666; margin-top: 4px; }
          .invoice-meta { text-align: right; }
          .invoice-meta h2 { font-size: 24px; font-weight: 700; color: #111; }
          .invoice-meta p { font-size: 13px; color: #666; margin-top: 4px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #fef9c3; color: #854d0e; margin-top: 8px; text-transform: capitalize; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin: 32px 0; }
          .box h4 { font-size: 11px; font-weight: 700; color: #16a34a; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; }
          .box p { font-size: 14px; color: #333; line-height: 1.7; }
          table { width: 100%; border-collapse: collapse; margin: 24px 0; }
          thead tr { background: #f0fdf4; }
          th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 1px; }
          td { padding: 14px 16px; font-size: 14px; color: #333; border-bottom: 1px solid #f3f4f6; }
          tr:last-child td { border-bottom: none; }
          .totals { margin-left: auto; width: 280px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #555; }
          .total-final { display: flex; justify-content: space-between; padding: 14px 0; font-size: 17px; font-weight: 800; color: #111; border-top: 2px solid #16a34a; margin-top: 8px; }
          .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #999; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">🌿 Farm<span>Direct</span></div>
            <div class="invoice-title">Farm Fresh · Direct to Your Door</div>
          </div>
          <div class="invoice-meta">
            <h2>INVOICE</h2>
            <p>Order #${order.orderNumber}</p>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <div class="badge">${order.orderStatus}</div>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <h4>Bill To</h4>
            <p><strong>${order.customerName}</strong></p>
            <p>${order.customerEmail}</p>
            <p>${order.customerPhone || ''}</p>
          </div>
          <div class="box">
            <h4>Delivery Address</h4>
            <p>${order.deliveryAddress.street}</p>
            <p>${order.deliveryAddress.city}, ${order.deliveryAddress.state}</p>
            <p>Pincode: ${order.deliveryAddress.pincode}</p>
            ${order.deliveryAddress.landmark ? `<p>Landmark: ${order.deliveryAddress.landmark}</p>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Farmer</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${item.name}</strong></td>
                <td>${item.farmerName}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td><strong>₹${(item.price * item.quantity).toFixed(2)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row"><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
          <div class="total-row"><span>Delivery Charge</span><span>${deliveryCharge === 0 ? 'FREE' : '₹' + deliveryCharge.toFixed(2)}</span></div>
          <div class="total-row"><span>Payment Method</span><span style="text-transform:uppercase">${order.paymentMethod}</span></div>
          <div class="total-final"><span>Total Amount</span><span>₹${order.finalAmount.toFixed(2)}</span></div>
        </div>

        <div class="footer">
          <p>Thank you for shopping with FarmDirect! 🌱</p>
          <p style="margin-top:6px">For support contact: support@farmdirect.in | www.farmdirect.in</p>
        </div>

        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(invoiceHTML);
      win.document.close();
    }
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'background:#fef9c3;color:#854d0e',
      confirmed: 'background:#dbeafe;color:#1e40af',
      processing: 'background:#f3e8ff;color:#6b21a8',
      shipped: 'background:#e0e7ff;color:#3730a3',
      'out-for-delivery': 'background:#ffedd5;color:#9a3412',
      delivered: 'background:#dcfce7;color:#166534',
      cancelled: 'background:#fee2e2;color:#991b1b',
      returned: 'background:#f3f4f6;color:#374151',
    };
    return map[status] || 'background:#f3f4f6;color:#374151';
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  const canCancel = (order: Order) => ['pending', 'confirmed'].includes(order.orderStatus);

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Please Login to View Orders</h2>
        <Link to="/login" className="bg-green-600 text-white px-6 py-3 rounded-lg">Login</Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage your orders</p>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                statusFilter === s
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {s === 'all' ? 'All Orders' : s}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Orders Found</h2>
            <p className="text-gray-500 mb-6">
              {statusFilter === 'all' ? "You haven't placed any orders yet." : `No "${statusFilter}" orders found.`}
            </p>
            {statusFilter === 'all' && (
              <Link to="/products" className="bg-green-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-green-700">
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">

                {/* Order Header */}
                <div className="p-5 border-b border-gray-100 flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900">Order #{order.orderNumber}</h3>
                      <span style={{
                        ...Object.fromEntries(getStatusColor(order.orderStatus).split(';').map(s => s.split(':'))),
                        padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                        textTransform: 'capitalize', display: 'inline-block'
                      } as any}>
                        {order.orderStatus.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                    {order.estimatedDelivery && (
                      <p className="text-sm text-gray-400">Est. delivery: {formatDate(order.estimatedDelivery)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">₹{order.finalAmount.toFixed(2)}</div>
                    <div className="text-sm text-gray-400">{order.items.length} item{order.items.length > 1 ? 's' : ''}</div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-5">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                          🌿
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-400">{item.quantity} {item.unit} × ₹{item.price.toFixed(2)} · Sold by {item.farmerName}</div>
                        </div>
                        <div className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery Address</h4>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                    {order.deliveryAddress.landmark && ` · ${order.deliveryAddress.landmark}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="px-5 py-4 border-t border-gray-100 flex flex-wrap gap-3">
                  {/* VIEW DETAILS BUTTON */}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>

                  {/* DOWNLOAD INVOICE BUTTON */}
                  <button
                    onClick={() => downloadInvoice(order)}
                    className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors border border-green-200"
                  >
                    📄 Download Invoice
                  </button>

                  {canCancel(order) && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={cancelling === order._id}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {cancelling === order._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── VIEW DETAILS MODAL ── */}
      {selectedOrder && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111' }}>Order Details</h2>
                <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>#{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ×
              </button>
            </div>

            <div style={{ padding: '24px' }}>

              {/* Status + Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{
                  ...Object.fromEntries(getStatusColor(selectedOrder.orderStatus).split(';').map(s => s.split(':'))),
                  padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                  textTransform: 'capitalize'
                } as any}>
                  {selectedOrder.orderStatus.replace('-', ' ')}
                </span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Placed on {formatDate(selectedOrder.createdAt)}</span>
              </div>

              {/* Customer Info */}
              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Customer Info</h4>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>{selectedOrder.customerName}</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{selectedOrder.customerEmail}</p>
                {selectedOrder.customerPhone && <p style={{ fontSize: '13px', color: '#6b7280' }}>{selectedOrder.customerPhone}</p>}
              </div>

              {/* Items */}
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Order Items</h4>
              <div style={{ marginBottom: '20px' }}>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🌿</div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{item.quantity} {item.unit} × ₹{item.price} · {item.farmerName}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Price Breakdown</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  <span>Delivery Charge</span>
                  <span>{(selectedOrder as any).deliveryCharge === 0 ? 'FREE' : `₹${(selectedOrder as any).deliveryCharge}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                  <span>Payment Method</span>
                  <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{selectedOrder.paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#111', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                  <span>Total</span>
                  <span>₹{selectedOrder.finalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Delivery Address</h4>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>
                  {selectedOrder.deliveryAddress.street}<br />
                  {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}
                  {selectedOrder.deliveryAddress.landmark && <><br />Near: {selectedOrder.deliveryAddress.landmark}</>}
                </p>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => downloadInvoice(selectedOrder)}
                  style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                >
                  📄 Download Invoice
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
