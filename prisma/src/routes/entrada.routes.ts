import { Router } from 'express';
import { EntradaController } from '../controllers/EntradaController';

export const entradaRoutes = Router();
const controller = new EntradaController();

entradaRoutes.post('/', controller.registrar);
entradaRoutes.get('/', controller.listar);