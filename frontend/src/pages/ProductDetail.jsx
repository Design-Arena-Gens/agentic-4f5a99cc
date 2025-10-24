import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../utils/api';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-primary hover:text-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div>
              <div className="mb-4 bg-gray-200 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`border-2 rounded-md overflow-hidden ${
                        selectedImage === index ? 'border-primary' : 'border-gray-300'
                      }`}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-text mb-4">{product.name}</h1>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
              </div>

              {product.category && (
                <div className="mb-4">
                  <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {product.category.name}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div className="mb-6">
                <p className={`text-lg font-semibold ${product.stock > 0 ? 'text-success' : 'text-error'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </p>
              </div>

              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-3 rounded-md text-lg font-semibold transition ${
                  product.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-accent text-white hover:bg-orange-500'
                }`}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
