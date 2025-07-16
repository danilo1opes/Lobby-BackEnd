// import express, { Express } from 'express';
// import dotenv from 'dotenv';
// import connectDB from './config/database';
// import cors from 'cors';
// import userRoutes from './routes/userRoutes';
// import photoRoutes from './routes/photoRoutes';
// import commentRoutes from './routes/commentRoutes';
// import statsRoutes from './routes/statsRoutes';
// import passwordRoutes from './routes/passwordRoutes';
// import path from 'path';

// dotenv.config();

// const app: Express = express();

// // Configurar CORS
// const corsOptions = {
//   origin: ['https://nyxlobby.vercel.app', 'http://localhost:3000'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.use(express.json());

// app.get('/', (req, res) => {
//   res.send('Lobby API');
// });

// // Conectar ao MongoDB
// connectDB().catch((err) => console.error('MongoDB connection error:', err));

// // Prefixo para todas as rotas de API
// app.use('/json', userRoutes);
// app.use('/json', photoRoutes);
// app.use('/json', commentRoutes);
// app.use('/json', statsRoutes);
// app.use('/json', passwordRoutes);

// // Rota de status da API
// app.get('/json', (req, res) => {
//   res.json({ message: 'API está rodando' });
// });

// // Middleware para rotas /json não encontradas
// app.use('/json', (req, res) => {
//   res.status(404).json({ error: 'Rota de API não encontrada' }); // Garantir JSON
// });

// // Servir arquivos estáticos (para frontend)
// app.use(express.static(path.join(__dirname, '../../public'))); // Ajuste para o caminho correto

// // Rota coringa SPA (HTML) — chamada só quando não for rota de API
// app.get('*', (req, res) => {
//   console.log('Rota coringa acionada para:', req.url);
//   res.sendFile(path.join(__dirname, '../../public/index.html'), (err) => {
//     if (err) {
//       console.error('Erro ao servir index.html:', err.message);
//       res.status(404).json({ error: 'Página não encontrada' });
//     }
//   });
// });

// // Iniciar servidor
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

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

// Middleware para log de todas as requisições
app.use((req, res, next) => {
  console.log(
    `${req.method} ${req.originalUrl} - Headers:`,
    req.headers.authorization ? 'Token presente' : 'Sem token',
  );
  next();
});

app.get('/', (req, res) => {
  res.send('Lobby API');
});

// Conectar ao MongoDB
connectDB().catch((err) => console.error('MongoDB connection error:', err));

// Log para debug das rotas
console.log('Registrando rotas de API...');

// Prefixo para todas as rotas de API
app.use('/json', userRoutes);
app.use('/json', photoRoutes);
app.use('/json', commentRoutes);
app.use('/json', statsRoutes);
app.use('/json', passwordRoutes);

console.log('Rotas de API registradas');

// Rota de status da API
app.get('/json', (req, res) => {
  res.json({ message: 'API está rodando' });
});

// Middleware para rotas /json não encontradas
app.use('/json/*', (req, res) => {
  console.log('Rota de API não encontrada:', req.originalUrl);
  res.status(404).json({ error: 'Rota de API não encontrada' });
});

// Servir arquivos estáticos (para frontend)
app.use(express.static(path.join(__dirname, '../../public')));

// Rota coringa SPA (HTML) — chamada só quando não for rota de API
app.get('*', (req, res) => {
  // Verificar se é uma rota de API que não foi encontrada
  if (req.originalUrl.startsWith('/json/')) {
    console.log(
      'Rota de API não encontrada sendo interceptada pela rota coringa:',
      req.originalUrl,
    );
    return res.status(404).json({ error: 'Rota de API não encontrada' });
  }

  console.log('Rota coringa acionada para:', req.url);
  const indexPath = path.join(__dirname, '../../public/index.html');
  console.log('Tentando servir index.html em:', indexPath);

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Erro ao servir index.html:', err.message);
      res.status(404).json({ error: 'Página não encontrada' });
    }
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
