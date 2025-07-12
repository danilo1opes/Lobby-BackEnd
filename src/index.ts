import express, { Express } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import photoRoutes from './routes/photoRoutes';
import commentRoutes from './routes/commentRoutes';
import statsRoutes from './routes/statsRoutes';
import passwordRoutes from './routes/passwordRoutes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Configurar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Permite localhost:3000
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
app.get('/', (req, res) => {
  res.send('Lobby Api');
});

connectDB().catch((err) => console.error('MongoDB connection error:', err));

app.use('/json', userRoutes);
app.use('/json', photoRoutes);
app.use('/json', commentRoutes);
app.use('/json', statsRoutes);
app.use('/json', passwordRoutes);

app.get('/json', (req, res) => {
  res.json({ message: 'API está rodando' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor rodando na porta ' + (process.env.PORT || 3000));
});

app.use('/uploads', express.static('uploads'));
