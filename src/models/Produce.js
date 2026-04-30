import mongoose from 'mongoose';

const produceSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    pricePerKg: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      default: 'kg',
    },
    images: [String],
    harvestDate: {
      type: Date,
      required: true,
    },
    organicCertified: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    availableForBulkOrder: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create 2dsphere index for geospatial queries
produceSchema.index({ location: '2dsphere' });

const Produce = mongoose.model('Produce', produceSchema);
export default Produce;
