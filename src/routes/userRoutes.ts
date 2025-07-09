import { Router } from 'express';
import { getUser, createUser } from '../controllers/userController';

const router = Router();

router.get('/user', getUser);
router.post('/user', createUser);

export default router;
