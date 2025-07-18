"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/user', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res
                .status(400)
                .json({ error: 'Email, username e password são obrigatórios' });
        }
        if (password.length < 6) {
            return res
                .status(400)
                .json({ error: 'Senha deve ter pelo menos 6 caracteres' });
        }
        const existingUser = await User_1.default.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ error: 'Email ou username já existe' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = new User_1.default({ email, username, password: hashedPassword });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, username }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
        return res.status(201).json({ id: user._id, token });
    }
    catch (error) {
        console.error('Erro no /user:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .json({ error: 'Username e password são obrigatórios' });
        }
        const user = await User_1.default.findOne({ username }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, username }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
        return res.status(200).json({ token });
    }
    catch (error) {
        console.error('Erro no /login:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
router.get('/user', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({ error: 'Usuário não possui permissão' });
        }
        const response = {
            id: user.id,
            username: user.username,
            nome: user.nome,
            email: user.email,
        };
        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.default = router;
