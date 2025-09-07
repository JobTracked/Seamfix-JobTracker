import mongoose from 'mongoose';

// this Validates MongoDB ObjectId in URL; and also sends 400 if invalid, else calls next().
const validateObjectId = (req, res, next) => {
  const isValid = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid user ID format' });

  }
  next();
};

export default validateObjectId;
