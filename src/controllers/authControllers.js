import jwt from 'jsonwebtoken';
import User from '../models/userModels.js'; 
import { sendMail } from '../utils/email.js';
import crypto from 'crypto'

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate password reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};


export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = await User.create({ fullName, email, password });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
     message: "User created successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,  
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      message: "login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt, 
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        message: 'If an account with that email exists, a reset link has been sent'
      });
    }

    const resetToken = generateResetToken();
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetTokenExpiry = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const message = `Hi ${user.fullName},

You have requested to reset the password of your Job Tracker account.

Please click the following link to reset your password:
${resetUrl}

This link will expire in 2 days.

In case you did not request this change, please DO NOT click the link and instead ignore and delete this email.

Best regards,
Job Tracker Team`;

    await sendMail({
      email: user.email,
      subject: 'Reset Password - Job Tracker',
      message: message
    });

    res.status(200).json({
      message: 'If an account with that email exists, a reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ 
        message: "Invalid or missing token",
        valid: false 
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Token is invalid or expired",
        valid: false 
      });
    }

    res.status(200).json({ 
      message: "Token is valid",
      valid: true,
      email: user.email
    });

  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ 
      message: "Server error",
      valid: false 
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;   
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Invalid or missing token" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or expired" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    // Send confirmation email
    const confirmationMessage = `Hi ${user.fullName},

Your password has been successfully reset for your Job Tracker account.

You can now sign in with your new password.

If you did not make this change, please contact support immediately.

Best regards,
Job Tracker Team`;

    try {
      await sendMail({
        email: user.email,
        subject: 'Password Reset Successful - Job Tracker',
        message: confirmationMessage
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.status(200).json({ 
      message: "Password has been reset successfully",
      success: true 
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};