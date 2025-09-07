import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import database from "./src/config/database.js";
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import jobsRoutes from "./src/routes/jobRoutes.js"
import { errorHandler } from "./src/middlewares/errorHandlerMiddleware.js";


dotenv.config();
database();

 
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (keep-alive endpoint)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy ✅",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobsRoutes)
app.use(errorHandler);


// Catch 404 (route not found)
app.use((req, res, next) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
