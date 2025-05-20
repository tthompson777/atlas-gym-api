import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FichaController {
  async listar(req: Request, res: Response) {
    const fichas = await prisma.fichaExercicio.findMany({
      include: {
        aluno: true,
        exercicios: true
      }
    });
    res.json(fichas);
  }

  async obter(req: Request, res: Response) {
    const id = Number(req.params.id);
    const ficha = await prisma.fichaExercicio.findUnique({
      where: { id },
      include: { aluno: true, exercicios: true }
    });
    if (!ficha) return res.status(404).json({ erro: 'Ficha não encontrada' });
    res.json(ficha);
  }

  async criar(req: Request, res: Response) {
    const { alunoId, exercicios } = req.body;

    const fichaExistente = await prisma.fichaExercicio.findFirst({
      where: { alunoId: req.body.alunoId }
    });

    if (fichaExistente) {
      return res.status(400).json({ erro: 'Este aluno já possui uma ficha cadastrada.' });
    }

    const ficha = await prisma.fichaExercicio.create({
      data: {
        alunoId,
        exercicios: {
          create: exercicios
        }
      },
      include: { exercicios: true }
    });
    res.status(201).json(ficha);
  }

  async atualizar(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { exercicios } = req.body;

    // Deleta exercícios anteriores
    await prisma.exercicio.deleteMany({ where: { fichaId: id } });

    // Atualiza ficha com novos exercícios
    const ficha = await prisma.fichaExercicio.update({
      where: { id },
      data: {
        exercicios: {
          create: exercicios
        }
      },
      include: { exercicios: true }
    });

    res.json(ficha);
  }

  async excluir(req: Request, res: Response) {
    const id = Number(req.params.id);
    await prisma.exercicio.deleteMany({ where: { fichaId: id } });
    await prisma.fichaExercicio.delete({ where: { id } });
    res.status(204).send();
  }

  async buscarPorAluno(req: Request, res: Response) {
    const alunoId = Number(req.params.alunoId);

    const ficha = await prisma.fichaExercicio.findFirst({
      where: { alunoId },
      select: { id: true }
    });

    if (ficha) {
      return res.json(ficha); // { id: 12 }
    } else {
      return res.status(404).json({ mensagem: 'Nenhuma ficha encontrada para este aluno.' });
    }
  }
};
