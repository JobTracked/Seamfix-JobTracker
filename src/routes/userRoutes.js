import express from 'express';
import { registerUser, getProfile, updateProfile, deleteProfile, getAllUsers } from '../controllers/userControllers.js';
import auth from '../middlewares/authMiddlewares.js';
import { protect } from '../middlewares/authMiddlewares.js';



const router = express.Router();
router.post('/register', registerUser)
router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);
router.delete('/me', auth, deleteProfile);
router.get('/', protect, getAllUsers);



export default router;
