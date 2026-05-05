import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const DeliveryDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders/delivery-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}/delivery-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, note: `Status updated to ${status}` })
      });
      const data = await response.json();
      if (data.success) fetchAssignedOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-700 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🚚 Delivery Dashboard</h1>
            <p className="text-green-200">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="bg-green-800 hover:bg-green-900 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-3xl font-bold text-green-600">{orders.length}</p>
            <p className="text-gray-600 text-sm">Total Assigned</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-3xl font-bold text-blue-600">
              {orders.filter((o: any) => o.deliveryStatus === 'in_transit').length}
            </p>
            <p className="text-gray-600 text-sm">In Transit</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-3xl font-bold text-purple-600">
              {orders.filter((o: any) => o.deliveryStatus === 'delivered').length}
            </p>
            <p className="text-gray-600 text-sm">Delivered</p>
          </div>
        </div>

        {/* Orders List */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">📦 Assigned Orders</h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500">No orders assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order._id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-800">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.customer?.name}</p>
                    <p className="text-sm text-gray-500">{order.customer?.phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.deliveryStatus === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.deliveryStatus === 'in_transit'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.deliveryStatus || 'assigned'}
                  </span>
                </div>

                {/* Delivery Address */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1">📍 Delivery Address</p>
                  <p className="text-sm text-gray-700">
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city},{' '}
                    {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                  </p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${order.deliveryAddress?.street} ${order.deliveryAddress?.city}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-xs mt-1 inline-block hover:underline"
                  >
                    🗺️ Open in Google Maps
                  </a>
                </div>

                {/* Items */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">🛒 Items</p>
                  {order.items?.map((item: any, i: number) => (
                    <p key={i} className="text-sm text-gray-700">
                      • {item.name} x{item.quantity} {item.unit}
                    </p>
                  ))}
                </div>

                <p className="text-sm font-semibold text-gray-800 mb-3">
                  💰 Total: ₹{order.finalAmount}
                </p>

                {/* Status Update Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {order.deliveryStatus !== 'picked_up' &&
                    order.deliveryStatus !== 'in_transit' &&
                    order.deliveryStatus !== 'delivered' && (
                      <button
                        onClick={() => updateStatus(order._id, 'picked_up')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm"
                      >
                        ✅ Mark Picked Up
                      </button>
                    )}

                  {order.deliveryStatus === 'picked_up' && (
                    <button
                      onClick={() => updateStatus(order._id, 'in_transit')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm"
                    >
                      🚚 Mark In Transit
                    </button>
                  )}

                  {order.deliveryStatus === 'in_transit' && (
                    <button
                      onClick={() => updateStatus(order._id, 'delivered')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm"
                    >
                      🎉 Mark Delivered
                    </button>
                  )}

                  <a
                    href={`tel:${order.customer?.phone}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm"
                  >
                    📞 Call Customer
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
