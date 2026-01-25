import { Router } from 'express';
import { RegistroAcessoController  } from '../controllers/RegistroAcessoController';

export const entradaRoutes = Router();
const controller = new RegistroAcessoController();
export const registroAcessoRoutes = Router();

registroAcessoRoutes.post('/', (req, res, next) => {
	controller.registrarOuAtualizar(req, res, next).catch(next);
});

registroAcessoRoutes.get('/', controller.listar);

registroAcessoRoutes.get('/verificar-ultimo/:alunoId', (req, res, next) => {
  controller.verificarUltimoAcesso(req, res, next).catch(next);
});

registroAcessoRoutes.get('/aluno/:alunoId', async (req, res, next) => {
  try {
    await controller.listarPorAluno(req, res);
  } catch (error) {
    next(error);
  }
});