import { Router } from 'express';
import { createComment } from '../controllers/commentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/:id', authMiddleware, createComment);

export default router;
