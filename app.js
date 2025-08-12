import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import database from "./src/config/database.js"
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

dotenv.config();
database();


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


export default app;


