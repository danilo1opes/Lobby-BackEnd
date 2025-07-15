import express, { Express } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import photoRoutes from './routes/photoRoutes';
import commentRoutes from './routes/commentRoutes';
import statsRoutes from './routes/statsRoutes';
import passwordRoutes from './routes/passwordRoutes';
import path from 'path';

dotenv.config();

const app: Express = express();

// Configurar CORS
const corsOptions = {
  origin: ['https://nyxlobby.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Servir arquivos estáticos
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));
console.log('Uploads path:', uploadsPath);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
