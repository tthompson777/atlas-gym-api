import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response } from 'express';

import axios from 'axios';
import { Preference, MercadoPagoConfig } from 'mercadopago';

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || ''
});
const preferenceClient = new Preference(mercadopago);

const prisma = new PrismaClient();

export class AlunoController {
  // async listar(req: Request, res: Response) {
  //   const alunos = await prisma.aluno.findMany();
  //   res.json(alunos);
  // }

async listar(req: Request, res: Response) {
  const empresaId = (req.user as { empresaId: number })?.empresaId;

  if (!empresaId) {
    return res.status(400).json({ mensagem: 'empresaId não fornecido no usuário.' });
  }

  const alunos = await prisma.aluno.findMany({
    where: { empresaId },
    orderBy: { nome: 'asc' }
  });

  res.json(alunos);
}

  async obter(req: Request, res: Response) {
    const id = Number(req.params.id);
    const aluno = await prisma.aluno.findUnique({ where: { id } });
    res.json(aluno);
  }

  async criar(req: Request, res: Response) {
  const data = req.body;
  delete data.id;
  const { empresaId } = req.user ?? {};

  try {
    const aluno = await prisma.aluno.create({
      data: {
        ...data,
        nascimento: new Date(data.nascimento),
        fotoBase64: req.body.fotoBase64,
        descriptor: data.descriptor ?? undefined,
        empresa: { connect: { id: empresaId } }
      },
    });

    // === CRIA A TRANSAÇÃO ===
    const transacao = await prisma.transacao.create({
      data: {
        tipo: 'Entrada',
        categoria: 'Matrícula',
        valor: 100.00, // ajuste conforme valor da matrícula
        descricao: 'Pagamento de matrícula',
        alunoId: aluno.id,
        dataHora: new Date()
      }
    });

    // === GERA O LINK DE PAGAMENTO ===
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
      where: { id: transacao.id },
      data: {
        paymentLink,
        statusPagamento: 'Pendente'
      }
    });

    // === ENVIA MENSAGEM PELO WHATSAPP ===
    try {
      await axios.post('http://localhost:3333/enviar-mensagem', {
        telefone: aluno.telefone,
        nome: aluno.nome,
        linkPagamento: paymentLink
      });
    } catch (erro) {
      if (erro instanceof Error) {
        console.error('Erro ao enviar WhatsApp:', erro.message);
      } else {
        console.error('Erro ao enviar WhatsApp:', erro);
      }
    }

    res.status(201).json(aluno);

  } catch (error) {
    console.error(error);

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const mensagemErro = error.message.toLowerCase();

      let campo = 'campo único';
      if (mensagemErro.includes('cpf')) campo = 'CPF';
      else if (mensagemErro.includes('email')) campo = 'e-mail';

      return res.status(409).json({
        mensagem: `Já existe um aluno com o mesmo ${campo}.`,
      });
    }

    return res.status(500).json({
      mensagem: 'Erro interno ao criar aluno.',
    });
  }
}


  async atualizar(req: Request, res: Response) {
    const id = Number(req.params.id);
    const aluno = await prisma.aluno.update({
      where: { id },
      data: {
        ...req.body,
        fotoBase64: req.body.fotoBase64,
        nascimento: new Date(req.body.nascimento),
        descriptor: req.body.descriptor ?? undefined
      }
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
      data: { status: 'Inativo' }
    });
    res.json(aluno);
  }

  async autenticarPorSenha(req: Request, res: Response) {
    const { senha } = req.body;

    if (!senha) {
      return res.status(400).json({ mensagem: 'Senha não fornecida' });
    }

    const aluno = await prisma.aluno.findFirst({
      where: { senha }
    });

    if (!aluno) {
      return res.status(404).json({ mensagem: 'Senha incorreta' });
    }

    res.json(aluno);
  }
}
