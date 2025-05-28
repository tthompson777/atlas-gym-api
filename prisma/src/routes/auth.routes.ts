// backend/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

export const authRoutes = Router();
const controller = new AuthController();

authRoutes.post('/login', async (req, res, next) => {
  try {
    await controller.login(req, res);
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/registro', async (req, res, next) => {
  try {
    await controller.registrar(req, res);
  } catch (error) {
    next(error);
  }
});
