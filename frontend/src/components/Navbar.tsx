import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">FD</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FarmDirect</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>
              Home
            </Link>
            <Link to="/products" className={`nav-link ${isActive('/products') ? 'nav-link-active' : ''}`}>
              Products
            </Link>
            
            {user ? (
              <>
                <Link to="/cart" className="nav-link relative">
                  Cart
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {/* Cart count will be added later */}
                    0
                  </span>
                </Link>
                <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'nav-link-active' : ''}`}>
                  Orders
                </Link>
                
                {user.role === 'farmer' && (
                  <Link to="/farmer/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                )}
                
                {user.role === 'admin' && (
                  <Link to="/admin" className="nav-link">
                    Admin
                  </Link>
                )}
                
                <div className="relative group">
                  <button className="nav-link flex items-center space-x-1">
                    <span>{user.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={`nav-link ${isActive('/login') ? 'nav-link-active' : ''}`}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                Home
              </Link>
              <Link to="/products" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                Products
              </Link>
              
              {user ? (
                <>
                  <Link to="/cart" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                    Cart
                  </Link>
                  <Link to="/orders" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                    Orders
                  </Link>
                  
                  {user.role === 'farmer' && (
                    <Link to="/farmer/dashboard" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                      Dashboard
                    </Link>
                  )}
                  
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                      Admin
                    </Link>
                  )}
                  
                  <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                    Login
                  </Link>
                  <Link to="/register" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
