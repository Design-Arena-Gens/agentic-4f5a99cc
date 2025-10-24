import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <Link to={`/product/${product._id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-64 bg-gray-200">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-text mb-2 truncate">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`px-4 py-2 rounded-md transition ${
                product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-accent text-white hover:bg-orange-500'
              }`}
            >
              Add to Cart
            </button>
          </div>

          {product.stock > 0 && product.stock < 10 && (
            <p className="text-error text-sm mt-2">Only {product.stock} left!</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
