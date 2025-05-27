import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class EmpresaController {
  async buscarEmpresaPorUid(req: Request, res: Response, next: NextFunction) {
    const uid = req.params.uid;

    const empresa = await prisma.empresa.findUnique({
      where: { uid }
    });

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    return res.json({
      id: empresa.id,
      nome: empresa.nome
    });
  }

  async cadastrarEmpresa(req: Request, res: Response, next: NextFunction) {
    const { nome, email, uid } = req.body;

    console.log('Recebido para cadastro:', req.body);

    if (!nome || !email || !uid) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, email, uid' });
    }

    const empresaExistente = await prisma.empresa.findUnique({
      where: { uid }
    });

    if (empresaExistente) {
      return res.status(409).json({ error: 'Empresa já cadastrada com este UID' });
    }

    const novaEmpresa = await prisma.empresa.create({
      data: { nome, email, uid }
    });

    return res.status(201).json({
      id: novaEmpresa.id,
      nome: novaEmpresa.nome
    });
  }

  async listarTodas(req: Request, res: Response, next: unknown) {
  const empresas = await prisma.empresa.findMany({
    orderBy: { criadoEm: 'desc' }
    });
    res.json(empresas);
    }
}
