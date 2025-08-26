import Joi from 'joi';

// Universal validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, 
      stripUnknown: true, 
      convert: true 
    });

    if (error) {
      return res.status(400).json({
        errors: error.details.map((err) => err.message.replace(/['"]/g, ''))
      });
    }
    req.body = value;
    next();
  };
};

// Allows any special character
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

// Auth validation schemas
export const signupSchema = Joi.object({
  fullName: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(passwordPattern)
    .messages({
      'string.min': 'Password must be at least 8 characters long.',
      'string.pattern.base':
        'Password must include uppercase, lowercase, number, and special character.'
    })
});

export const loginSchema = Joi.object({
email: Joi.string()
  .trim()
  .email({ tlds: { allow: true } })
  .lowercase()
  .max(254)
  .required(),
  password: Joi.string().required()
});

// User validation schemas
export const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100),
  email: Joi.string().email().required().trim().lowercase(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .required()
    .min(8)
    .pattern(passwordPattern)
    .messages({
      'string.min': 'New password must be at least 8 characters long.',
      'string.pattern.base':
        'New password must include uppercase, lowercase, number, and special character.'
    })
});

// Job validation schemas
export const createJobSchema = Joi.object({
  title: Joi.string().required().trim().max(200),
  company: Joi.string().required().trim().max(100),
  status: Joi.string().trim()
    .valid('Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected')
    .required(),
  link: Joi.string().uri().trim().allow(''),
  salary: Joi.string().trim().allow(''),
  notes: Joi.string().trim().allow('')
});

export const updateJobSchema = Joi.object({
  title: Joi.string().trim().max(200),
  company: Joi.string().trim().max(100),
  status: Joi.string().trim().valid('Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'),
  link: Joi.string().uri().trim().allow(''),
  salary: Joi.string().trim().allow(''),
  notes: Joi.string().trim().allow('')
}).min(1).messages({
  'object.min': 'At least one field must be provided to update'
});
