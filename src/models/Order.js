import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  produceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produce',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
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
    items: [orderItemSchema],
    deliveryAddress: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE'],
      required: true,
    },
    deliverySlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'packed', 'picked_up', 'on_route', 'delivered', 'cancelled'],
      default: 'pending',
    },
    estimatedDelivery: {
      type: Date,
    },
    assignedDistributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusHistory: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    communityBasketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityBasket',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
