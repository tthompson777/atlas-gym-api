import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaCorreta) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = jwt.sign(
      {
        userId: usuario.id,
        empresaId: usuario.empresaId,
        role: usuario.role
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({ token });
  }

  async registrar(req: Request, res: Response) {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const empresa = await prisma.empresa.create({
      data: {
        nome,
        email,
      }
    });

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        role: 'admin',
        empresaId: empresa.id
      }
    });

    const token = jwt.sign({
      userId: usuario.id,
      empresaId: empresa.id,
      role: usuario.role
    }, JWT_SECRET, { expiresIn: '8h' });

    return res.status(201).json({ token });
  }
}
