import express from 'express';
import { signup, login, forgotPassword,verifyResetToken, resetPassword } from '../controllers/authControllers.js';
import { validate, signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.put('/forgotPassword', validate(forgotPasswordSchema), forgotPassword);
router.get('/verify-reset', verifyResetToken);
router.put('/reset-password', validate(resetPasswordSchema),resetPassword);

export default router;
