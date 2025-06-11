const { body, validationResult } = require('express-validator');

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Dados inválidos',
      details: errors.array(),
    });
  }
  next();
};

// Validações para usuário
const validateUserRegistration = [
  body('username')
    .notEmpty()
    .withMessage('Username é obrigatório')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username deve ter entre 3 e 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username deve conter apenas letras, números e underscore'),

  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),

  handleValidationErrors,
];

// Validações para login
const validateLogin = [
  body('username').notEmpty().withMessage('Username é obrigatório'),

  body('password').notEmpty().withMessage('Senha é obrigatória'),

  handleValidationErrors,
];

// Validações para foto
const validatePhoto = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ max: 100 })
    .withMessage('Nome deve ter no máximo 100 caracteres'),

  body('peso').notEmpty().withMessage('Peso é obrigatório'),

  body('idade').notEmpty().withMessage('Idade é obrigatória'),

  handleValidationErrors,
];

// Validações para comentário
const validateComment = [
  body('comment')
    .notEmpty()
    .withMessage('Comentário é obrigatório')
    .isLength({ max: 500 })
    .withMessage('Comentário deve ter no máximo 500 caracteres'),

  handleValidationErrors,
];

// Validações para recuperação de senha
const validatePasswordLost = [
  body('login').notEmpty().withMessage('Email ou username é obrigatório'),

  body('url').isURL().withMessage('URL inválida'),

  handleValidationErrors,
];

// Validações para reset de senha
const validatePasswordReset = [
  body('login').notEmpty().withMessage('Username é obrigatório'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),

  body('key').notEmpty().withMessage('Token é obrigatório'),

  handleValidationErrors,
];

module.exports = {
  validateUserRegistration,
  validateLogin,
  validatePhoto,
  validateComment,
  validatePasswordLost,
  validatePasswordReset,
  handleValidationErrors,
};
