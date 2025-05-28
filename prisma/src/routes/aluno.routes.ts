import { Router } from 'express';
import { AlunoController } from '../controllers/AlunoController';
import { authMiddleware } from '../middlewares/auth.middleware';

export const alunoRoutes = Router();

const controller = new AlunoController();

alunoRoutes.get('/', authMiddleware, async (req, res, next) => {
  try {
    await controller.listar(req, res);
  } catch (error) {
    next(error);
  }
});
alunoRoutes.get('/:id', controller.obter);
alunoRoutes.put('/:id', controller.atualizar);
alunoRoutes.delete('/:id', controller.excluir);
alunoRoutes.patch('/:id/inativar', controller.inativar);
alunoRoutes.post('/', authMiddleware, async (req, res, next) => {
  try {
    await controller.criar(req, res);
  } catch (error) {
    next(error);
  }
});
alunoRoutes.post('/autenticar-senha', async (req, res, next) => {
	try {
		await controller.autenticarPorSenha(req, res);
	} catch (error) {
		next(error);
	}
});
