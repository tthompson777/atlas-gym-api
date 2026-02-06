import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const login: RequestHandler = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({ erro: 'E-mail e senha obrigatórios.' });
    return;
  }

  // 1. Tenta buscar na tabela de Usuários Comuns (Empresas)
  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (usuario) {
    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
      return;
    }

    const token = jwt.sign(
      {
        userId: usuario.id,
        empresaId: usuario.empresaId,
        role: usuario.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.json({ token, role: usuario.role, empresaId: usuario.empresaId, nome: usuario.nome });
    return;
  }

  // 2. Se não achou usuário, tenta buscar na tabela de Superadmin
  const superadmin = await prisma.superadmin.findUnique({
    where: { email },
  });

  if (superadmin) {
    const senhaValida = await bcrypt.compare(senha, superadmin.senha);
    if (!senhaValida) {
      res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
      return;
    }

    const token = jwt.sign(
      {
        userId: superadmin.id,
        role: 'superadmin',
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.json({ token, role: 'superadmin', nome: 'Super Admin' });
    return;
  }

  // 3. Se não achou em lugar nenhum
  res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
};

export const loginSuperadmin: RequestHandler = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({ erro: 'E-mail e senha obrigatórios.' });
    return;
  }

  const superadmin = await prisma.superadmin.findUnique({
    where: { email },
  });

  if (!superadmin) {
    res.status(401).json({ erro: 'Credenciais inválidas.' });
    return;
  }

  const senhaValida = await bcrypt.compare(senha, superadmin.senha);

  if (!senhaValida) {
    res.status(401).json({ erro: 'Credenciais inválidas.' });
    return;
  }

  const token = jwt.sign(
    {
      userId: superadmin.id,
      role: 'superadmin',
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );

  res.json({ token });
};
