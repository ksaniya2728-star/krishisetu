import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  produceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produce',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  priceSnapshot: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totalAmount before saving
cartSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + item.quantity * item.priceSnapshot;
  }, 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
