import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export class RegistroAcessoController {
  async registrarOuAtualizar(req: Request, res: Response, next: unknown) {
    const { alunoId } = req.body;

    const agora = new Date();
    const inicioDoDia = new Date(agora);
    inicioDoDia.setHours(0, 0, 0, 0);

    const ultimoRegistro = await prisma.registroAcesso.findFirst({
      where: {
        alunoId,
        dataEntrada: { gte: inicioDoDia },
        dataSaida: null,
      },
      orderBy: { dataEntrada: 'desc' },
    });

    if (ultimoRegistro) {
      // Atualiza com saída
      const atualizado = await prisma.registroAcesso.update({
        where: { id: ultimoRegistro.id },
        data: { dataSaida: agora }
      });
      return res.json({ tipo: 'saida', registro: atualizado });
    } else {
      // Cria novo com entrada
      const novo = await prisma.registroAcesso.create({
        data: { alunoId, dataEntrada: agora }
      });
      return res.status(201).json({ tipo: 'entrada', registro: novo });
    }
  }

  async listar(req: Request, res: Response) {
    const registros = await prisma.registroAcesso.findMany({
      include: { aluno: true },
      orderBy: { dataEntrada: 'desc' }
    });
    res.json(registros);
  }

  async verificarUltimoAcesso(req: Request, res: Response, next: unknown) {
  const { alunoId } = req.params;

  const agora = new Date();
  const inicioDoDia = new Date(agora);
  inicioDoDia.setHours(0, 0, 0, 0);

  const ultimoRegistro = await prisma.registroAcesso.findFirst({
    where: {
      alunoId: Number(alunoId),
      dataEntrada: { gte: inicioDoDia }
    },
    orderBy: { dataEntrada: 'desc' }
  });

  if (!ultimoRegistro) {
    return res.json({ permitido: true });
  }

  const diffMs = agora.getTime() - new Date(ultimoRegistro.dataEntrada).getTime();
  const diffSegundos = diffMs / 1000;

  if (diffSegundos < 5) {
    return res.json({ permitido: false, segundosRestantes: Math.ceil(5 - diffSegundos) });
  }

  return res.json({ permitido: true });
}

async listarPorAluno(req: Request, res: Response) {
  const alunoId = Number(req.params.alunoId);

  if (isNaN(alunoId)) {
    return res.status(400).json({ mensagem: 'ID de aluno inválido.' });
  }

  const registros = await prisma.registroAcesso.findMany({
    where: { alunoId },
    orderBy: { dataEntrada: 'desc' }
  });

  res.json(registros);
}

}
