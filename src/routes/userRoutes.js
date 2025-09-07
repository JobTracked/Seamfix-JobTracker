import express from 'express';
import { protect } from '../middlewares/authMiddlewares.js';
import { getProfile, updateProfile, updatePassword} from '../controllers/userControllers.js';
import { changePasswordSchema, updateProfileSchema, validate } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, validate(updateProfileSchema), updateProfile);
router.put('/me/password', protect,validate(changePasswordSchema), updatePassword);


export default router

