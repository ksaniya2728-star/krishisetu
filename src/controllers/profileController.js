import User from '../models/User.js';

// @desc    Update user profile image
// @route   PUT /api/profile/image
// @access  Private
const updateProfileImage = async (req, res) => {
  const { profileImage } = req.body;

  if (!profileImage) {
    res.status(400);
    throw new Error('Please provide an image URL');
  }

  const user = await User.findById(req.user._id);

  if (user) {
    user.profileImage = profileImage;
    const updatedUser = await user.save();

    res.json({
      message: 'Profile image updated successfully',
      profileImage: updatedUser.profileImage,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

export { updateProfileImage };
