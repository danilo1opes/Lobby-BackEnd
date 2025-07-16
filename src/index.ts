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

// Rota raiz - informações sobre a API
app.get('/', (req, res) => {
  res.json({ 
    message: 'Lobby API', 
    version: '1.0.0',
    endpoints: [
      'POST /json/user - Criar usuário',
      'POST /json/token - Login',
      'GET /json/user - Dados do usuário',
      'GET /json/photo - Listar fotos',
      'POST /json/photo - Criar foto',
      'GET /json/stats - Estatísticas',
      'POST /json/password/lost - Recuperar senha',
      'POST /json/password/reset - Redefinir senha'
    ]
  });
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
  res.json({ message: 'API está rodando', status: 'ok' });
});

// Middleware para rotas /json não encontradas
app.use('/json/*', (req, res) => {
  console.log('Rota de API não encontrada:', req.originalUrl);
  res.status(404).json({ error: 'Rota de API não encontrada' });
});

// Middleware para qualquer outra rota
app.use('*', (req, res) => {
  console.log('Rota não encontrada:', req.originalUrl);
  res.status(404).json({ 
    error: 'Rota não encontrada',
    message: 'Esta é uma API REST. Use /json/* para acessar os endpoints da API.',
    availableEndpoints: '/json'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;