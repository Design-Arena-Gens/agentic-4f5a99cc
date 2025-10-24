import { useState, useEffect } from 'react';
import { productAPI, categoryAPI, orderAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: '',
    featured: false
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    slug: ''
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
      fetchCategories();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll({});
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        images: productForm.images ? productForm.images.split(',').map(img => img.trim()) : []
      };

      if (editingProduct) {
        await productAPI.update(editingProduct._id, data);
      } else {
        await productAPI.create(data);
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        images: '',
        featured: false
      });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, categoryForm);
      } else {
        await categoryAPI.create(categoryForm);
      }

      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', slug: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryAPI.delete(id);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category._id || product.category,
      stock: product.stock.toString(),
      images: product.images.join(', '),
      featured: product.featured
    });
    setShowProductForm(true);
  };

  const editCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      slug: category.slug
    });
    setShowCategoryForm(true);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text mb-8">Admin Dashboard</h1>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {['products', 'categories', 'orders'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'products' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => {
                  setShowProductForm(!showProductForm);
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    description: '',
                    price: '',
                    category: '',
                    stock: '',
                    images: '',
                    featured: false
                  });
                }}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                {showProductForm ? 'Cancel' : 'Add Product'}
              </button>
            </div>

            {showProductForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      required
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      required
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images (comma-separated URLs)
                    </label>
                    <input
                      type="text"
                      value={productForm.images}
                      onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Featured Product</label>
                  </div>
                  <button
                    type="submit"
                    className="bg-accent text-white px-6 py-2 rounded-md hover:bg-orange-500"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.category?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => editProduct(product)}
                          className="text-primary hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-error hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => {
                  setShowCategoryForm(!showCategoryForm);
                  setEditingCategory(null);
                  setCategoryForm({ name: '', description: '', slug: '' });
                }}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                {showCategoryForm ? 'Cancel' : 'Add Category'}
              </button>
            </div>

            {showCategoryForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      rows="2"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-accent text-white px-6 py-2 rounded-md hover:bg-orange-500"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{category.slug}</td>
                      <td className="px-6 py-4">{category.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => editCategory(category)}
                          className="text-primary hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="text-error hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.user?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${order.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-primary hover:text-blue-700">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
