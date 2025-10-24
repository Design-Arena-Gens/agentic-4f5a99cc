import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">ShopHub</h1>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-text hover:text-primary transition">
              Home
            </Link>
            <Link to="/products" className="text-text hover:text-primary transition">
              Products
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-text hover:text-primary transition">
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <svg className="w-6 h-6 text-text hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/orders" className="text-text hover:text-primary">
                  Orders
                </Link>
                <span className="text-text">Hi, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="text-primary hover:text-blue-700 px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
