import { Router } from 'express';
import { login, loginSuperadmin } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/superadmin/login', loginSuperadmin);

export default router;
