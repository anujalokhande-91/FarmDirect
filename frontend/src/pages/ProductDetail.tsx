import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types/product';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProductById(id!);
      setProduct((response as any).product);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    if (!product) return;

    try {
      setAddingToCart(true);
      await apiService.addToCart(product._id, quantity);
      // You could show a success message or update cart count here
      console.log('Product added to cart');
    } catch (err: any) {
      setError(err.message || 'Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (product) {
      if (newQuantity >= product.minimumOrderQuantity) {
        if (!product.maximumOrderQuantity || newQuantity <= product.maximumOrderQuantity) {
          setQuantity(newQuantity);
        }
      }
    }
  };

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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || 'Product not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>
              <span className="text-gray-500">/</span>
            </li>
            <li>
              <Link to="/products" className="text-gray-500 hover:text-gray-700">
                Products
              </Link>
            </li>
            <li>
              <span className="text-gray-500">/</span>
            </li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-2"> vegetables</div>
                    <p>No Image Available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-500' : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {product.isOrganic && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Organic
                  </span>
                )}
                <span className="text-sm text-gray-500 capitalize">{product.category}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {'\u2605'.repeat(Math.floor(product.rating.average))}
                    {'\u2606'.repeat(5 - Math.floor(product.rating.average))}
                  </div>
                  <span className="text-sm text-gray-500 ml-1">
                    ({product.rating.count} reviews)
                  </span>
                </div>
                
                <span className="text-gray-400">|</span>
                
                <span className="text-sm text-gray-600">
                  Sold by {product.farmerName}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-2 mb-4">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-bold text-primary-600">
                      ${product.discountPrice}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${product.price}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      Save ${product.price - product.discountPrice}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary-600">
                    ${product.price}
                  </span>
                )}
                <span className="text-gray-500">/{product.unit}</span>
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {product.quantity > 0 ? (
                  <span className="text-green-600 font-medium">
                    In Stock ({product.quantity} {product.unit} available)
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Product Details</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Category:</dt>
                  <dd className="text-gray-900 capitalize">{product.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Unit:</dt>
                  <dd className="text-gray-900">{product.unit}</dd>
                </div>
                {product.season && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Season:</dt>
                    <dd className="text-gray-900 capitalize">{product.season}</dd>
                  </div>
                )}
                {product.harvestDate && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Harvest Date:</dt>
                    <dd className="text-gray-900">
                      {new Date(product.harvestDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {product.expiryDate && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Best Before:</dt>
                    <dd className="text-gray-900">
                      {new Date(product.expiryDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Min Order:</dt>
                  <dd className="text-gray-900">
                    {product.minimumOrderQuantity} {product.unit}
                  </dd>
                </div>
                {product.maximumOrderQuantity && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Max Order:</dt>
                    <dd className="text-gray-900">
                      {product.maximumOrderQuantity} {product.unit}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Quantity Selector and Add to Cart */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= product.minimumOrderQuantity}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 text-center border-0 focus:ring-0"
                    min={product.minimumOrderQuantity}
                    max={product.maximumOrderQuantity || product.quantity}
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={
                      quantity >= (product.maximumOrderQuantity || product.quantity) ||
                      quantity >= product.quantity
                    }
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.unit}
                </span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0 || addingToCart}
                  className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
                    product.quantity === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : addingToCart
                      ? 'bg-gray-300 text-gray-700'
                      : 'btn-primary'
                  }`}
                >
                  {addingToCart ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding to Cart...
                    </span>
                  ) : product.quantity === 0 ? (
                    'Out of Stock'
                  ) : (
                    `Add to Cart - $${(product.discountPrice || product.price) * quantity}`
                  )}
                </button>

                <Link
                  to="/cart"
                  className="block w-full py-3 px-6 text-center border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View Cart
                </Link>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Farmer Information */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">About the Farmer</h3>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl"> farmer</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{product.farmerName}</h4>
              <p className="text-gray-600">Local Farmer</p>
              <Link
                to={`/farmer/${product.farmer._id}`}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                View Farm Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
