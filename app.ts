import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './src/routes/authRoutes';
import userRoutes from './src/routes/userRoutes';
import photoRoutes from './src/routes/photoRoutes';
import commentRoutes from './src/routes/commentRoutes';
import statsRoutes from './src/routes/statsRoutes';

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/jwt-auth/v1', authRoutes);
app.use('/api', userRoutes); // Ajustado para /api
app.use('/api', photoRoutes);
app.use('/api', commentRoutes);
app.use('/api', statsRoutes);

app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB conectado'))
  .catch((err) => console.error('Erro MongoDB:', err));

export default app;
