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

// Log middleware para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Rota raiz
app.get('/', (req, res) => {
  res.send('Lobby API');
});

// ROTAS DA API - DEVEM VIR PRIMEIRO
app.use('/json/users', userRoutes);
app.use('/json/photos', photoRoutes);
app.use('/json/comments', commentRoutes);
app.use('/json/stats', statsRoutes);
app.use('/json/password', passwordRoutes);

// Rota de teste para verificar se a API está funcionando
app.get('/json', (req, res) => {
  res.json({ message: 'API está rodando' });
});

// Rota específica para testar stats
app.get('/json/test-stats', (req, res) => {
  res.json({ test: 'Stats route is working' });
});

// Middleware para capturar rotas /json não encontradas
app.use('/json/*', (req, res) => {
  console.log('Rota JSON não encontrada:', req.path);
  res.status(404).json({ error: 'Rota de API não encontrada' });
});

// Servir arquivos estáticos APENAS se não for rota de API
app.use((req, res, next) => {
  if (req.path.startsWith('/json')) {
    return next();
  }
  express.static(path.join(__dirname, '../public'))(req, res, next);
});

// Rota coringa para SPA - APENAS para rotas que não são /json
app.get('*', (req, res) => {
  // Se for uma rota de API, retorna erro
  if (req.path.startsWith('/json')) {
    return res.status(404).json({ error: 'Rota de API não encontrada' });
  }

  // Se não for API, serve o HTML
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
