import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { encrypt, decrypt } from '../utils/encryption.js';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      set: encrypt,
      get: decrypt,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['farmer', 'consumer', 'distributor'],
      required: [true, 'Role is required'],
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        village: { type: String, default: "", set: encrypt, get: decrypt },
        city: { type: String, default: "", set: encrypt, get: decrypt },
        state: { type: String, default: "", set: encrypt, get: decrypt },
        pincode: { type: String, default: "", set: encrypt, get: decrypt },
        coordinates: {
          latitude: { type: Number, default: null },
          longitude: { type: Number, default: null }
        }
      },
      default: { village: "", city: "", state: "", pincode: "", coordinates: { latitude: null, longitude: null } }
    },
    profileImage: { type: String },
    
    // Farmer specific fields
    farmName: String,
    produceTypes: [String],
    farmAddress: { type: String, set: encrypt, get: decrypt },
    landSize: { type: Number, default: null, min: 0 },
    landUnit: { type: String, enum: ['acres', 'hectares'], default: null },
    pickupAddress: {
      fullAddress: { type: String, default: '', set: encrypt, get: decrypt },
      village: { type: String, default: '', set: encrypt, get: decrypt },
      city: { type: String, default: '', set: encrypt, get: decrypt },
      state: { type: String, default: '', set: encrypt, get: decrypt },
      pincode: { type: String, default: '', set: encrypt, get: decrypt },
      landmark: { type: String, default: '', set: encrypt, get: decrypt },
    },
    pickupLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },

    // Consumer specific fields
    apartmentName: String,
    preferredDeliverySlot: String,

    // Distributor specific fields
    vehicleType: {
      type: String,
      enum: ['bike', 'auto', 'mini_truck', 'cycle'],
    },
    vehicleNumber: String,
    licenseNumber: String,
    availabilityStatus: {
      type: Boolean,
      default: true,
    },
    deliveryRadiusKm: Number,
    walletBalance: {
      type: String,
      default: encrypt('0'),
      set: encrypt,
      get: decrypt,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Exclude password and ensure getters run for JSON output
userSchema.set('toJSON', { getters: true, transform: (doc, ret) => {
  delete ret.password;
  return ret;
}});
userSchema.set('toObject', { getters: true });

const User = mongoose.model('User', userSchema);

export default User;

