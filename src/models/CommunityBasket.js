import mongoose from 'mongoose';

const communityBasketSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    apartmentName: {
      type: String,
      required: true,
    },
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        contributionAmount: { type: Number, default: 0 },
      },
    ],
    items: [
      {
        produceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produce' },
        quantity: { type: Number },
      },
    ],
    totalQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    requiredQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    contributionTotalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dropOffLocation: {
      fullAddress: { type: String, default: '' },
      landmark: { type: String, default: '' },
      coordinates: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
      },
    },
    shareableLocationLink: {
      type: String,
      default: '',
    },
    deliverySlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'locked', 'ordered', 'delivered'],
      default: 'open',
    },
    linkedOrderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
  },
  {
    timestamps: true,
  }
);

communityBasketSchema.pre('save', function (next) {
  this.totalQuantity = (this.items || []).reduce((acc, item) => acc + (item.quantity || 0), 0);
  this.contributionTotalAmount = (this.participants || []).reduce(
    (sum, p) => sum + (p.contributionAmount || 0),
    0
  );
  next();
});

const CommunityBasket = mongoose.model('CommunityBasket', communityBasketSchema);
export default CommunityBasket;
