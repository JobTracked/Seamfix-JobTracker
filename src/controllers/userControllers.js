import User from '../models/userModels.js';

// GET /api/user/me
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/user/me
export const updateProfile = async (req, res) => {
  const { fullName, email } = req.body;

  try {
    // Ensure email is not taken by another user
    const emailExists = await User.findOne({
      email,
      _id: { $ne: req.user.id }
    });

    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/users/me
export const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
