import PreBooking from '../models/PreBooking.js';

// @desc    Create a pre-booking listing (farmer)
// @route   POST /api/prebooking/create
// @access  Private (farmer)
const createPreBooking = async (req, res) => {
  const {
    produceName,
    expectedHarvestDate,
    availableQuantity,
    unit = 'kg',
    pricePerUnit = 0,
    advanceAmount = 0,
  } = req.body;

  if (!produceName || !expectedHarvestDate || availableQuantity === undefined) {
    res.status(400);
    throw new Error('produceName, expectedHarvestDate, availableQuantity are required');
  }

  const pb = await PreBooking.create({
    farmerId: req.user._id,
    produceName,
    expectedHarvestDate,
    availableQuantity: Number(availableQuantity),
    unit,
    pricePerUnit: Number(pricePerUnit) || 0,
    advanceAmount: Number(advanceAmount) || 0,
    status: 'open',
  });

  res.status(201).json({ message: 'Pre-booking created', prebooking: pb });
};

// @desc    List pre-bookings (consumer sees open, farmer sees own)
// @route   GET /api/prebooking/list
// @access  Private
const listPreBookings = async (req, res) => {
  const query = {};

  if (req.user.role === 'farmer') {
    query.farmerId = req.user._id;
  } else {
    query.status = 'open';
  }

  const list = await PreBooking.find(query).sort('-createdAt');
  res.json({ count: list.length, prebookings: list });
};

// @desc    Reserve quantity (consumer)
// @route   POST /api/prebooking/reserve
// @access  Private (consumer)
const reservePreBooking = async (req, res) => {
  const { prebookingId, quantity, amountPaid = 0 } = req.body;

  if (!prebookingId || quantity === undefined) {
    res.status(400);
    throw new Error('prebookingId and quantity are required');
  }

  const pb = await PreBooking.findById(prebookingId);
  if (!pb) {
    res.status(404);
    throw new Error('Pre-booking not found');
  }

  if (pb.status !== 'open') {
    res.status(400);
    throw new Error('Pre-booking is not open for reservations');
  }

  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    res.status(400);
    throw new Error('quantity must be a positive number');
  }

  const alreadyReserved = pb.reservations.reduce((sum, r) => sum + (r.quantity || 0), 0);
  if (alreadyReserved + qty > pb.availableQuantity) {
    res.status(400);
    throw new Error('Not enough quantity available to reserve');
  }

  pb.reservations.push({
    consumerId: req.user._id,
    quantity: qty,
    amountPaid: Number(amountPaid) || 0,
    status: 'reserved',
  });

  const nowReserved = alreadyReserved + qty;
  if (nowReserved >= pb.availableQuantity) {
    pb.status = 'reserved';
  }

  await pb.save();

  res.json({ message: 'Reserved successfully', prebooking: pb });
};

export { createPreBooking, listPreBookings, reservePreBooking };

