import express from 'express';
import { signup, login, forgotPassword, resetPassword } from '../controllers/authControllers.js';
import { validate, signupSchema, loginSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.put('/forgotPassword', forgotPassword);
router.put('/reset-password', resetPassword);

export default router;
