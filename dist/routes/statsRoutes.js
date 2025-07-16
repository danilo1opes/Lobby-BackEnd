"use strict";
// import { Router, Request, Response } from 'express';
// import Photo from '../models/Photo';
// import { authMiddleware } from '../middleware/auth';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const router = Router();
// router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const user = (req as any).user;
//     if (!user || !user.id) {
//       return res.status(401).json({ error: 'Usuário não possui permissão' });
//     }
//     console.log('Usuário autenticado:', user.id); // Log para depuração
//     const photos = await Photo.find({ author: user.id });
//     const stats = photos.map((photo) => ({
//       id: photo._id,
//       title: photo.title,
//       acessos: photo.acessos,
//     }));
//     return res.status(200).json(stats);
//   } catch (error) {
//     console.error('Erro em /stats:', error);
//     return res.status(500).json({ error: 'Erro interno no servidor' });
//   }
// });
// export default router;
const express_1 = require("express");
const Photo_1 = __importDefault(require("../models/Photo"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Adicionar log para debug
console.log('Stats routes carregadas');
// Rota de teste simples
router.get('/stats-test', (req, res) => {
    console.log('Rota de teste chamada');
    res.json({ message: 'Rota funcionando' });
});
router.get('/stats', auth_1.authMiddleware, async (req, res) => {
    console.log('=== ROTA /stats CHAMADA ==='); // Debug log mais visível
    try {
        const user = req.user;
        if (!user || !user.id) {
            console.log('Usuário não autenticado'); // Debug log
            return res.status(401).json({ error: 'Usuário não possui permissão' });
        }
        console.log('Usuário autenticado:', user.id);
        const photos = await Photo_1.default.find({ author: user.id }).sort({
            createdAt: -1,
        });
        console.log('Fotos encontradas:', photos.length); // Debug log
        // Calcular estatísticas mais detalhadas
        const totalAcessos = photos.reduce((sum, photo) => sum + photo.acessos, 0);
        const totalFotos = photos.length;
        const mediaAcessos = totalFotos > 0 ? Math.round(totalAcessos / totalFotos) : 0;
        // Foto mais acessada
        const fotoMaisAcessada = photos.reduce((max, photo) => (photo.acessos > max.acessos ? photo : max), photos[0] || { acessos: 0, title: 'Nenhuma' });
        // Acessos por período (últimos 7 dias simulado - você pode ajustar conforme sua necessidade)
        const hoje = new Date();
        const acessosPorDia = Array.from({ length: 7 }, (_, i) => {
            const data = new Date(hoje);
            data.setDate(data.getDate() - i);
            return {
                date: data.toLocaleDateString('pt-BR'),
                acessos: Math.floor(Math.random() * 50), // Dados simulados - substitua pela lógica real
            };
        }).reverse();
        const stats = {
            // Dados das fotos individuais (mantém compatibilidade)
            photos: photos.map((photo) => ({
                id: photo._id,
                title: photo.title,
                acessos: photo.acessos,
                createdAt: photo.createdAt,
            })),
            // Estatísticas gerais
            summary: {
                totalAcessos,
                totalFotos,
                mediaAcessos,
                fotoMaisAcessada: {
                    title: fotoMaisAcessada.title,
                    acessos: fotoMaisAcessada.acessos,
                },
            },
            // Dados para gráficos
            charts: {
                acessosPorFoto: photos.slice(0, 10).map((photo) => ({
                    label: photo.title.length > 15
                        ? photo.title.substring(0, 15) + '...'
                        : photo.title,
                    value: photo.acessos,
                })),
                acessosPorDia,
                distribuicaoAcessos: [
                    {
                        label: 'Baixo (0-10)',
                        value: photos.filter((p) => p.acessos <= 10).length,
                    },
                    {
                        label: 'Médio (11-50)',
                        value: photos.filter((p) => p.acessos > 10 && p.acessos <= 50)
                            .length,
                    },
                    {
                        label: 'Alto (51-100)',
                        value: photos.filter((p) => p.acessos > 50 && p.acessos <= 100)
                            .length,
                    },
                    {
                        label: 'Muito Alto (100+)',
                        value: photos.filter((p) => p.acessos > 100).length,
                    },
                ].filter((item) => item.value > 0),
            },
        };
        console.log('=== RETORNANDO STATS ==='); // Debug log
        return res.status(200).json(stats);
    }
    catch (error) {
        console.error('Erro em /stats:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.default = router;
