import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UsuarioController {
  async listarUsuarios(req: Request, res: Response, next: NextFunction) {
    if (!req.user || req.user.role !== 0) {
      res.status(403).json({ error: 'Acesso negado.' });
      return;
    }

    const { empresaId } = req.user;

    try {
      const usuarios = await prisma.usuario.findMany({
        where: { empresaId },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          criadoEm: true
        },
        orderBy: { nome: 'asc' }
      });

      res.json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar usuários.' });
    }
  }

  async criarUsuario(req: Request, res: Response, next: NextFunction) {
    // Check if user is authenticated and has role 0 (Admin)
    if (!req.user || req.user.role !== 0) {
      res.status(403).json({ error: 'Apenas administradores podem criar novos usuários.' });
      return;
    }

    const { nome, email, senha, role } = req.body;
    const { empresaId } = req.user;

    // Validation
    if (!nome || !email || !senha || role === undefined) {
      res.status(400).json({ error: 'Campos obrigatórios: nome, email, senha, role.' });
      return;
    }

    // Role validation
    if (![0, 1, 2].includes(role)) {
      res.status(400).json({ error: 'Role inválida. Use: 0 (Admin), 1 (Recepção), 2 (Professor).' });
      return;
    }

    // Check if email already exists
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      res.status(409).json({ error: 'E-mail já cadastrado.' });
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    try {
      const novoUsuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senhaHash,
          role,
          empresaId,
        },
      });

      // Remove password hash from response
      const { senhaHash: _, ...usuarioSemSenha } = novoUsuario;

      res.status(201).json(usuarioSemSenha);
      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar usuário.' });
      return;
    }
  }
}
