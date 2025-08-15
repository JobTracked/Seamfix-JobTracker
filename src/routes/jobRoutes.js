import express from 'express';
import { createJob, deleteJob, getJobs, updateJob } from '../controllers/jobControllers.js';
import protect from '../middlewares/authMiddlewares.js';
import { validate, createJobSchema, updateJobSchema } from '../middlewares/validationMiddleware.js';


const router = express.Router();

router.get('/', protect, getJobs );
router.post('/create', protect, validate(createJobSchema), createJob ); 
router.put('/:jobId', protect, validate(updateJobSchema), updateJob); 
router.delete('/:jobId', protect, deleteJob ); 
export default router; 