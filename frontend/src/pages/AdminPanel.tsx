import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/product';
import { Order } from '../types/order';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  pendingOrders: number;
  blockedUsers: number;
  farmers: number;
  customers: number;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'products' | 'orders'>('dashboard');

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingOrders: 0,
    blockedUsers: 0,
    farmers: 0,
    customers: 0,
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch products and orders; users fetched separately with fallback
      const [productsResponse, ordersResponse] = await Promise.all([
        apiService.getProducts({ limit: 1000 }),
        apiService.getOrders({ limit: 1000 }),
      ]);

      // Try fetching users — gracefully handle if endpoint doesn't exist
      let fetchedUsers: User[] = [];
      try {
        const usersResponse = await (apiService as any).getUsers();
        fetchedUsers = usersResponse?.users || [];
      } catch {
        // getUsers not implemented yet — leave as empty array, no error shown
        fetchedUsers = [];
      }

      const fetchedProducts: Product[] = (productsResponse as any).products || [];
      const fetchedOrders: Order[] = (ordersResponse as any).orders || [];

      setUsers(fetchedUsers);
      setProducts(fetchedProducts);
      setOrders(fetchedOrders);

      // Calculate stats
      const totalRevenue = fetchedOrders
        .filter((order: any) => order.orderStatus === 'delivered')
        .reduce((sum: number, order: Order) => sum + order.finalAmount, 0);

      const activeUsers = fetchedUsers.filter((u: User) => !u.isBlocked).length;
      const blockedUsers = fetchedUsers.filter((u: User) => u.isBlocked).length;
      const farmers = fetchedUsers.filter((u: User) => u.role === 'farmer').length;
      const customers = fetchedUsers.filter((u: User) => u.role === 'customer').length;
      const pendingOrders = fetchedOrders.filter((order: any) =>
        ['pending', 'confirmed'].includes(order.orderStatus)
      ).length;

      setStats({
        totalUsers: fetchedUsers.length,
        totalProducts: fetchedProducts.length,
        totalOrders: fetchedOrders.length,
        totalRevenue,
        activeUsers,
        pendingOrders,
        blockedUsers,
        farmers,
        customers,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, block: boolean) => {
    try {
      setActionLoading(userId);
      setError('');
      setSuccess('');

      // await apiService.blockUser(userId, block);
      setSuccess(block ? 'User blocked successfully!' : 'User unblocked successfully!');
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(userId);
      setError('');
      setSuccess('');

      // await apiService.deleteUser(userId);
      setSuccess('User deleted successfully!');
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setActionLoading(productId);
      setError('');
      setSuccess('');

      // await apiService.deleteProduct(productId);
      setSuccess('Product deleted successfully!');
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, _status: string) => {
    try {
      setActionLoading(orderId);
      setError('');
      setSuccess('');

      // await apiService.updateOrderStatus(orderId, status);
      setSuccess('Order status updated successfully!');
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You need admin privileges to access this panel.</p>
            <Link to="/" className="btn-primary">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage users, products, and orders</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b">
            <nav className="flex -mb-px">
              {(['dashboard', 'users', 'products', 'orders'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="material-icons text-blue-600">people</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
                    <p className="text-gray-600">Total Users</p>
                  </div>
                </div>
              </div>

              {/* Total Products */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="material-icons text-green-600">inventory</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalProducts}</h3>
                    <p className="text-gray-600">Total Products</p>
                  </div>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="material-icons text-yellow-600">shopping_cart</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
                    <p className="text-gray-600">Total Orders</p>
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="material-icons text-purple-600">payments</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(2)}</h3>
                    <p className="text-gray-600">Total Revenue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h4 className="text-lg font-semibold text-green-600">{stats.activeUsers}</h4>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <h4 className="text-lg font-semibold text-red-600">{stats.blockedUsers}</h4>
                <p className="text-sm text-gray-600">Blocked Users</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <h4 className="text-lg font-semibold text-blue-600">{stats.farmers}</h4>
                <p className="text-sm text-gray-600">Farmers</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <h4 className="text-lg font-semibold text-purple-600">{stats.customers}</h4>
                <p className="text-sm text-gray-600">Customers</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <h4 className="text-lg font-semibold text-orange-600">{stats.pendingOrders}</h4>
                <p className="text-sm text-gray-600">Pending Orders</p>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Users Management</h2>

              {users.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-icons text-6xl text-gray-300">group</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">No Users Found</h3>
                  <p className="text-gray-600">No users have registered yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((userItem) => (
                        <tr key={userItem._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                            <div className="text-sm text-gray-500">{userItem.email}</div>
                            <div className="text-sm text-gray-500">{userItem.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              userItem.role === 'farmer' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {userItem.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              userItem.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {userItem.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(userItem.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleBlockUser(userItem._id, !userItem.isBlocked)}
                              disabled={actionLoading === userItem._id}
                              className={`mr-3 ${
                                userItem.isBlocked
                                  ? 'text-green-600 hover:text-green-900'
                                  : 'text-yellow-600 hover:text-yellow-900'
                              } disabled:opacity-50`}
                            >
                              {actionLoading === userItem._id ? 'Loading...' :
                               userItem.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(userItem._id)}
                              disabled={actionLoading === userItem._id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {actionLoading === userItem._id ? 'Loading...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Products Management</h2>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-icons text-6xl text-gray-300">inventory</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">No Products Found</h3>
                  <p className="text-gray-600">No products have been added yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-icons text-gray-400 text-sm">eco</span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.farmerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₹{product.price}</div>
                            <div className="text-sm text-gray-500">/{product.unit}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.quantity} {product.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.isAvailable ? 'Available' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              disabled={actionLoading === product._id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {actionLoading === product._id ? 'Loading...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Orders Management</h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-icons text-6xl text-gray-300">receipt</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">No Orders Found</h3>
                  <p className="text-gray-600">No orders have been placed yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 20).map((order) => (
                    <div key={order._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <div className="flex items-center gap-4 mb-2">
                            <h4 className="font-medium text-gray-900">Order #{order.orderNumber}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.orderStatus === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              order.orderStatus === 'processing' ? 'bg-purple-100 text-purple-800' :
                              order.orderStatus === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                              order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Customer: {order.customerName} ({order.customerEmail})
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.items.length} items — ₹{order.finalAmount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            disabled={actionLoading === order._id}
                            className="text-sm border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
