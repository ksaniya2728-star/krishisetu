import Delivery from '../models/Delivery.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

/**
 * Calculate incentive based on elapsed time.
 * Decay: lose decayRate every 5-minute block after the first 15 minutes.
 * 0-15 min → 100%, then –decayRate per 5-min block, minimum floor.
 */
function calculateIncentive(delivery) {
  const base = delivery.baseIncentive || 100;
  const decay = delivery.decayRatePerBlock || 10;
  const minimum = delivery.minimumIncentive || 20;

  if (!delivery.acceptedAt) return base;

  const elapsed = (Date.now() - new Date(delivery.acceptedAt).getTime()) / 60000; // minutes
  if (elapsed <= 15) return base;

  const blocksAfterGrace = Math.floor((elapsed - 15) / 5);
  const incentive = base - decay * blocksAfterGrace;
  return Math.max(incentive, minimum);
}

// @desc    View assigned deliveries
// @route   GET /api/distributor/deliveries
// @access  Private (Distributor only)
const getDeliveries = async (req, res) => {
  const deliveries = await Delivery.find({ distributorId: req.user._id })
    .populate({
      path: 'orderId',
      select: 'orderId deliveryAddress status items totalAmount',
      populate: [
        { path: 'consumerId', select: 'fullName phoneNumber location' },
        { path: 'farmerId', select: 'fullName phoneNumber farmAddress pickupLocation pickupAddress location' }
      ]
    })
    .sort('-createdAt');

  // Attach live incentive calculation to each active delivery
  const enriched = deliveries.map(d => {
    const obj = d.toObject();
    if (d.status !== 'delivered' && d.acceptedAt) {
      obj.liveIncentive = calculateIncentive(d);
    }
    return obj;
  });

  res.json({ deliveries: enriched });
};

// @desc    Dashboard stats
// @route   GET /api/distributor/dashboard
// @access  Private (Distributor only)
const getDashboardStats = async (req, res) => {
  const all = await Delivery.find({ distributorId: req.user._id });
  const active = all.filter(d => d.status !== 'delivered');
  const completed = all.filter(d => d.status === 'delivered');
  const totalEarnings = completed.reduce((sum, d) => sum + (d.currentIncentive || 0), 0);

  // Get current active delivery for map preview
  const activeDelivery = active.length > 0
    ? await Delivery.findById(active[0]._id).populate({
        path: 'orderId',
        select: 'orderId deliveryAddress status',
        populate: [
          { path: 'consumerId', select: 'fullName location' },
          { path: 'farmerId', select: 'fullName pickupLocation location' }
        ]
      })
    : null;

  res.json({
    activeCount: active.length,
    completedCount: completed.length,
    totalEarnings,
    activeDelivery: activeDelivery ? activeDelivery.toObject() : null,
  });
};

// @desc    Accept delivery task
// @route   PUT /api/distributor/accept/:orderId
// @access  Private (Distributor only)
const acceptDelivery = async (req, res) => {
  const delivery = await Delivery.findOne({ orderId: req.params.orderId, distributorId: req.user._id });
  
  if (!delivery) {
    res.status(404);
    throw new Error('Delivery task not found');
  }

  const now = new Date();
  delivery.status = 'accepted';
  delivery.acceptedAt = now;
  delivery.expectedDeliveryTime = new Date(now.getTime() + (delivery.deliveryTimeMinutes || 30) * 60000);
  delivery.baseIncentive = 100;
  delivery.currentIncentive = 100;
  delivery.statusHistory.push({ status: 'accepted', notes: 'Distributor accepted the delivery' });
  await delivery.save();

  // Also update Order status
  const order = await Order.findById(req.params.orderId);
  if (order) {
    order.status = 'accepted';
    order.assignedDistributorId = req.user._id;
    order.statusHistory.push({ status: 'accepted', updatedBy: req.user._id });
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(order.consumerId.toString()).emit('order:update', order);
      io.to(order.farmerId.toString()).emit('order:update', order);
      io.to(req.user._id.toString()).emit('delivery_accepted', { delivery, order });
    }
  }

  res.json({ message: 'Delivery task accepted', delivery });
};

// @desc    Mark as picked up
// @route   PUT /api/distributor/pickup/:orderId
// @access  Private (Distributor only)
const markPickedUp = async (req, res) => {
  const delivery = await Delivery.findOne({ orderId: req.params.orderId, distributorId: req.user._id });
  
  if (!delivery) {
    res.status(404);
    throw new Error('Delivery task not found');
  }

  delivery.status = 'picked_up';
  delivery.pickupTime = Date.now();
  delivery.statusHistory.push({ status: 'picked_up', notes: 'Produce picked up from farmer' });
  await delivery.save();

  const order = await Order.findById(req.params.orderId);
  if (order) {
    order.status = 'picked_up';
    order.statusHistory.push({ status: 'picked_up', updatedBy: req.user._id });
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(order.consumerId.toString()).emit('order:update', order);
      io.to(order.farmerId.toString()).emit('order:update', order);
      io.to(req.user._id.toString()).emit('pickup_confirmed', { delivery, order });
    }
  }

  res.json({ message: 'Marked as picked up', delivery });
};

// @desc    Mark as delivered — stops timer and calculates final incentive
// @route   PUT /api/distributor/delivered/:orderId
// @access  Private (Distributor only)
const markDelivered = async (req, res) => {
  const delivery = await Delivery.findOne({ orderId: req.params.orderId, distributorId: req.user._id });
  
  if (!delivery) {
    res.status(404);
    throw new Error('Delivery task not found');
  }

  // Calculate final incentive
  const finalIncentive = calculateIncentive(delivery);

  delivery.status = 'delivered';
  delivery.deliveredTime = Date.now();
  delivery.currentIncentive = finalIncentive;
  delivery.statusHistory.push({ status: 'delivered', notes: `Delivered. Incentive: ₹${finalIncentive}` });
  await delivery.save();

  // Update distributor wallet
  const distributor = await User.findById(req.user._id);
  if (distributor) {
    const currentBalance = parseFloat(distributor.walletBalance || '0');
    distributor.walletBalance = String(currentBalance + finalIncentive);
    await distributor.save();
  }

  const order = await Order.findById(req.params.orderId);
  if (order) {
    order.status = 'delivered';
    order.statusHistory.push({ status: 'delivered', updatedBy: req.user._id });
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(order.consumerId.toString()).emit('order:update', order);
      io.to(order.farmerId.toString()).emit('order:update', order);
      io.to(req.user._id.toString()).emit('delivery_completed', { delivery, order, incentive: finalIncentive });
    }
  }

  res.json({ message: 'Marked as delivered', delivery, incentive: finalIncentive });
};

export { getDeliveries, getDashboardStats, acceptDelivery, markPickedUp, markDelivered };
