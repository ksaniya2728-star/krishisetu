import Negotiation from '../models/Negotiation.js';

function makeThreadId(consumerId, farmerId, produceId) {
  const base = [String(consumerId), String(farmerId)].sort().join('__');
  return produceId ? `${base}__${String(produceId)}` : base;
}

// @desc    Create negotiation thread (consumer)
// @route   POST /api/negotiation/create
// @access  Private (consumer)
const createNegotiation = async (req, res) => {
  const { farmerId, produceId, pricePerUnit, quantity = 1, note = '' } = req.body;

  if (!farmerId || pricePerUnit === undefined) {
    res.status(400);
    throw new Error('farmerId and pricePerUnit are required');
  }

  const threadId = makeThreadId(req.user._id, farmerId, produceId);

  let negotiation = await Negotiation.findOne({ threadId, status: { $in: ['open'] } });

  if (!negotiation) {
    negotiation = await Negotiation.create({
      consumerId: req.user._id,
      farmerId,
      produceId,
      threadId,
      status: 'open',
      offers: [
        {
          fromRole: 'consumer',
          pricePerUnit: Number(pricePerUnit),
          quantity: Number(quantity) || 1,
          note,
        },
      ],
    });
  } else {
    negotiation.offers.push({
      fromRole: 'consumer',
      pricePerUnit: Number(pricePerUnit),
      quantity: Number(quantity) || 1,
      note,
    });
    await negotiation.save();
  }

  res.status(201).json({ message: 'Negotiation created', negotiation });
};

// @desc    Respond to negotiation (farmer)
// @route   PUT /api/negotiation/respond
// @access  Private (farmer)
const respondNegotiation = async (req, res) => {
  const { negotiationId, action, pricePerUnit, quantity = 1, note = '' } = req.body;

  if (!negotiationId || !action) {
    res.status(400);
    throw new Error('negotiationId and action are required');
  }

  const negotiation = await Negotiation.findById(negotiationId);
  if (!negotiation) {
    res.status(404);
    throw new Error('Negotiation not found');
  }

  if (negotiation.farmerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to respond');
  }

  if (action === 'accept') {
    negotiation.status = 'accepted';
  } else if (action === 'reject') {
    negotiation.status = 'rejected';
  } else if (action === 'counter') {
    if (pricePerUnit === undefined) {
      res.status(400);
      throw new Error('pricePerUnit required for counter offer');
    }
    negotiation.offers.push({
      fromRole: 'farmer',
      pricePerUnit: Number(pricePerUnit),
      quantity: Number(quantity) || 1,
      note,
    });
  } else {
    res.status(400);
    throw new Error('Invalid action');
  }

  await negotiation.save();

  res.json({ message: 'Negotiation updated', negotiation });
};

// @desc    Negotiation history for user
// @route   GET /api/negotiation/history
// @access  Private
const negotiationHistory = async (req, res) => {
  const query =
    req.user.role === 'consumer'
      ? { consumerId: req.user._id }
      : req.user.role === 'farmer'
        ? { farmerId: req.user._id }
        : {};

  const negotiations = await Negotiation.find(query).sort('-updatedAt').limit(200);
  res.json({ count: negotiations.length, negotiations });
};

export { createNegotiation, respondNegotiation, negotiationHistory };

