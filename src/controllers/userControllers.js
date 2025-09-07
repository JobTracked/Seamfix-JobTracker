import bcrypt from 'bcryptjs';
import User from '../models/userModels.js';

// GET /api/users/me
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      message: "User profile retrieved successfully ✅",
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/me
export const updateProfile = async (req, res) => {
  const { fullName, email } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, email },
      { new: true } // no need for runValidators (handled by Joi)
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: "Your profile has been updated successfully",
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/me/password
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      message: "Your password has been updated successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
