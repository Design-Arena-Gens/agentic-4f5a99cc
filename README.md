# E-Commerce Full-Stack Application

A complete MERN-style e-commerce platform with React frontend and Node.js backend.

## 🚀 Live Demo

**Frontend:** https://agentic-4f5a99cc.vercel.app

## 📋 Features

### Customer Features
- **Product Browsing**: Browse products by category with search functionality
- **Product Details**: View detailed product information with image gallery
- **Shopping Cart**: Add/remove items, update quantities
- **User Authentication**: Register, login with JWT authentication
- **Checkout Process**: Complete order with shipping address
- **Order History**: View past orders and their status

### Admin Features
- **Product Management**: Create, edit, delete products
- **Category Management**: Manage product categories
- **Order Management**: View all orders and update their status
- **Inventory Control**: Track stock levels

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **In-memory storage** - Data persistence (development)

## 📁 Project Structure

```
agentic-4f5a99cc/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── context/     # Context providers
    │   ├── pages/       # Page components
    │   ├── utils/       # API utilities
    │   └── App.jsx      # Main app component
    └── dist/            # Production build
```

## 🎨 Design System

### Color Palette
- **Primary**: #2563eb (blue-600)
- **Accent**: #f59e42 (orange-400)
- **Background**: #f9fafb (gray-50)
- **Text**: #1e293b (gray-800)
- **Success**: #22c55e (green-500)
- **Error**: #ef4444 (red-500)

## 🔑 Default Admin Account

For testing admin features:
- **Email**: admin@test.com
- **Password**: admin123

## 🚀 Local Development

### Backend Setup
```bash
cd backend
npm install
npm start
```
Server runs on http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

## 📦 Sample Data

The backend automatically seeds sample data including:
- 4 product categories (Electronics, Clothing, Books, Home & Garden)
- 6 sample products with images from Unsplash
- Ready-to-use admin account

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders/myorders` - Get user orders (protected)
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)
- `PUT /api/orders/:id/pay` - Mark order as paid (protected)

## 📝 Notes

- **Data Persistence**: Currently uses in-memory storage. Data resets on server restart.
- **Payment Integration**: Stripe integration is set up but uses demo mode.
- **Email Verification**: Email service configured but requires SMTP credentials.
- **Mobile Responsive**: Fully responsive design for all screen sizes.

## 🔮 Future Enhancements

- MongoDB integration for persistent storage
- Real payment processing with Stripe
- Product reviews and ratings
- Wishlist functionality
- Coupon codes and discounts
- Multi-vendor support
- Push notifications
- Analytics dashboard

## 📄 License

MIT License

## 👨‍💻 Development

Built with ❤️ by Devin

**Link to Devin run**: https://app.devin.ai/sessions/031f499b21fe48a2b9229e2a5325e33d
**Requested by**: Design Arena Founders (founders@designarena.ai) - @grxxce
