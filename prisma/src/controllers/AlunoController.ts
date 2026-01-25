import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response } from 'express';
import { emailService } from '../services/EmailService';
import { Preference, MercadoPagoConfig } from 'mercadopago';

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

  if (!empresaId) {
    return res.status(400).json({ mensagem: 'Usuário não autenticado ou sem empresa vinculada.' });
  }

  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId }
    });

    if (!empresa) {
      return res.status(404).json({ mensagem: 'Empresa não encontrada.' });
    }

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
        valor: 1.00, // ajuste conforme valor da matrícula
        descricao: 'Pagamento de matrícula',
        alunoId: aluno.id,
        dataHora: new Date()
      }
    });

    // === GERA O LINK DE PAGAMENTO (Se houver Token configurado) ===
    let paymentLink = null;

    if (empresa.mpAccessToken) {
      const mercadopago = new MercadoPagoConfig({
        accessToken: empresa.mpAccessToken
      });
      const preferenceClient = new Preference(mercadopago);

      const nomeParts = aluno.nome.split(' ');
      const firstName = nomeParts[0];
      const lastName = nomeParts.length > 1 ? nomeParts.slice(1).join(' ') : '';

      // Adiciona o ID da empresa na notification_url para identificar no Webhook
      const webhookUrl = `${process.env.WEBHOOK_URL}?empresaId=${empresaId}`;

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
          payer: {
            name: firstName,
            surname: lastName,
            email: aluno.email || 'email@teste.com'
          },
          notification_url: webhookUrl,
          external_reference: String(transacao.id)
        }
      });

      paymentLink = response.init_point;

      await prisma.transacao.update({
        where: { id: transacao.id },
        data: {
          paymentLink,
          statusPagamento: 'Pendente'
        }
      });
    } else {
      console.log('⚠️ Empresa sem Token do Mercado Pago configurado. Link de pagamento não gerado.');
    }

    // === ENVIA E-MAIL COM O LINK DE PAGAMENTO (DESABILITADO TEMPORARIAMENTE) ===
    /*
    if (aluno.email && paymentLink) {
      await emailService.enviarEmailBoasVindas(aluno.nome, aluno.email, paymentLink);
    } else {
      console.log('⚠️ E-mail ou Link de pagamento ausente, e-mail não enviado.');
    }
    */
    console.log('⚠️ Envio de e-mail desabilitado temporariamente.');

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
