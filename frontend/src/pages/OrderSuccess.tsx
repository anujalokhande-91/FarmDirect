import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, message } = location.state || {};

  useEffect(() => {
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {message || 'Your order has been placed successfully with Cash on Delivery'}
          </p>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">Rs. {order.finalAmount?.toFixed(2) || '0.00'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">Cash on Delivery</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status:</span>
                <span className="font-medium text-yellow-600">Pending</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Delivery:</span>
                <span className="font-medium">
                  {order.estimatedDelivery ? 
                    new Date(order.estimatedDelivery).toLocaleDateString() : 
                    '3-4 business days'
                  }
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Address:</span>
                <span className="font-medium text-right max-w-xs">
                  {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, 
                  {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            
            <div className="space-y-3">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {item.unit} × Rs. {item.price}
                    </p>
                  </div>
                  <span className="font-medium">
                    Rs. {(item.quantity * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/orders"
              className="btn-primary inline-block"
            >
              View My Orders
            </Link>
            
            <div className="text-sm text-gray-600">
              <p>Thank you for choosing FarmDirect!</p>
              <p>You'll receive updates about your order via email.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
