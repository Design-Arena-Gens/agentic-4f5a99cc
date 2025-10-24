import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  createPaymentIntent,
  updateOrderToPaid
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getUserOrders);
router.get('/', protect, admin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.post('/payment-intent', protect, createPaymentIntent);
router.put('/:id/pay', protect, updateOrderToPaid);

export default router;
