import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const usuarioController = new UsuarioController();

router.get('/', authMiddleware, usuarioController.listarUsuarios);
router.post('/', authMiddleware, usuarioController.criarUsuario);

export { router as usuarioRoutes };
