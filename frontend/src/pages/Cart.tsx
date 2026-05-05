import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Cart, CartItem, CartSummary } from '../types/cart';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Cart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');
      const [cartResponse, summaryResponse] = await Promise.all([
        apiService.getCart(),
        apiService.getCartSummary()
      ]);
      setCart((cartResponse as any).cart);
      setSummary((summaryResponse as any).summary);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!cart || newQuantity < 1) return;
    try {
      setUpdating(productId);
      setError('');
      await apiService.updateCartItem(productId, newQuantity);
      await fetchCart();
    } catch (err: any) {
      setError(err.message || 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    if (!cart) return;
    try {
      setRemoving(productId);
      setError('');
      await apiService.removeFromCart(productId);
      await fetchCart();
    } catch (err: any) {
      setError(err.message || 'Failed to remove item');
    } finally {
      setRemoving(null);
    }
  };

  const clearCart = async () => {
    if (!cart) return;
    if (!window.confirm('Are you sure you want to clear the cart?')) return;
    try {
      setClearingCart(true);
      setError('');
      await apiService.clearCart();
      await fetchCart();
    } catch (err: any) {
      setError(err.message || 'Failed to clear cart');
    } finally {
      setClearingCart(false);
    }
  };

  const getProductImage = (item: CartItem) => {
    const img = item.product.images?.[0];
    if (!img) return 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg';
    if (typeof img === 'string') return img;
    return (img as any).url || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg';
  };

  const getProductPrice = (item: CartItem) => {
    return item.product.discountPrice || item.product.price;
  };

  const getItemTotal = (item: CartItem) => {
    return getProductPrice(item) * item.quantity;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login to View Your Cart</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
          <Link to="/login" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {cart && cart.items && cart.items.length > 0
              ? `You have ${cart.items.length} item${cart.items.length > 1 ? 's' : ''} in your cart`
              : 'Your cart is empty'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {(!cart || !cart.items || cart.items.length === 0) ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some fresh products to your cart!</p>
            <Link to="/products" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                  <button
                    onClick={clearCart}
                    disabled={clearingCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    {clearingCart ? 'Clearing...' : 'Clear Cart'}
                  </button>
                </div>

                <div className="space-y-6">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex flex-col sm:flex-row gap-4 pb-6 border-b last:border-b-0">

                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getProductImage(item)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg';
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link
                              to={`/products/${item.product._id}`}
                              className="text-lg font-semibold text-gray-900 hover:text-green-600"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-gray-600">
                              Sold by {item.product.farmer?.name || 'Test User'}
                            </p>
                            {(item.product as any).isOrganic && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                                Organic
                              </span>
                            )}
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.product._id)}
                            disabled={removing === item.product._id}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 ml-2"
                            title="Remove item"
                          >
                            {removing === item.product._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex justify-between items-end flex-wrap gap-2">
                          <div>
                            <div className="flex items-baseline space-x-2">
                              {item.product.discountPrice ? (
                                <>
                                  <span className="text-lg font-bold text-green-600">
                                    ₹{item.product.discountPrice}
                                  </span>
                                  <span className="text-sm text-gray-500 line-through">
                                    ₹{item.product.price}
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg font-bold text-green-600">
                                  ₹{item.product.price}
                                </span>
                              )}
                              <span className="text-gray-500 text-sm">/{item.product.unit}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Total: ₹{getItemTotal(item)}
                            </div>
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">Qty:</label>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updating === item.product._id}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                              >
                                -
                              </button>
                              <span className="w-10 text-center py-1 font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.quantity || updating === item.product._id}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                              >
                                +
                              </button>
                            </div>
                            {updating === item.product._id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

                {summary && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({summary.totalItems} items)</span>
                      <span>₹{summary.subtotal?.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Charge</span>
                      <span>
                        {summary.deliveryCharge === 0 ? (
                          <span className="text-green-600 font-medium">FREE</span>
                        ) : (
                          `₹${summary.deliveryCharge?.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    {summary.deliveryCharge === 0 && (
                      <div className="text-sm text-green-600">
                        🎉 Free delivery on orders above ₹500
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>₹{summary.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <Link
                    to="/checkout"
                    className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 font-medium"
                  >
                    Proceed to Checkout
                  </Link>

                  <Link
                    to="/products"
                    className="block w-full border border-green-600 text-green-600 text-center py-3 rounded-lg hover:bg-green-50 font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-4 border-t flex items-center justify-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure Checkout
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
