import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/product';
import { Order } from '../types/order';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
  isOrganic: boolean;
  minimumOrderQuantity: number;
  tags: string[];
  images: string[];
  imageUrl: string; // simple URL input
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  unit: 'kg',
  category: 'vegetables',
  isOrganic: false,
  minimumOrderQuantity: 1,
  tags: [],
  images: [],
  imageUrl: ''
};

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'add-product'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalEarnings: 0, pendingOrders: 0 });
  const [productForm, setProductForm] = useState<ProductFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        apiService.getProducts({ farmer: (user as any)?._id, limit: 100 }),
        apiService.getFarmerOrders()
      ]);

      const prods = (productsRes as any).products || [];
      const ords = (ordersRes as any).orders || [];

      setProducts(prods);
      setOrders(ords);

      const totalEarnings = ords
        .filter((o: any) => o.orderStatus === 'delivered')
        .reduce((sum: number, o: Order) => sum + o.finalAmount, 0);

      setStats({
        totalProducts: prods.length,
        totalOrders: ords.length,
        totalEarnings,
        pendingOrders: ords.filter((o: any) => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).length
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setProductForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setProductForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setProductForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductForm(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }));
  };

  const addImageUrl = () => {
    if (!productForm.imageUrl.trim()) return;
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, prev.imageUrl.trim()],
      imageUrl: ''
    }));
  };

  const removeImage = (index: number) => {
    setProductForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!productForm.name.trim()) { setError('Product name is required'); return; }
    if (!productForm.description.trim()) { setError('Description is required'); return; }
    if (productForm.price <= 0) { setError('Price must be greater than 0'); return; }
    if (productForm.quantity <= 0) { setError('Quantity must be greater than 0'); return; }

    try {
      setSubmitting(true);

      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: productForm.price,
        quantity: productForm.quantity,
        unit: productForm.unit,
        category: productForm.category,
        isOrganic: productForm.isOrganic,
        minimumOrderQuantity: productForm.minimumOrderQuantity,
        tags: productForm.tags,
        images: productForm.images,
        farmerName: user?.name || 'Farmer',
        isAvailable: true
      };

      if (editingProduct) {
        await (apiService as any).updateProduct(editingProduct._id, payload);
        setSuccess('✅ Product updated successfully!');
      } else {
        await (apiService as any).createProduct(payload);
        setSuccess('✅ Product added successfully!');
      }

      setProductForm(emptyForm);
      setEditingProduct(null);
      setActiveTab('products');
      await fetchDashboardData();

    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      setDeleting(productId);
      await apiService.deleteProduct(productId);
      setSuccess('✅ Product deleted successfully!');
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      unit: product.unit,
      category: product.category,
      isOrganic: product.isOrganic,
      minimumOrderQuantity: product.minimumOrderQuantity || 1,
      tags: product.tags || [],
      images: (product.images || []).map((img: any) => typeof img === 'string' ? img : img.url),
      imageUrl: ''
    });
    setActiveTab('add-product');
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'background:#fef9c3;color:#854d0e',
      confirmed: 'background:#dbeafe;color:#1e40af',
      processing: 'background:#f3e8ff;color:#6b21a8',
      shipped: 'background:#e0e7ff;color:#3730a3',
      delivered: 'background:#dcfce7;color:#166534',
      cancelled: 'background:#fee2e2;color:#991b1b',
    };
    return map[status] || 'background:#f3f4f6;color:#374151';
  };

  if (!user || (user as any).role !== 'farmer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to register as a farmer to access this dashboard.</p>
          <Link to="/" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">Go Home</Link>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🌾 Farmer Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user.name}!</p>
          </div>
          <button
            onClick={() => { setEditingProduct(null); setProductForm(emptyForm); setActiveTab('add-product'); }}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
          >
            + Add New Product
          </button>
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex justify-between">
            {success}
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 flex border-b overflow-x-auto">
          {[
            { key: 'dashboard', label: '📊 Dashboard' },
            { key: 'products', label: '📦 My Products' },
            { key: 'orders', label: '🛒 Orders' },
            { key: 'add-product', label: editingProduct ? '✏️ Edit Product' : '➕ Add Product' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-6 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Products', value: stats.totalProducts, icon: '📦', color: '#dbeafe', text: '#1e40af' },
                { label: 'Total Orders', value: stats.totalOrders, icon: '🛒', color: '#dcfce7', text: '#166534' },
                { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: '#fef9c3', text: '#854d0e' },
                { label: 'Total Earnings', value: `₹${stats.totalEarnings.toFixed(0)}`, icon: '💰', color: '#f3e8ff', text: '#6b21a8' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                  <div style={{ background: s.color, borderRadius: '12px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: s.text }}>{s.value}</div>
                    <div className="text-sm text-gray-500">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => { setEditingProduct(null); setProductForm(emptyForm); setActiveTab('add-product'); }}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    + Add New Product
                  </button>
                  <button onClick={() => setActiveTab('products')}
                    className="w-full border border-green-600 text-green-600 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors">
                    View My Products
                  </button>
                  <button onClick={() => setActiveTab('orders')}
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    View Orders
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Products</h3>
                {products.length === 0 ? (
                  <p className="text-gray-400 text-sm">No products yet. Add your first product!</p>
                ) : (
                  <div className="space-y-3">
                    {products.slice(0, 4).map(p => (
                      <div key={p._id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg overflow-hidden flex-shrink-0">
                          {p.images?.[0] ? (
                            <img src={typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url} alt={p.name} className="w-full h-full object-cover" />
                          ) : <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                          <div className="text-xs text-gray-400">₹{p.price}/{p.unit}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.isAvailable ? 'Live' : 'Out'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">My Products ({products.length})</h2>
              <button onClick={() => { setEditingProduct(null); setProductForm(emptyForm); setActiveTab('add-product'); }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                + Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Yet</h3>
                <p className="text-gray-500 mb-6">Start adding your farm products to sell on FarmDirect.</p>
                <button onClick={() => setActiveTab('add-product')} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(product => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-50 rounded-lg overflow-hidden flex-shrink-0">
                              {product.images?.[0] ? (
                                <img src={typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any).url} alt={product.name} className="w-full h-full object-cover" />
                              ) : <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              {product.isOrganic && <span className="text-xs text-green-600 font-medium">🌱 Organic</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">{product.category}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">₹{product.price}</div>
                          <div className="text-xs text-gray-400">/{product.unit}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.quantity} {product.unit}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.isAvailable ? 'Available' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(product)}
                              className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
                              ✏️ Edit
                            </button>
                            <button onClick={() => handleDelete(product._id)}
                              disabled={deleting === product._id}
                              className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium disabled:opacity-50">
                              {deleting === product._id ? '...' : '🗑️ Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Orders ({orders.length})</h2>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-500">When customers order your products, they'll appear here.</p>
              </div>
            ) : (
              <div className="divide-y">
                {orders.map(order => (
                  <div key={order._id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.items.length} items · ₹{order.finalAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <div className="mt-2 space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="text-sm text-gray-600">
                              • {(item as any).name} × {(item as any).quantity} {(item as any).unit}
                            </div>
                          ))}
                        </div>
                      </div>
                      <span style={{
                        ...Object.fromEntries(getStatusBadge(order.orderStatus).split(';').map(s => s.split(':'))),
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
                        fontWeight: 600, textTransform: 'capitalize', display: 'inline-block'
                      } as any}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADD / EDIT PRODUCT TAB ── */}
        {activeTab === 'add-product' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {editingProduct ? 'Update your product details below' : 'Fill in the details to list your product on FarmDirect'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input type="text" name="name" value={productForm.name} onChange={handleChange} required
                    placeholder="e.g. Fresh Tomatoes"
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select name="category" value={productForm.category} onChange={handleChange} required
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="vegetables">🥬 Vegetables</option>
                    <option value="fruits">🍎 Fruits</option>
                    <option value="grains">🌾 Grains</option>
                    <option value="dairy">🥛 Dairy</option>
                    <option value="spices">🌶️ Spices</option>
                    <option value="flowers">🌸 Flowers</option>
                    <option value="seeds">🌱 Seeds</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" name="price" value={productForm.price} onChange={handleChange} required min="1"
                    placeholder="e.g. 40"
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select name="unit" value={productForm.unit} onChange={handleChange} required
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="kg">Kilogram (kg)</option>
                    <option value="litre">Litre (L)</option>
                    <option value="dozen">Dozen</option>
                    <option value="piece">Piece</option>
                    <option value="gram">Gram (g)</option>
                    <option value="ml">Millilitre (ml)</option>
                    <option value="packet">Packet</option>
                    <option value="box">Box</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Quantity *</label>
                  <input type="number" name="quantity" value={productForm.quantity} onChange={handleChange} required min="1"
                    placeholder="e.g. 100"
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                {/* Min Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Quantity *</label>
                  <input type="number" name="minimumOrderQuantity" value={productForm.minimumOrderQuantity} onChange={handleChange} required min="1"
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea name="description" value={productForm.description} onChange={handleChange} required rows={3}
                    placeholder="Describe your product — freshness, how it's grown, taste, etc."
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input type="text" value={productForm.tags.join(', ')} onChange={handleTagsChange}
                    placeholder="e.g. fresh, organic, local"
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                {/* Organic */}
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="isOrganic" name="isOrganic" checked={productForm.isOrganic} onChange={handleChange}
                    className="w-5 h-5 accent-green-600 cursor-pointer" />
                  <label htmlFor="isOrganic" className="text-sm font-medium text-gray-700 cursor-pointer">
                    🌱 This is an organic product
                  </label>
                </div>

                {/* Image URL Input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image URL</label>
                  <p className="text-xs text-gray-400 mb-2">Go to pexels.com → find your product image → right click → Copy image address → paste here</p>
                  <div className="flex gap-2">
                    <input type="text" name="imageUrl" value={productForm.imageUrl} onChange={handleChange}
                      placeholder="https://images.pexels.com/photos/..."
                      className="flex-1 border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <button type="button" onClick={addImageUrl}
                      className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 font-medium whitespace-nowrap">
                      + Add Image
                    </button>
                  </div>

                  {/* Image previews */}
                  {productForm.images.length > 0 && (
                    <div className="flex gap-3 mt-3 flex-wrap">
                      {productForm.images.map((img, i) => (
                        <div key={i} className="relative group">
                          <img src={img} alt={`img-${i}`}
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                            onError={e => (e.currentTarget.src = 'https://via.placeholder.com/100?text=Error')} />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={() => { setActiveTab('products'); setEditingProduct(null); setProductForm(emptyForm); }}
                  className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center gap-2">
                  {submitting ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editingProduct ? 'Updating...' : 'Adding...'}</>
                  ) : (
                    editingProduct ? '✅ Update Product' : '✅ Add Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
