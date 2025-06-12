const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Configurar trust proxy para suportar X-Forwarded-For
app.set('trust proxy', true);

// Middleware de segurança
app.use(helmet());

// CORS configurado
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

// Conectar ao MongoDB
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'Não definido');
if (!process.env.MONGODB_URI) {
  console.error(
    'Erro: MONGODB_URI não está definido. Verifique as variáveis de ambiente.'
  );
  process.exit(1);
}
mongoose
  .connect(process.env.MONGODB_URI, { family: 4 })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

// Rotas
app.use('/json/jwt-auth/v1', require('./routes/auth'));
app.use('/json/api', require('./routes/user'));
app.use('/json/api', require('./routes/photo'));
app.use('/json/api', require('./routes/comment'));
app.use('/json/api', require('./routes/stats'));

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'Dogs API funcionando!',
    version: '1.0.0',
    endpoints: [
      'POST /json/jwt-auth/v1/token - Login',
      'GET /json/api/user - Obter usuário',
      'POST /json/api/user - Criar usuário',
      'GET /json/api/photo - Listar fotos',
      'POST /json/api/photo - Criar foto',
      'GET /json/api/photo/:id - Obter foto',
      'DELETE /json/api/photo/:id - Deletar foto',
      'GET /json/api/comment/:id - Obter comentários',
      'POST /json/api/comment/:id - Criar comentário',
      'GET /json/api/stats - Obter estatísticas',
      'POST /json/api/password/lost - Recuperar senha',
      'POST /json/api/password/reset - Resetar senha',
    ],
  });
});

// Middleware de erro
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message:
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Algo deu errado',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
