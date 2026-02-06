import { Router } from 'express';
import { FichaController } from '../controllers/FichaController';
import { authMiddleware } from '../middlewares/auth.middleware';

export const fichaRoutes = Router();
const controller = new FichaController();

fichaRoutes.use(authMiddleware);

fichaRoutes.get('/por-aluno/:alunoId', async (req, res, next) => {
  try {
    await controller.buscarPorAluno(req, res);
  } catch (error) {
    next(error);
  }
});

fichaRoutes.get('/', async (req, res, next) => {
    try {
        await controller.listar(req, res);
    } catch (error) {
        next(error);
    }
});
fichaRoutes.get('/:id', async (req, res, next) => {
    try {
        await controller.obter(req, res);
    } catch (error) {
        next(error);
    }
});
fichaRoutes.post('/', async (req, res, next) => {
    try {
        await controller.criar(req, res);
    } catch (error) {
        next(error);
    }
});
fichaRoutes.put('/:id', controller.atualizar);
fichaRoutes.delete('/:id', controller.excluir);
