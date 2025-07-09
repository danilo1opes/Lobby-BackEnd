import { Router } from 'express';
import { login, validateToken } from '../controllers/authController';
import { passwordLost, passwordReset } from '../controllers/passwordController';

const router = Router();

router.post('/token', login);
router.post('/token/validate', validateToken);
router.post('/password/lost', passwordLost);
router.post('/password/reset', passwordReset);

export default router;
