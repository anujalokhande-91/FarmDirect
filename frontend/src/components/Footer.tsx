import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">FarmDirect</h3>
            <p className="text-gray-300 text-sm mb-4">
              Connecting farmers directly with customers for fresh, quality produce.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-4.594 3.417 4.916 4.916 0 00-.225.019 13.88 13.88 0 006.681 1.879 4.925 4.925 0 002.964-1.019 9.867 9.867 0 01-2.832 3.015 4.9 4.9 0 002.233-.61 4.9 4.9 0 00-4.727-4.775 9.9 9.9 0 002.958 1.027c.193-.03.388-.063.581-.1a13.938 13.938 0 006.841-1.019 4.925 4.925 0 002.964-1.015 9.837 9.837 0 01-2.833 3.015 4.9 4.9 0 002.233-.61 4.9 4.9 0 00-4.726-4.775 9.9 9.9 0 002.958 1.027c.193-.03.388-.063.581-.1a13.938 13.938 0 006.841-1.019 4.925 4.925 0 002.964-1.015 9.837 9.837 0 01-2.833 3.015 4.9 4.9 0 002.233-.61 4.9 4.9 0 00-4.726-4.775 9.9 9.9 0 002.958 1.027z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-white text-sm">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-white text-sm">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/complaints" className="text-gray-300 hover:text-white text-sm">
                  File a Complaint
                </Link>
              </li>
            </ul>
          </div>

          {/* For Farmers */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">For Farmers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/farmer/register" className="text-gray-300 hover:text-white text-sm">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/farmer/guide" className="text-gray-300 hover:text-white text-sm">
                  Seller Guide
                </Link>
              </li>
              <li>
                <Link to="/farmer/support" className="text-gray-300 hover:text-white text-sm">
                  Farmer Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 FarmDirect. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
