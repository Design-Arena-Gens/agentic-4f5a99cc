import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-text mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link to="/" className="bg-primary text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-semibold text-text">{order._id}</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-semibold text-text">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="font-bold text-primary text-xl">${order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-text mb-3">Order Items</h3>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden mr-4">
                              {item.product?.images && item.product.images.length > 0 ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-text">{item.product?.name || 'Product'}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-text">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>
                        {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
