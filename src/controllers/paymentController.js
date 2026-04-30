import Payment from '../models/Payment.js';
import PaymentMethod from '../models/PaymentMethod.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import crypto from 'crypto';

// @desc    Get saved payment methods for user
// @route   GET /api/payments/methods
// @access  Private
const getMethods = async (req, res) => {
  const methods = await PaymentMethod.find({ userId: req.user._id }).sort('-isDefault -createdAt');

  // Also fetch wallet balance from User
  const user = await User.findById(req.user._id).select('walletBalance');
  const walletBalance = user?.walletBalance || '0';

  res.json({
    success: true,
    walletBalance,
    methods,
  });
};

// @desc    Add a payment method
// @route   POST /api/payments/add-method
// @access  Private
const addMethod = async (req, res) => {
  const { type, name, detail, isDefault } = req.body;

  if (!type || !name || !detail) {
    res.status(400);
    throw new Error('type, name, and detail are required');
  }

  // If setting as default, unset existing defaults
  if (isDefault) {
    await PaymentMethod.updateMany({ userId: req.user._id }, { isDefault: false });
  }

  const method = await PaymentMethod.create({
    userId: req.user._id,
    type,
    name,
    detail,
    isDefault: isDefault || false,
  });

  res.status(201).json({ success: true, method });
};

// @desc    Remove a payment method
// @route   DELETE /api/payments/remove/:id
// @access  Private
const removeMethod = async (req, res) => {
  const method = await PaymentMethod.findOne({ _id: req.params.id, userId: req.user._id });

  if (!method) {
    res.status(404);
    throw new Error('Payment method not found');
  }

  await method.deleteOne();
  res.json({ success: true, message: 'Payment method removed' });
};

// @desc    Generate payment order
// @route   POST /api/payments/create
// @access  Private
const createPayment = async (req, res) => {
  const { amount, currency = 'INR', orderId } = req.body;

  // Verify order belongs to user
  const order = await Order.findById(orderId);
  if (!order || order.consumerId.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Order not found or unauthorized');
  }

  // Generate a mock Razorpay Order ID for structure
  const razorpayOrderId = 'order_' + crypto.randomBytes(7).toString('hex');

  const payment = await Payment.create({
    orderId,
    userId: req.user._id,
    amount,
    currency,
    razorpayOrderId
  });

  res.status(201).json({
    message: 'Payment order created',
    razorpayOrderId,
    amount,
    currency
  });
};

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const payment = await Payment.findOne({ razorpayOrderId, userId: req.user._id });

  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  // Mock success
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status = 'successful';
  await payment.save();

  res.json({ message: 'Payment verified successfully', payment });
};

export { getMethods, addMethod, removeMethod, createPayment, verifyPayment };
