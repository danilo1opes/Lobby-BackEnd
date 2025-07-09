"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user || !await bcryptjs_1.default.compare(password, user.password)) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro no servidor' });
    }
};
exports.login = login;
const validateToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token)
            return res.status(401).json({ error: 'Token não fornecido' });
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return res.json({ valid: true });
    }
    catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};
exports.validateToken = validateToken;
