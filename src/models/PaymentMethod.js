import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['upi', 'card', 'wallet', 'cod'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;
