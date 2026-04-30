import Produce from '../models/Produce.js';
import Order from '../models/Order.js';

// @desc    Add produce item
// @route   POST /api/farmer/produce
// @access  Private (Farmer only)
const addProduce = async (req, res) => {
  const {
    productName, category, pricePerKg, stockQuantity, unit,
    harvestDate, organicCertified, description, availableForBulkOrder
  } = req.body;
  
  // Parse location if it comes as a JSON string from FormData
  let location = req.body.location;
  if (typeof location === 'string') {
    try { location = JSON.parse(location); } catch(e) {}
  }

  let images = [];
  if (req.file) {
    images.push(`/uploads/${req.file.filename}`);
  } else if (req.body.images) {
    images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
  }

  const produce = await Produce.create({
    farmerId: req.user._id,
    productName, category, pricePerKg, stockQuantity, unit,
    images, harvestDate, organicCertified, description, location,
    availableForBulkOrder
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('produce:new', produce); // Emit to all consumers
  }

  res.status(201).json({
    message: 'Produce added successfully',
    produce
  });
};

// @desc    Update stock and price
// @route   PUT /api/farmer/produce/:id
// @access  Private (Farmer only)
const updateProduce = async (req, res) => {
  const { stockQuantity, pricePerKg, availableForBulkOrder } = req.body;

  const produce = await Produce.findOne({ _id: req.params.id, farmerId: req.user._id });

  if (!produce) {
    res.status(404);
    throw new Error('Produce not found or unauthorized');
  }

  if (stockQuantity !== undefined) produce.stockQuantity = stockQuantity;
  if (pricePerKg !== undefined) produce.pricePerKg = pricePerKg;
  if (availableForBulkOrder !== undefined) produce.availableForBulkOrder = availableForBulkOrder;

  const updatedProduce = await produce.save();
  
  res.json({
    message: 'Produce updated successfully',
    produce: updatedProduce
  });
};

// @desc    Soft delete produce
// @route   DELETE /api/farmer/produce/:id
// @access  Private (Farmer only)
const deleteProduce = async (req, res) => {
  const produce = await Produce.findOne({ _id: req.params.id, farmerId: req.user._id });

  if (!produce) {
    res.status(404);
    throw new Error('Produce not found or unauthorized');
  }

  produce.isDeleted = true;
  await produce.save();

  res.json({ message: 'Produce removed (soft delete)' });
};

// @desc    View all incoming orders
// @route   GET /api/farmer/orders
// @access  Private (Farmer only)
const getFarmerOrders = async (req, res) => {
  const orders = await Order.find({ farmerId: req.user._id })
    .populate('consumerId', 'fullName phoneNumber')
    .sort('-createdAt');
    
  res.json({ orders });
};

const getFarmerDashboard = async (req, res) => {
  const orders = await Order.find({ farmerId: req.user._id }).sort('-createdAt');

  const delivered = orders.filter((o) => o.status === 'delivered');
  const active = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const latestOrder = orders[0] || null;

  const totalDeliveredEarnings = delivered.reduce((sum, order) => {
    const orderTotal = order.items.reduce((s, item) => s + item.quantity * item.price, 0);
    return sum + orderTotal;
  }, 0);

  res.json({
    farmerName: req.user.fullName,
    totalDeliveredEarnings,
    pendingOrdersCount: active.length,
    latestOrder,
  });
};

const getFarmerEarnings = async (req, res) => {
  const now = new Date();
  const daysBack = 6; // last 7 days including today

  const startCurrent = new Date(now);
  startCurrent.setDate(now.getDate() - daysBack);
  startCurrent.setHours(0, 0, 0, 0);

  const startPrevious = new Date(startCurrent);
  startPrevious.setDate(startPrevious.getDate() - 7);

  const deliveredOrdersCurrent = await Order.find({
    farmerId: req.user._id,
    status: 'delivered',
    createdAt: { $gte: startCurrent },
  });

  const deliveredOrdersPrevious = await Order.find({
    farmerId: req.user._id,
    status: 'delivered',
    createdAt: { $gte: startPrevious, $lt: startCurrent },
  });

  const labels = [];
  const weeklyEarnings = new Array(7).fill(0);

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    labels.push(label);
  }

  // Add current week earnings
  for (const order of deliveredOrdersCurrent) {
    const d = new Date(order.createdAt);
    d.setHours(0, 0, 0, 0);
    const idx = Math.round((d.getTime() - startCurrent.getTime()) / (24 * 60 * 60 * 1000));
    if (idx >= 0 && idx < 7) {
      weeklyEarnings[idx] += order.items.reduce((s, item) => s + item.quantity * item.price, 0);
    }
  }

  const sumCurrent = weeklyEarnings.reduce((s, n) => s + n, 0);
  const sumPrevious = deliveredOrdersPrevious.reduce((sum, order) => {
    return sum + order.items.reduce((s, item) => s + item.quantity * item.price, 0);
  }, 0);

  const deltaPercent =
    sumPrevious > 0 ? ((sumCurrent - sumPrevious) / sumPrevious) * 100 : null;

  // Best selling produce (last 30 days, delivered orders)
  const start30 = new Date(now);
  start30.setDate(now.getDate() - 30);

  const deliveredOrders30 = await Order.find({
    farmerId: req.user._id,
    status: 'delivered',
    createdAt: { $gte: start30 },
  });

  const produceTotals = new Map();
  for (const order of deliveredOrders30) {
    for (const item of order.items) {
      const key = item.produceId.toString();
      const prev = produceTotals.get(key) || { qty: 0 };
      produceTotals.set(key, { qty: prev.qty + item.quantity });
    }
  }

  const topProduceIds = Array.from(produceTotals.entries())
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5)
    .map((e) => e[0]);

  const produceDocs = await Produce.find({ _id: { $in: topProduceIds } });
  const bestSellingProduce = topProduceIds.map((id) => {
    const doc = produceDocs.find((p) => p._id.toString() === id);
    const totals = produceTotals.get(id) || { qty: 0 };
    return {
      productId: id,
      productName: doc?.productName || 'Unknown',
      image: doc?.images?.[0] || null,
      totalQty: totals.qty,
    };
  });

  res.json({
    labels,
    weeklyEarnings,
    comparison: {
      currentWeek: sumCurrent,
      previousWeek: sumPrevious,
      deltaPercent,
    },
    bestSellingProduce,
  });
};

export { addProduce, updateProduce, deleteProduce, getFarmerOrders, getFarmerDashboard, getFarmerEarnings };
