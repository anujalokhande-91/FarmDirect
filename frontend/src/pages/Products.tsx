import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product, ProductFilters } from '../types/product';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,   // ✅ FIXED: was 12, now 50
    total: 0,
    pages: 0
  });
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const initialFilters: ProductFilters = {};

    if (searchParams.get('category')) {
      initialFilters.category = searchParams.get('category') || undefined;
    }

    if (searchParams.get('search')) {
      initialFilters.search = searchParams.get('search') || undefined;
      setSearchTerm(searchParams.get('search') || '');
    }

    setFilters(initialFilters);
    fetchProducts(initialFilters, 1);
  }, [searchParams]);

  const fetchProducts = async (currentFilters: ProductFilters = filters, page: number = pagination.page) => {
    try {
      setLoading(true);

      const response = await apiService.getProducts({
        page: page,
        limit: 50,  // ✅ FIXED: always fetch 50
        ...currentFilters
      });

      setProducts((response as any).products);
      setPagination((response as any).pagination);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const newFilters = {
      ...filters,
      search: searchTerm,
      page: 1
    };

    setFilters(newFilters);
    fetchProducts(newFilters, 1);
  };

  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      setAddingToCart(productId);
      await apiService.addToCart(productId, quantity);
      alert('Added to cart successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchProducts(filters, newPage);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fresh Farm Products
          </h1>
          <p className="text-gray-600">
            Discover quality products directly from local farmers
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8 flex gap-4">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Search
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="text-red-500 mb-6 p-4 bg-red-50 rounded-lg">{error}</div>
        )}

        {/* Total count */}
        <div className="mb-4 text-gray-600 text-sm">
          Showing {products.length} of {pagination.total} products
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link to={`/products/${product._id}`}>
                  <img
                    src={
                      typeof product.images?.[0] === 'string'
                        ? product.images[0]
                        : (product.images?.[0] as any)?.url || '/placeholder.jpg'
                    }
                    alt={product.name}
                    className="w-full h-52 object-cover hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg';
                    }}
                  />
                </Link>

                <div className="p-4">
                  <h2 className="font-semibold text-lg mb-1">
                    {product.name}
                  </h2>

                  <p className="text-sm text-gray-500 mb-2">
                    by {product.farmerName}
                  </p>

                  <div className="mb-3">
                    {product.discountPrice ? (
                      <>
                        <span className="text-lg font-bold text-green-600">
                          ₹{product.discountPrice}
                        </span>
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ₹{product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-green-600">
                        ₹{product.price}
                      </span>
                    )}
                    <span className="text-sm text-gray-500 ml-1">
                      /{product.unit}
                    </span>
                  </div>

                  <div className="mb-3 text-sm">
                    {product.quantity > 0 ? (
                      <span className="text-green-600">
                        In Stock ({product.quantity})
                      </span>
                    ) : (
                      <span className="text-red-500">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={addingToCart === product._id || product.quantity === 0}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addingToCart === product._id ? 'Adding...' : 'Add To Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination - shows if more than 1 page */}
        {pagination.pages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>

            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 border rounded-lg ${
                  pagination.page === page
                    ? 'bg-green-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Products;
