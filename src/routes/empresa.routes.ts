import { Router } from 'express';
import { EmpresaController } from '../controllers/empresa.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const empresaRoutes = Router();
const controller = new EmpresaController();

empresaRoutes.get('/by-uid/:uid', (req, res, next) => {
  controller.buscarEmpresaDoUsuario(req, res, next).catch(next);
});

empresaRoutes.post('/', (req, res, next) => {
  controller.cadastrarEmpresa(req, res, next).catch(next);
});

empresaRoutes.get('/', (req, res, next) => {
  controller.listarTodas(req, res, next).catch(next);
});

empresaRoutes.get('/minha', authMiddleware, (req, res, next) => {
  controller.buscarEmpresaDoUsuario(req, res, next).catch(next);
});

empresaRoutes.get('/:id', (req, res, next) => {
  controller.buscarPorId(req, res, next).catch(next);
});

empresaRoutes.put('/:id', (req, res, next) => {
  controller.atualizarEmpresa(req, res, next).catch(next);
});
