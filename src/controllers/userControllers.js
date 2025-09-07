import bcrypt from 'bcryptjs';
import User from '../models/userModels.js';

<<<<<<< HEAD
// GET /api/users/me
=======
>>>>>>> c3ead432088c66a81158e13a9b9a09b5467ca804
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
<<<<<<< HEAD
      message: "User profile retrieved successfully ✅",
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt
=======
      message: "User profile retrieved successfully",
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
>>>>>>> c3ead432088c66a81158e13a9b9a09b5467ca804
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

<<<<<<< HEAD
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
=======

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email === user.email) {
      return res.status(400).json({ message: "You are already using this email" });
    }

    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(409).json({ message: "Email already in use by another user" });
      }
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

>>>>>>> c3ead432088c66a81158e13a9b9a09b5467ca804
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

<<<<<<< HEAD
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      message: "Your password has been updated successfully"
    });
=======
    user.password = newPassword;
    await user.save();

   return res.status(204).send(); 
>>>>>>> c3ead432088c66a81158e13a9b9a09b5467ca804
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
