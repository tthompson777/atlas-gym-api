import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const prisma = new PrismaClient();

// Inicializa SDK

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || ''
});
const preferenceClient = new Preference(mercadopago);

export class FinanceiroController {

async gerarPagamento(req: Request, res: Response) {
  const id = Number(req.params.id);
  const transacao = await prisma.transacao.findUnique({ where: { id } });

  if (!transacao) return res.status(404).json({ mensagem: 'Transação não encontrada.' });

  const response = await preferenceClient.create({
    body: {
      items: [
        {
          id: String(transacao.id),
          title: transacao.categoria,
          unit_price: transacao.valor,
          quantity: 1
        }
      ],
      notification_url: process.env.WEBHOOK_URL,
      external_reference: String(transacao.id)
    }
  });

  const paymentLink = response.init_point;

  await prisma.transacao.update({
    where: { id },
    data: {
      paymentLink,
      statusPagamento: 'Pendente'
    }
  });

  res.json({ paymentLink });
}

  // async listar(req: Request, res: Response) {
  //   const transacoes = await prisma.transacao.findMany({
  //     include: { aluno: true },
  //     orderBy: { dataHora: 'desc' }
  //   });
  //   res.json(transacoes);
  // }
  async listar(req: Request, res: Response) {
  if (!req.user || !req.user.empresaId) {
    return res.status(400).json({ mensagem: 'empresaId não encontrado no usuário.' });
  }
  const empresaId = Number(req.user.empresaId);

  const transacoes = await prisma.transacao.findMany({
    where: {
      aluno: { empresaId }
    },
    include: {
      aluno: true
    },
    orderBy: { dataHora: 'desc' }
  });

  res.json(transacoes);
}

  async criar(req: Request, res: Response) {
  let { tipo, categoria, valor, descricao, alunoId, empresaId } = req.body;

  if (!['Entrada', 'Saida'].includes(tipo)) {
    return res.status(400).json({ mensagem: 'Tipo inválido' });
  }

  // Se não vier empresaId no corpo, tenta pegar do usuário logado (token)
  if (!empresaId && req.user?.empresaId) {
    empresaId = req.user.empresaId;
  }

  if (!empresaId) {
    return res.status(400).json({ mensagem: 'empresaId é obrigatório.' });
  }

  // 👇 Converte string para número ou null
  alunoId = alunoId ? Number(alunoId) : null;

  try {
    const transacao = await prisma.transacao.create({
      data: {
        tipo,
        categoria,
        valor,
        descricao,
        alunoId,
        dataHora: new Date(),
        empresaId: Number(empresaId)
      }
    });

    res.status(201).json(transacao);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ mensagem: 'Erro ao criar transação.' });
  }
}

  async obter(req: Request, res: Response) {
    const id = Number(req.params.id);
    const transacao = await prisma.transacao.findUnique({
      where: { id },
      include: { aluno: true }
    });
    res.json(transacao);
  }

  async excluir(req: Request, res: Response) {
    const id = Number(req.params.id);
    await prisma.transacao.delete({ where: { id } });
    res.status(204).send();
  }

  async atualizar(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { tipo, categoria, valor, descricao, alunoId } = req.body;

  if (!['Entrada', 'Saida'].includes(tipo)) {
    return res.status(400).json({ mensagem: 'Tipo inválido' });
  }

  try {
    const transacao = await prisma.transacao.update({
      where: { id },
      data: {
        tipo,
        categoria,
        valor,
        descricao,
        alunoId: alunoId ?? null
      }
    });

    res.json(transacao);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar transação.' });
  }
}
}