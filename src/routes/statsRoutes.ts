import { Router } from 'express';
import { getStats } from '../controllers/statsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getStats);

export default router;
