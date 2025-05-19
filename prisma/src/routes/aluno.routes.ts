import { Router } from 'express';
import { AlunoController } from '../controllers/AlunoController';

export const alunoRoutes = Router();

const controller = new AlunoController();

alunoRoutes.get('/', controller.listar);
alunoRoutes.get('/:id', controller.obter);
alunoRoutes.put('/:id', controller.atualizar);
alunoRoutes.delete('/:id', controller.excluir);
alunoRoutes.patch('/:id/inativar', controller.inativar);
alunoRoutes.post('/', async (req, res, next) => {
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
