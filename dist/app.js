"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./src/routes/userRoutes"));
const photoRoutes_1 = __importDefault(require("./src/routes/photoRoutes"));
const commentRoutes_1 = __importDefault(require("./src/routes/commentRoutes"));
const statsRoutes_1 = __importDefault(require("./src/routes/statsRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL }));
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static('uploads'));
app.use('/jwt-auth/v1', authRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
app.use('/api/photo', photoRoutes_1.default);
app.use('/api/comment', commentRoutes_1.default);
app.use('/api/stats', statsRoutes_1.default);
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB conectado'))
    .catch((err) => console.error('Erro MongoDB:', err));
exports.default = app;
