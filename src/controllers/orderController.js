import Order from '../models/Order.js';

// @desc    Track order status
// @route   GET /api/orders/:orderId
// @access  Private
const trackOrder = async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId })
    .populate('consumerId', 'fullName phoneNumber')
    .populate('farmerId', 'fullName farmName phoneNumber')
    .populate('assignedDistributorId', 'fullName vehicleType vehicleNumber phoneNumber')
    .populate('items.produceId', 'productName category images unit');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Basic authorization: user must be consumer, farmer, or distributor of this order
  if (
    order.consumerId._id.toString() !== req.user._id.toString() &&
    order.farmerId._id.toString() !== req.user._id.toString() &&
    (!order.assignedDistributorId || order.assignedDistributorId._id.toString() !== req.user._id.toString())
  ) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json(order);
};

// @desc    User order history
// @route   GET /api/orders/history
// @access  Private
const getOrderHistory = async (req, res) => {
  let query = {};
  
  if (req.user.role === 'consumer') {
    query.consumerId = req.user._id;
  } else if (req.user.role === 'farmer') {
    query.farmerId = req.user._id;
  } else if (req.user.role === 'distributor') {
    query.assignedDistributorId = req.user._id;
  }

  const orders = await Order.find(query)
    .populate('items.produceId', 'productName pricePerKg')
    .sort('-createdAt');

  res.json({ count: orders.length, orders });
};

// @desc    Orders summary (active/history/total spent)
// @route   GET /api/orders/summary
// @access  Private
const getOrdersSummary = async (req, res) => {
  let query = {};

  if (req.user.role === 'consumer') {
    query.consumerId = req.user._id;
  } else if (req.user.role === 'farmer') {
    query.farmerId = req.user._id;
  } else if (req.user.role === 'distributor') {
    query.assignedDistributorId = req.user._id;
  }

  const orders = await Order.find(query).sort('-createdAt');

  const activeOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );
  const historyOrders = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'cancelled'
  );

  const totalSpent =
    req.user.role === 'consumer'
      ? orders.reduce((sum, order) => {
          // Count only non-cancelled orders as "spent"
          if (order.status === 'cancelled') return sum;
          const orderTotal = order.items.reduce((s, item) => s + item.quantity * item.price, 0);
          return sum + orderTotal;
        }, 0)
      : null;

  res.json({
    activeCount: activeOrders.length,
    historyCount: historyOrders.length,
    totalCount: orders.length,
    totalSpent,
    activeOrders,
    historyOrders,
  });
};

export { trackOrder, getOrderHistory, getOrdersSummary };
