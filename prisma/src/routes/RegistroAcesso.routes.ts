import { Router } from 'express';
import { RegistroAcessoController  } from '../controllers/RegistroAcessoController';

export const entradaRoutes = Router();
const controller = new RegistroAcessoController();
export const registroAcessoRoutes = Router();

registroAcessoRoutes.post('/', (req, res, next) => {
	controller.registrarOuAtualizar(req, res, next).catch(next);
});
registroAcessoRoutes.get('/', controller.listar);