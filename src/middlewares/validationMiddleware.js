import Joi from 'joi';

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message.replace(/['"]/g, '')
      });
    }
    next();
  };
};

// Auth validation schemas
export const signupSchema = Joi.object({
  fullName: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().required().min(6)
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().required()
});

// User validation schemas
export const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100),
  email: Joi.string().email().trim().lowercase()
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(6)
});

// Job validation schemas
export const createJobSchema = Joi.object({
  title: Joi.string().required().trim().max(200),
  company: Joi.string().required().trim().max(100),
  status: Joi.string().valid('Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected').required(),
  link: Joi.string().uri().allow(''),
  salary: Joi.string().allow(''),
  notes: Joi.string().allow('')
});

export const updateJobSchema = Joi.object({
  title: Joi.string().trim().max(200),
  company: Joi.string().trim().max(100),
  status: Joi.string().valid('Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'),
  link: Joi.string().uri().allow(''),
  salary: Joi.string().allow(''),
  notes: Joi.string().allow('')
});