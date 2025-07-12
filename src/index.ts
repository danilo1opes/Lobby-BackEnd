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
app.use(
  cors({
    origin: 'http://localhost:3000', // Permite requisições do front-end local
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
    credentials: true, // Permite cookies ou credenciais, se necessário
  }),
);

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

app.use('/uploads', express.static('uploads'));
