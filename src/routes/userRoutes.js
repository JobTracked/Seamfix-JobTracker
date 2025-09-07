import express from 'express';
import { protect } from '../middlewares/authMiddlewares.js';
import { getProfile, updateProfile, updatePassword} from '../controllers/userControllers.js';
<<<<<<< HEAD
import { changePasswordSchema, updateProfileSchema, validate } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, validate(updateProfileSchema), updateProfile);
router.put('/me/password', protect,validate(changePasswordSchema), updatePassword);
=======
import { validate, updateProfileSchema, changePasswordSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.get('/me', protect,  getProfile);
router.put('/me', protect, validate(updateProfileSchema), updateProfile);
router.put('/me/password', protect, validate(changePasswordSchema), updatePassword);
>>>>>>> c3ead432088c66a81158e13a9b9a09b5467ca804

export default router;
