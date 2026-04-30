import CommunityBasket from '../models/CommunityBasket.js';

// @desc    Create a community basket (consumer)
// @route   POST /api/community/create
// @access  Private (consumer)
const createCommunity = async (req, res) => {
  const { apartmentName, deliverySlot, requiredQuantity = 0, items = [] } = req.body;

  if (!apartmentName || !deliverySlot) {
    res.status(400);
    throw new Error('apartmentName and deliverySlot are required');
  }

  const basket = await CommunityBasket.create({
    creatorId: req.user._id,
    apartmentName,
    deliverySlot,
    requiredQuantity: Number(requiredQuantity) || 0,
    participants: [{ userId: req.user._id, contributionAmount: 0 }],
    items,
    status: 'open',
  });

  const io = req.app.get('io');
  if (io) io.emit('pool:update', basket);

  res.status(201).json({ message: 'Community basket created', basket });
};

// @desc    Join a community basket
// @route   POST /api/community/join
// @access  Private (consumer)
const joinCommunity = async (req, res) => {
  const { basketId, contributionAmount = 0 } = req.body;

  if (!basketId) {
    res.status(400);
    throw new Error('basketId is required');
  }

  const basket = await CommunityBasket.findById(basketId);
  if (!basket) {
    res.status(404);
    throw new Error('Basket not found');
  }

  const existing = basket.participants.find(
    (p) => p.userId?.toString() === req.user._id.toString()
  );

  if (existing) {
    existing.contributionAmount = Number(contributionAmount) || existing.contributionAmount;
  } else {
    basket.participants.push({
      userId: req.user._id,
      contributionAmount: Number(contributionAmount) || 0,
    });
  }

  await basket.save();

  const io = req.app.get('io');
  if (io) io.emit('pool:update', basket);

  res.json({ message: 'Joined community basket', basket });
};

// @desc    Update common drop-off location
// @route   PUT /api/community/location
// @access  Private (consumer)
const updateCommunityLocation = async (req, res) => {
  const { basketId, dropOffLocation } = req.body;

  if (!basketId || !dropOffLocation) {
    res.status(400);
    throw new Error('basketId and dropOffLocation are required');
  }

  const basket = await CommunityBasket.findById(basketId);
  if (!basket) {
    res.status(404);
    throw new Error('Basket not found');
  }

  // Only creator can set drop-off location
  if (basket.creatorId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only basket creator can update location');
  }

  basket.dropOffLocation = {
    ...(basket.dropOffLocation || {}),
    ...dropOffLocation,
    coordinates: {
      latitude: dropOffLocation.coordinates?.latitude ?? basket.dropOffLocation?.coordinates?.latitude ?? null,
      longitude: dropOffLocation.coordinates?.longitude ?? basket.dropOffLocation?.coordinates?.longitude ?? null,
    },
  };

  // Simple shareable link
  if (basket.dropOffLocation.coordinates.latitude && basket.dropOffLocation.coordinates.longitude) {
    const { latitude, longitude } = basket.dropOffLocation.coordinates;
    basket.shareableLocationLink = `https://maps.google.com/?q=${latitude},${longitude}`;
  }

  await basket.save();

  const io = req.app.get('io');
  if (io) io.emit('pool:update', basket);

  res.json({ message: 'Drop-off location updated', basket });
};

// @desc    List open community baskets
// @route   GET /api/community/list
// @access  Private (consumer)
const listCommunity = async (req, res) => {
  const { status = 'open' } = req.query;
  const query = {};
  if (status) query.status = status;

  const baskets = await CommunityBasket.find(query).sort('-createdAt').limit(50);
  res.json({ count: baskets.length, baskets });
};

export { createCommunity, joinCommunity, updateCommunityLocation, listCommunity };

