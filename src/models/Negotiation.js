import mongoose from 'mongoose';

const negotiationSchema = new mongoose.Schema(
  {
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    produceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produce',
    },
    threadId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'accepted', 'rejected', 'closed'],
      default: 'open',
    },
    offers: [
      {
        fromRole: { type: String, enum: ['consumer', 'farmer'], required: true },
        pricePerUnit: { type: Number, required: true, min: 0 },
        quantity: { type: Number, default: 1, min: 0 },
        note: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Negotiation = mongoose.model('Negotiation', negotiationSchema);
export default Negotiation;

