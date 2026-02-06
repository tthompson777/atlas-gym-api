import { Router } from 'express';
import { FinanceiroController } from '../controllers/FinanceiroController';
import { authMiddleware } from '../middlewares/auth.middleware';

export const financeiroRoutes = Router();
const controller = new FinanceiroController();

financeiroRoutes.use(authMiddleware);

financeiroRoutes.get('/', async (req, res, next) => {
    try {
        await controller.listar(req, res);
    } catch (error) {
        next(error);
    }
});
financeiroRoutes.post('/', async (req, res, next) => {
    try {
        await controller.criar(req, res);
    } catch (error) {
        next(error);
    }
});
financeiroRoutes.put('/:id', async (req, res, next) => {
    try {
        await controller.atualizar(req, res);
    } catch (error) {
        next(error);
    }
});
financeiroRoutes.get('/:id', controller.obter);
financeiroRoutes.delete('/:id', controller.excluir);
financeiroRoutes.post('/:id/gerar-pagamento', async (req, res, next) => {
    try {
        await controller.gerarPagamento(req, res);
    } catch (error) {
        next(error);
    }
});