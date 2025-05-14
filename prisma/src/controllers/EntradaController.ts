import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export class EntradaController {
  async registrar(req: Request, res: Response) {
    const { alunoId } = req.body;

    const entrada = await prisma.entrada.create({
      data: {
        alunoId,
        dataHora: new Date(),
      },
    });

    res.status(201).json(entrada);
  }

  async listar(req: Request, res: Response) {
    const entradas = await prisma.entrada.findMany({
      include: { aluno: true },
      orderBy: { dataHora: 'desc' },
    });

    res.json(entradas);
  }
}
