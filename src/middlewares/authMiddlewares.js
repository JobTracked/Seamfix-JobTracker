import jwt from 'jsonwebtoken';
import User from '../models/userModels.js'; 


const protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    //  console.log('Token:', token)
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Decoed details:', decoded)
    
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'No user' });
    }

    req.user = { id: user._id };
    next();
  } catch (error) {
    console.log('Protect Error:', error.message)
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

export default protect;
