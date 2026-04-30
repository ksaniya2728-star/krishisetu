import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    distributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'accepted', 'picked_up', 'on_route', 'delivered'],
      default: 'assigned',
    },
    pickupTime: {
      type: Date,
    },
    deliveredTime: {
      type: Date,
    },

    // Incentive timer fields
    acceptedAt: {
      type: Date,
    },
    expectedDeliveryTime: {
      type: Date,
    },
    deliveryTimeMinutes: {
      type: Number,
      default: 30,
    },
    baseIncentive: {
      type: Number,
      default: 100,
    },
    currentIncentive: {
      type: Number,
      default: 100,
    },
    minimumIncentive: {
      type: Number,
      default: 20,
    },
    decayRatePerBlock: {
      type: Number,
      default: 10, // ₹10 per 5-minute block
    },

    statusHistory: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Delivery = mongoose.model('Delivery', deliverySchema);
export default Delivery;
