import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let users = [];
let products = [];
let categories = [];
let orders = [];

let userIdCounter = 1;
let productIdCounter = 1;
let categoryIdCounter = 1;
let orderIdCounter = 1;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production', {
    expiresIn: '30d'
  });
};

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    req.user = users.find(user => user._id === decoded.id);

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = users.find(user => user.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      _id: userIdCounter++,
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: email === 'admin@test.com' ? 'admin' : 'user',
      isEmailVerified: true,
      isPhoneVerified: false,
      addresses: []
    };

    users.push(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email);

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/auth/profile', protect, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.post('/api/categories', protect, admin, (req, res) => {
  try {
    const { name, description, slug } = req.body;

    const categoryExists = categories.find(cat => cat.slug === slug);
    if (categoryExists) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }

    const category = {
      _id: categoryIdCounter++,
      name,
      description: description || '',
      slug
    };

    categories.push(category);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/categories/:id', protect, admin, (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const categoryIndex = categories.findIndex(cat => cat._id === categoryId);

    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description, slug } = req.body;
    categories[categoryIndex] = {
      ...categories[categoryIndex],
      name: name || categories[categoryIndex].name,
      description: description !== undefined ? description : categories[categoryIndex].description,
      slug: slug || categories[categoryIndex].slug
    };

    res.json(categories[categoryIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/categories/:id', protect, admin, (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const categoryIndex = categories.findIndex(cat => cat._id === categoryId);

    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }

    categories.splice(categoryIndex, 1);
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products', (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, featured } = req.query;

    let filteredProducts = [...products];

    if (category) {
      filteredProducts = filteredProducts.filter(product => product.category === parseInt(category));
    }

    if (search) {
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (featured === 'true') {
      filteredProducts = filteredProducts.filter(product => product.featured);
    }

    const productsWithCategory = filteredProducts.map(product => ({
      ...product,
      category: categories.find(cat => cat._id === product.category) || { name: 'Unknown', slug: 'unknown' }
    }));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = productsWithCategory.slice(startIndex, endIndex);

    res.json({
      products: paginatedProducts,
      totalPages: Math.ceil(filteredProducts.length / limit),
      currentPage: parseInt(page),
      total: filteredProducts.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p._id === productId);

    if (product) {
      const productWithCategory = {
        ...product,
        category: categories.find(cat => cat._id === product.category) || { name: 'Unknown', slug: 'unknown' }
      };
      res.json(productWithCategory);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', protect, admin, (req, res) => {
  try {
    const { name, description, price, category, images, stock, featured } = req.body;

    const product = {
      _id: productIdCounter++,
      name,
      description,
      price: parseFloat(price),
      category: parseInt(category),
      images: images || [],
      stock: parseInt(stock),
      featured: featured || false,
      rating: 0,
      numReviews: 0
    };

    products.push(product);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/products/:id', protect, admin, (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p._id === productId);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, price, category, images, stock, featured } = req.body;
    products[productIndex] = {
      ...products[productIndex],
      name: name || products[productIndex].name,
      description: description || products[productIndex].description,
      price: price !== undefined ? parseFloat(price) : products[productIndex].price,
      category: category ? parseInt(category) : products[productIndex].category,
      images: images || products[productIndex].images,
      stock: stock !== undefined ? parseInt(stock) : products[productIndex].stock,
      featured: featured !== undefined ? featured : products[productIndex].featured
    };

    res.json(products[productIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/products/:id', protect, admin, (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p._id === productId);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    products.splice(productIndex, 1);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/orders', protect, (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = {
      _id: orderIdCounter++,
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: false,
      isDelivered: false,
      status: 'pending',
      createdAt: new Date()
    };

    orders.push(order);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders/myorders', protect, (req, res) => {
  try {
    const userOrders = orders.filter(order => order.user === req.user._id).map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: products.find(p => p._id === item.product) || { name: 'Product not found' }
      }))
    }));

    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders', protect, admin, (req, res) => {
  try {
    const allOrders = orders.map(order => ({
      ...order,
      user: users.find(u => u._id === order.user) || { name: 'User not found' },
      items: order.items.map(item => ({
        ...item,
        product: products.find(p => p._id === item.product) || { name: 'Product not found' }
      }))
    }));

    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/orders/:id/status', protect, admin, (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const orderIndex = orders.findIndex(order => order._id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status } = req.body;
    orders[orderIndex].status = status;

    if (status === 'delivered') {
      orders[orderIndex].isDelivered = true;
      orders[orderIndex].deliveredAt = new Date();
    }

    res.json(orders[orderIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/orders/:id/pay', protect, (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const orderIndex = orders.findIndex(order => order._id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }

    orders[orderIndex].isPaid = true;
    orders[orderIndex].paidAt = new Date();
    orders[orderIndex].paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address
    };

    orders[orderIndex].items.forEach(item => {
      const productIndex = products.findIndex(p => p._id === item.product);
      if (productIndex !== -1) {
        products[productIndex].stock -= item.quantity;
      }
    });

    res.json(orders[orderIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'E-Commerce API is running' });
});

const seedData = () => {
  categories.push(
    { _id: 1, name: 'Electronics', description: 'Electronic devices and gadgets', slug: 'electronics' },
    { _id: 2, name: 'Clothing', description: 'Fashion and apparel', slug: 'clothing' },
    { _id: 3, name: 'Books', description: 'Books and literature', slug: 'books' },
    { _id: 4, name: 'Home & Garden', description: 'Home improvement and garden supplies', slug: 'home-garden' }
  );
  categoryIdCounter = 5;

  products.push(
    {
      _id: 1,
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation and long battery life.',
      price: 99.99,
      category: 1,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
      stock: 50,
      featured: true,
      rating: 4.5,
      numReviews: 128
    },
    {
      _id: 2,
      name: 'Smartphone Case',
      description: 'Durable protective case for smartphones with shock absorption.',
      price: 24.99,
      category: 1,
      images: ['https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500'],
      stock: 100,
      featured: false,
      rating: 4.2,
      numReviews: 64
    },
    {
      _id: 3,
      name: 'Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt available in multiple colors.',
      price: 19.99,
      category: 2,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
      stock: 75,
      featured: true,
      rating: 4.0,
      numReviews: 45
    },
    {
      _id: 4,
      name: 'Programming Book',
      description: 'Learn modern web development with this comprehensive guide.',
      price: 39.99,
      category: 3,
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'],
      stock: 30,
      featured: false,
      rating: 4.8,
      numReviews: 92
    },
    {
      _id: 5,
      name: 'Indoor Plant Pot',
      description: 'Beautiful ceramic pot perfect for indoor plants and herbs.',
      price: 15.99,
      category: 4,
      images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500'],
      stock: 25,
      featured: false,
      rating: 4.3,
      numReviews: 18
    },
    {
      _id: 6,
      name: 'Laptop Stand',
      description: 'Adjustable aluminum laptop stand for better ergonomics.',
      price: 49.99,
      category: 1,
      images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'],
      stock: 40,
      featured: true,
      rating: 4.6,
      numReviews: 73
    }
  );
  productIdCounter = 7;

  console.log('Sample data seeded successfully!');
};

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

seedData();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using in-memory database for development');
  console.log('Note: Data will be lost when server restarts');
});
