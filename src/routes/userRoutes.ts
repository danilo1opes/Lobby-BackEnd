import { Router } from 'express';
import { createUser, getUser } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', createUser);
router.get('/', authMiddleware, getUser);

export default router;
