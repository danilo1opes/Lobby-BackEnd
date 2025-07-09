"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordReset = exports.passwordLost = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const Token_1 = __importDefault(require("../models/Token"));
const sendEmail_1 = require("../utils/sendEmail");
const passwordLost = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hora
        await Token_1.default.create({
            token: resetToken,
            user: user._id,
            expiresAt,
        });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const emailSent = await (0, sendEmail_1.sendEmail)(email, 'Redefinição de Senha - Lobby', `Clique no link para redefinir sua senha: ${resetLink}`);
        if (!emailSent) {
            return res
                .status(500)
                .json({ error: 'Erro ao enviar e-mail de recuperação' });
        }
        return res.json({ message: 'E-mail de recuperação enviado' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
};
exports.passwordLost = passwordLost;
const passwordReset = async (req, res) => {
    const { token, password } = req.body;
    try {
        const resetToken = await Token_1.default.findOne({
            token,
            expiresAt: { $gt: new Date() },
        });
        if (!resetToken)
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        const user = await User_1.default.findById(resetToken.user);
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        await Token_1.default.deleteOne({ _id: resetToken._id });
        return res.json({ message: 'Senha redefinida com sucesso' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao redefinir senha' });
    }
};
exports.passwordReset = passwordReset;
