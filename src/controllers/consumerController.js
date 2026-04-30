import Produce from '../models/Produce.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import CommunityBasket from '../models/CommunityBasket.js';
import crypto from 'crypto';

// @desc    Browse nearby farmer produce
// @route   GET /api/consumer/nearby-produce
// @access  Private (Consumer only)
const getNearbyProduce = async (req, res) => {
  const { lat, lng, distanceKm = 10, sort = 'nearest' } = req.query;

  let query = { isDeleted: false };
  let produceList = [];

  if (lat && lng) {
    // Geospatial query
    produceList = await Produce.find({
      ...query,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(distanceKm) * 1000 // Convert km to meters
        }
      }
    }).populate('farmerId', 'fullName farmName farmAddress profileImage');
  } else {
    // Fallback if no coordinates provided
    produceList = await Produce.find(query).populate('farmerId', 'fullName farmName farmAddress profileImage');
  }

  // Sort logic
  if (sort === 'price') {
    produceList.sort((a, b) => a.pricePerKg - b.pricePerKg);
  } else if (sort === 'freshness') {
    produceList.sort((a, b) => new Date(b.harvestDate) - new Date(a.harvestDate));
  }

  res.json({ count: produceList.length, produce: produceList });
};

// @desc    Add item to cart
// @route   POST /api/consumer/cart
// @access  Private (Consumer only)
const addToCart = async (req, res) => {
  const { produceId, quantity } = req.body;

  const produce = await Produce.findById(produceId);
  if (!produce || produce.isDeleted) {
    res.status(404);
    throw new Error('Produce not found');
  }

  if (produce.stockQuantity < quantity) {
    res.status(400);
    throw new Error('Not enough stock available');
  }

  let cart = await Cart.findOne({ consumerId: req.user._id });

  if (!cart) {
    cart = new Cart({ consumerId: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(item => item.produceId.toString() === produceId);

  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].priceSnapshot = produce.pricePerKg; // Update to latest price
  } else {
    cart.items.push({
      produceId,
      quantity,
      priceSnapshot: produce.pricePerKg
    });
  }

  await cart.save();
  res.json({ message: 'Added to cart', cart });
};

// @desc    Create order
// @route   POST /api/consumer/place-order
// @access  Private (Consumer only)
const placeOrder = async (req, res) => {
  const { cartItems, deliveryAddress, paymentMethod, deliverySlot } = req.body;

  if (!cartItems || cartItems.length === 0) {
    res.status(400);
    throw new Error('No items in order');
  }

  // Group items by farmerId since one order should ideally be per farmer for delivery logic
  // For simplicity here, we assume cartItems are from the same farmer or we create multiple orders.
  // We'll just create one order per farmer present in the cart items.

  const produceIds = cartItems.map(item => item.produceId);
  const produceDetails = await Produce.find({ _id: { $in: produceIds } });

  if (produceDetails.length !== cartItems.length) {
    res.status(400);
    throw new Error('Some produce items were not found');
  }

  // Group by farmer
  const ordersByFarmer = {};

  for (const item of cartItems) {
    const produce = produceDetails.find(p => p._id.toString() === item.produceId.toString());
    
    if (produce.stockQuantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${produce.productName}`);
    }

    const farmerIdStr = produce.farmerId.toString();
    if (!ordersByFarmer[farmerIdStr]) {
      ordersByFarmer[farmerIdStr] = [];
    }

    ordersByFarmer[farmerIdStr].push({
      produceId: produce._id,
      quantity: item.quantity,
      price: produce.pricePerKg
    });

    // Deduct stock
    produce.stockQuantity -= item.quantity;
    await produce.save();
  }

  const createdOrders = [];
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 1); // Deliver tomorrow

  for (const [farmerId, items] of Object.entries(ordersByFarmer)) {
    const order = await Order.create({
      orderId: 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      consumerId: req.user._id,
      farmerId,
      items,
      deliveryAddress,
      paymentMethod,
      deliverySlot,
      estimatedDelivery,
      statusHistory: [{ status: 'pending', updatedBy: req.user._id }]
    });
    createdOrders.push(order);

    const io = req.app.get('io');
    if (io) {
      io.to(farmerId.toString()).emit('order:new', order);
      io.to(req.user._id.toString()).emit('order:update', order);
    }
  }

  // Clear cart if needed
  await Cart.findOneAndDelete({ consumerId: req.user._id });

  res.status(201).json({
    message: 'Order placed successfully',
    orders: createdOrders
  });
};

// @desc    Create bulk apartment/community order
// @route   POST /api/consumer/community-basket
// @access  Private (Consumer only)
const createCommunityBasket = async (req, res) => {
  const { apartmentName, participants, items, deliverySlot } = req.body;

  let totalQuantity = 0;
  if (items && items.length > 0) {
    totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  }

  const basket = await CommunityBasket.create({
    creatorId: req.user._id,
    apartmentName,
    participants,
    items,
    totalQuantity,
    deliverySlot
  });

  res.status(201).json({
    message: 'Community basket created successfully',
    basket
  });
};

export { getNearbyProduce, addToCart, placeOrder, createCommunityBasket };
