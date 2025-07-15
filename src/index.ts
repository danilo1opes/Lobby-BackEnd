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

// Conectar ao MongoDB
connectDB().catch((err) => console.error('MongoDB connection error:', err));

// IMPORTANTE: Rotas da API DEVEM vir ANTES da rota coringa
app.get('/', (req, res) => {
  res.send('Lobby API');
});

// Rota de status da API
app.get('/json', (req, res) => {
  res.json({ message: 'API está rodando' });
});

// Todas as rotas da API com prefixo /json
app.use('/json', userRoutes);
app.use('/json', photoRoutes);
app.use('/json', commentRoutes);
app.use('/json', statsRoutes);
app.use('/json', passwordRoutes);

// Middleware para rotas /json não encontradas (404 para API)
app.use('/json/*', (req, res) => {
  res.status(404).json({ error: 'Rota de API não encontrada' });
});

// Servir arquivos estáticos (para frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Rota coringa SPA (HTML) — DEVE vir por ÚLTIMO
// Só será chamada para rotas que não sejam /json
app.get('*', (req, res) => {
  // Se for uma rota que começa com /json, não deveria chegar aqui
  if (req.path.startsWith('/json')) {
    return res.status(404).json({ error: 'Rota de API não encontrada' });
  }
  
  res.sendFile(path.join(__dirname, '../public/index.html'), (err) => {
    if (err) {
      console.error('Erro ao servir index.html:', err.message);
      res.status(404).send('Página não encontrada');
    }
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});