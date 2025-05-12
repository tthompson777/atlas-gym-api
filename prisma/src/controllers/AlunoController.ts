import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export class AlunoController {
  async listar(req: Request, res: Response) {
    const alunos = await prisma.aluno.findMany();
    res.json(alunos);
  }

  async obter(req: Request, res: Response) {
    const id = Number(req.params.id);
    const aluno = await prisma.aluno.findUnique({ where: { id } });
    res.json(aluno);
  }

  async criar(req: Request, res: Response) {
  const data = req.body;
  delete data.id; // Remove o id do corpo da requisição, se existir

  const aluno = await prisma.aluno.create({
    data: {
      ...data,
      nascimento: new Date(data.nascimento),
    },
  });

  res.status(201).json(aluno);
}

  async atualizar(req: Request, res: Response) {
    const id = Number(req.params.id);
    const aluno = await prisma.aluno.update({
      where: { id },
      data: req.body
    });
    res.json(aluno);
  }

  async excluir(req: Request, res: Response) {
    const id = Number(req.params.id);
    await prisma.aluno.delete({ where: { id } });
    res.status(204).send();
  }

  async inativar(req: Request, res: Response) {
    const id = Number(req.params.id);
    const aluno = await prisma.aluno.update({
      where: { id },
      data: { status: 'inativo' }
    });
    res.json(aluno);
  }
}
