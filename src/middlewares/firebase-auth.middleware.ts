import { Request, Response, NextFunction } from 'express';
import { admin } from '../firebase';

export async function verificarTokenFirebase(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ erro: 'Token não fornecido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    // opcional: req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ erro: 'Token inválido ou expirado.' });
    return;
  }
}
