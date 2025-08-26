// middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]; // e.g. "email"
    return res.status(400).json({
      message: `${field} already exists`,
    });
  }

  // Joi validation error
  if (err.isJoi) {
    return res.status(400).json({
      message: err.details[0].message,
    });
  }

  // Default fallback
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};
