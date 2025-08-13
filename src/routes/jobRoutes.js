import express from 'express';
import { createJob, deleteJob, getJobs, updateJob } from '../controllers/jobControllers.js';
import protect from '../middlewares/authMiddlewares.js';


const router = express.Router();

router.get('/', protect, getJobs );
router.post('/', protect, createJob );
router.put('/:id',protect, updateJob );
router.delete('/:id', protect, deleteJob );

export default router;