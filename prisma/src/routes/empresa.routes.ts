import { Router } from 'express';
import { EmpresaController } from '../controllers/empresa.controller';

export const empresaRoutes = Router();
const controller = new EmpresaController();

empresaRoutes.get('/by-uid/:uid', (req, res, next) => {
  controller.buscarEmpresaPorUid(req, res, next).catch(next);
});

empresaRoutes.post('/', (req, res, next) => {
  controller.cadastrarEmpresa(req, res, next).catch(next);
});

empresaRoutes.get('/', (req, res, next) => {
  controller.listarTodas(req, res, next).catch(next);
});
