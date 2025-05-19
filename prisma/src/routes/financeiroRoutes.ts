import { Router } from 'express';
import { FinanceiroController } from '../controllers/FinanceiroController';

export const financeiroRoutes = Router();
const controller = new FinanceiroController();

financeiroRoutes.get('/', controller.listar);
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