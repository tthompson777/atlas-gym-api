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

  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!usuario) {
    res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
    return;
  }

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

  res.json({ token });
};
