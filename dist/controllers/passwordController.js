"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const passwordLost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hora
        yield Token_1.default.create({
            token: resetToken,
            user: user._id,
            expiresAt,
        });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const emailSent = yield (0, sendEmail_1.sendEmail)(email, 'Redefinição de Senha - Lobby', `Clique no link para redefinir sua senha: ${resetLink}`);
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
});
exports.passwordLost = passwordLost;
const passwordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password } = req.body;
    try {
        const resetToken = yield Token_1.default.findOne({
            token,
            expiresAt: { $gt: new Date() },
        });
        if (!resetToken)
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        const user = yield User_1.default.findById(resetToken.user);
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        user.password = hashedPassword;
        yield user.save();
        yield Token_1.default.deleteOne({ _id: resetToken._id });
        return res.json({ message: 'Senha redefinida com sucesso' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao redefinir senha' });
    }
});
exports.passwordReset = passwordReset;
