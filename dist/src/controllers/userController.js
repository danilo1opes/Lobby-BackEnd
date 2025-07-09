"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const createUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser)
            return res.status(400).json({ error: 'Usuário já existe' });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.default.create({ email, password: hashedPassword });
        return res.status(201).json({ id: user._id, email: user.email });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};
exports.createUser = createUser;
const getUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.id).select('-password');
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        return res.json(user);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
};
exports.getUser = getUser;
