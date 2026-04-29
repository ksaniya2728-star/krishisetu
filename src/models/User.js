const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
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
    location: {
      village: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    profileImage: {
      type: String,
    },
    
    // Farmer specific fields
    farmName: String,
    produceTypes: [String],
    farmAddress: String,

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

// Exclude password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
