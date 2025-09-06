  import Joi from "joi";

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   
      stripUnknown: true,  
      convert: true        
    });

    if (error) {
      const requiredFields = [];
      const validationErrors = [];
      const unknownFields = [];

      error.details.forEach(err => {
        const fieldName = err.path.join(".");

        // Check for required/empty field errors
        if (
          err.type === "any.required" || 
          err.type === "string.empty" || 
          (err.type === "any.only" && (err.context?.value === "" || err.context?.value == null))
        ) {
          if (!requiredFields.includes(fieldName)) {
            requiredFields.push(fieldName);
          }
        } else if (err.type === "object.unknown") {
          if (!unknownFields.includes(fieldName)) {
            unknownFields.push(fieldName);
          }
        } else {
          // Clean Joi's default message (remove quotes)
          const cleanMessage = err.message.replace(/\"/g, "");
          validationErrors.push(cleanMessage);
        }
      });

      let message = "";
      if (requiredFields.length > 0) {
        message += `Required fields: ${requiredFields.join(", ")}`;
      }
      if (validationErrors.length > 0) {
        if (message) message += ". ";
        message += validationErrors.join(". ");
      }
      if (unknownFields.length > 0) {
        if (message) message += ". ";
        message += `Unexpected fields: ${unknownFields.join(", ")}`;
      }

      return res.status(400).json({
        success: false,
        message
      });
    }

    req.body = value;
    next();
  };
};


const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

// ---------------- AUTH ----------------
export const signupSchema = Joi.object({
  fullName: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(passwordPattern)
    .messages({
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must include uppercase, lowercase, number, and special character.",
    })
}).unknown(true);

export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: true } })
    .lowercase()
    .max(254)
    .required(),
  password: Joi.string().required()
}).unknown(true);

// ---------------- USERS ----------------
export const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100),
  email: Joi.string().email().trim().lowercase()
})
  .min(1)
  .unknown(true)
  .messages({
    "object.min": "At least one field must be provided to update"
  });

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .required()
    .min(8)
    .pattern(passwordPattern)
    .messages({
      "string.min": "New password must be at least 8 characters long.",
      "string.pattern.base":
        "New password must include uppercase, lowercase, number, and special character."
    })
}).unknown(true);

// ---------------- JOBS ----------------
export const createJobSchema = Joi.object({
  title: Joi.string().required().trim().min(1).max(200),
  company: Joi.string().required().trim().min(1).max(100),
  status: Joi.string()
    .required()
    .trim()
    .valid("Wishlist", "Applied", "Interviewing", "Offer", "Rejected")
    .messages({
      "any.only": "status must be one of [Wishlist, Applied, Interviewing, Offer, Rejected]"
    }),
  link: Joi.string().uri().trim().allow(""),
  salary: Joi.string().trim().allow(""),
  notes: Joi.string().trim().allow("")
}).unknown(true);

export const updateJobSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  company: Joi.string().trim().min(1).max(100),
  status: Joi.string()
    .trim()
    .valid("Wishlist", "Applied", "Interviewing", "Offer", "Rejected")
    .messages({
      "any.only": "status must be one of [Wishlist, Applied, Interviewing, Offer, Rejected]"
    }),
  link: Joi.string().uri().trim().allow(""),
  salary: Joi.string().trim().allow(""),
  notes: Joi.string().trim().allow("")
})
  .min(1)
  .unknown(true)
  .messages({
    "object.min": "At least one field must be provided to update"
  });