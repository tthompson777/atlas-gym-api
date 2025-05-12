import { Router } from 'express';
import { AlunoController } from '../controllers/AlunoController';

export const alunoRoutes = Router();

const controller = new AlunoController();

alunoRoutes.get('/', controller.listar);
alunoRoutes.get('/:id', controller.obter);
alunoRoutes.post('/', controller.criar);
alunoRoutes.put('/:id', controller.atualizar);
alunoRoutes.delete('/:id', controller.excluir);
alunoRoutes.patch('/:id/inativar', controller.inativar);
