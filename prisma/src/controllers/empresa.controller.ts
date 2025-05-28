import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Extensão da interface Request para incluir o campo 'user'
declare global {
  namespace Express {
    interface Request {
      user?: { empresaId: number; [key: string]: any };
    }
  }
}

export class EmpresaController {
  async buscarEmpresaDoUsuario(req: Request, res: Response, next: NextFunction) {
    if (!req.user || typeof req.user.empresaId !== 'number') {
      return res.status(401).json({ error: 'Usuário não autenticado ou empresaId ausente' });
    }
    const { empresaId } = req.user;

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId }
    });

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    return res.json({
      id: empresa.id,
      nome: empresa.nome,
      email: empresa.email
    });
  }

  async cadastrarEmpresa(req: Request, res: Response, next: NextFunction) {
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, email' });
    }

    const empresaExistente = await prisma.empresa.findFirst({
      where: { email }
    });

    if (empresaExistente) {
      return res.status(409).json({ error: 'Empresa já cadastrada com este e-mail' });
    }

    const novaEmpresa = await prisma.empresa.create({
      data: { nome, email }
    });

    // Criação do usuário administrador com senha padrão
    const senhaHash = await bcrypt.hash('123456', 10); // (ou gere aleatória e envie por e-mail no futuro)

    await prisma.usuario.create({
      data: {
        nome: `Admin da ${nome}`,
        email,
        senhaHash,
        empresaId: novaEmpresa.id
      }
    });

    return res.status(201).json({
      id: novaEmpresa.id,
      nome: novaEmpresa.nome
    });
  }

  async listarTodas(req: Request, res: Response, next: NextFunction) {
    const empresas = await prisma.empresa.findMany({
      orderBy: { criadoEm: 'desc' }
    });

    res.json(empresas);
  }
}
