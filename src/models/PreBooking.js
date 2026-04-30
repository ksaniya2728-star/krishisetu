import mongoose from 'mongoose';

const preBookingSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    produceName: {
      type: String,
      required: true,
      trim: true,
    },
    expectedHarvestDate: {
      type: Date,
      required: true,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: 'kg',
    },
    pricePerUnit: {
      type: Number,
      default: 0,
      min: 0,
    },
    advanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['open', 'reserved', 'closed', 'cancelled'],
      default: 'open',
    },
    reservations: [
      {
        consumerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        quantity: { type: Number, min: 0 },
        amountPaid: { type: Number, min: 0, default: 0 },
        status: { type: String, enum: ['reserved', 'cancelled'], default: 'reserved' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const PreBooking = mongoose.model('PreBooking', preBookingSchema);
export default PreBooking;

