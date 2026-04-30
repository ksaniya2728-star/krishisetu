import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { validatePhone, validateEmail, validatePassword } from '../utils/validators.js';

// @desc    Register a new user (Farmer, Consumer, Distributor)
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  const {
    fullName,
    phoneNumber,
    email,
    password,
    role,
    location,
    profileImage,
    // Farmer fields
    farmName,
    produceTypes,
    farmAddress,
    // Consumer fields
    apartmentName,
    preferredDeliverySlot,
    // Distributor fields
    vehicleType,
    vehicleNumber,
    licenseNumber,
    availabilityStatus,
    deliveryRadiusKm,
  } = req.body;

  // Basic Validation
  if (!fullName || !phoneNumber || !password || !role) {
    res.status(400);
    throw new Error('Please add all required fields: fullName, phoneNumber, password, role');
  }

  if (!validatePhone(phoneNumber)) {
    res.status(400);
    throw new Error('Please enter a valid 10-digit phone number');
  }

  if (email && !validateEmail(email)) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }

  if (!validatePassword(password)) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const validRoles = ['farmer', 'consumer', 'distributor'];
  if (!validRoles.includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  // Check if user exists
  const userExists = await User.findOne({
    $or: [{ phoneNumber }, { email: email ? email.toLowerCase() : null }],
  });

  if (userExists) {
    res.status(400);
    throw new Error('User with this phone number or email already exists');
  }


  // Create user
  const user = await User.create({
    fullName,
    phoneNumber,
    email: email ? email.toLowerCase() : undefined,
    password,
    role,
    location,
    profileImage,
    farmName,
    produceTypes,
    farmAddress,
    apartmentName,
    preferredDeliverySlot,
    vehicleType,
    vehicleNumber,
    licenseNumber,
    availabilityStatus,
    deliveryRadiusKm,
  });

  if (user) {
    res.status(201).json({
      message: 'Signup successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { phoneOrEmail, password } = req.body;

  if (!phoneOrEmail || !password) {
    res.status(400);
    throw new Error('Please provide phone/email and password');
  }

  // Check for user email or phone
  const user = await User.findOne({
    $or: [
      { email: phoneOrEmail.toLowerCase() },
      { phoneNumber: phoneOrEmail },
    ],
  });

  if (user && (await user.matchPassword(password))) {
    res.json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        profileImage: user.profileImage,
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json(user); // Password is excluded by toJSON method in User model
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.profileImage = req.body.profileImage || user.profileImage;
    
    // Update location if provided
    if (req.body.location) {
      user.location = { ...user.location, ...req.body.location };
    }

    // Role specific updates
    if (user.role === 'farmer') {
      user.farmName = req.body.farmName || user.farmName;
      user.produceTypes = req.body.produceTypes || user.produceTypes;
      user.farmAddress = req.body.farmAddress || user.farmAddress;
    }

    if (user.role === 'consumer') {
      user.apartmentName = req.body.apartmentName || user.apartmentName;
      user.preferredDeliverySlot = req.body.preferredDeliverySlot || user.preferredDeliverySlot;
    }

    if (user.role === 'distributor') {
      user.vehicleType = req.body.vehicleType || user.vehicleType;
      user.vehicleNumber = req.body.vehicleNumber || user.vehicleNumber;
      user.licenseNumber = req.body.licenseNumber || user.licenseNumber;
      if (req.body.availabilityStatus !== undefined) {
        user.availabilityStatus = req.body.availabilityStatus;
      }
      user.deliveryRadiusKm = req.body.deliveryRadiusKm || user.deliveryRadiusKm;
    }

    // Update password if provided
    if (req.body.password) {
      if (!validatePassword(req.body.password)) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  // Since we are using stateless JWTs, client side must discard the token.
  res.json({ message: 'Logged out successfully' });
};

// @desc    Onboarding completion
// @route   PUT /api/auth/onboarding
// @access  Private
const onboarding = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (user.role === 'farmer') {
      user.farmName = req.body.farmName || user.farmName;
      if (Array.isArray(req.body.produceTypes)) {
        user.produceTypes = req.body.produceTypes;
      } else if (typeof req.body.produceTypes === 'string') {
        user.produceTypes = req.body.produceTypes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      user.farmAddress = req.body.farmAddress || user.farmAddress;

      if (req.body.landSize !== undefined) {
        const n = Number(req.body.landSize);
        user.landSize = Number.isFinite(n) ? n : user.landSize;
      }
      if (req.body.landUnit) {
        user.landUnit = req.body.landUnit;
      }

      if (req.body.pickupAddress && typeof req.body.pickupAddress === 'object') {
        user.pickupAddress = {
          ...(user.pickupAddress || {}),
          ...req.body.pickupAddress,
        };
      }

      if (req.body.pickupLocation && typeof req.body.pickupLocation === 'object') {
        const lat = req.body.pickupLocation.latitude;
        const lng = req.body.pickupLocation.longitude;
        user.pickupLocation = {
          latitude: lat === null || lat === undefined ? user.pickupLocation?.latitude ?? null : Number(lat),
          longitude: lng === null || lng === undefined ? user.pickupLocation?.longitude ?? null : Number(lng),
        };
      }
    }

    if (user.role === 'consumer') {
      user.apartmentName = req.body.apartmentName || user.apartmentName;
      user.preferredDeliverySlot = req.body.preferredDeliverySlot || user.preferredDeliverySlot;
    }

    if (user.role === 'distributor') {
      if (!req.body.vehicleType && !user.vehicleType) {
        res.status(400);
        throw new Error('Vehicle type is required for onboarding');
      }
      if (!req.body.vehicleNumber && !user.vehicleNumber) {
        res.status(400);
        throw new Error('Vehicle number is required for onboarding');
      }
      user.vehicleType = req.body.vehicleType || user.vehicleType;
      user.vehicleNumber = req.body.vehicleNumber || user.vehicleNumber;
      user.licenseNumber = req.body.licenseNumber || user.licenseNumber;
      if (req.body.availabilityStatus !== undefined) {
        user.availabilityStatus = req.body.availabilityStatus;
      }
      user.deliveryRadiusKm = req.body.deliveryRadiusKm || user.deliveryRadiusKm;
    }

    // Safely construct location object
    const location = req.body.location || {};
    const safeLocation = {
      village: location.village || "",
      city: location.city || "",
      state: location.state || "",
      pincode: location.pincode || "",
      coordinates: {
        latitude: location.coordinates?.latitude ?? null,
        longitude: location.coordinates?.longitude ?? null
      }
    };

    user.location = safeLocation;

    // Mark onboarding as completed (required by mobile client flow)
    user.onboardingCompleted = true;

    const updatedUser = await user.save();

    res.json({
      message: 'Onboarding completed successfully',
      user: updatedUser,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Search users by name or username
// @route   GET /api/auth/search?query=...
// @access  Private
const searchUsers = async (req, res) => {
  const { query, role } = req.query;
  
  const filter = {};
  if (query) {
    filter.$or = [
      { fullName: { $regex: query, $options: 'i' } },
      { username: { $regex: query, $options: 'i' } }
    ];
  }
  if (role) {
    filter.role = role;
  }

  const users = await User.find(filter)
    .select('fullName username profileImage role farmName')
    .limit(10);

  res.json({ users });
};

export { signup, login, getProfile, updateProfile, logout, onboarding, searchUsers };
