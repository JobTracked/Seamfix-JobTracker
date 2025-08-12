import express from 'express';
import { signup, login } from '../controllers/authControllers.js';
import { validate, signupSchema, loginSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

export default router;
