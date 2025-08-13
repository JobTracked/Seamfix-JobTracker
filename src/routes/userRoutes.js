import express from 'express';
import { protect } from '../middlewares/authMiddlewares.js';
import { getProfile, updateProfile, updatePassword} from '../controllers/userControllers.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, updatePassword);

export default router;
