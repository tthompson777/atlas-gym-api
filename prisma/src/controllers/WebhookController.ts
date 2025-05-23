import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const prisma = new PrismaClient();

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || ''
});
const paymentClient = new Payment(mercadopago);

export class WebhookController {

  async receberNotificacao(req: Request, res: Response) {
    const { type, data } = req.body;

    console.log('🔔 Webhook recebido:', req.body);

    if (type === 'payment') {
      try {
        const pagamento = await paymentClient.get({ id: data.id });
        const status = pagamento.status;
        const transacaoId = parseInt(pagamento.external_reference ?? '0');

        if (status === 'approved') {
          const transacao = await prisma.transacao.findUnique({ where: { id: transacaoId } });

          if (transacao?.alunoId) {
            await prisma.aluno.update({
              where: { id: transacao.alunoId },
              data: { status: 'Ativo' }
            });
          }

          await prisma.transacao.update({
            where: { id: transacaoId },
            data: { statusPagamento: 'Pago' }
          });
        }
      } catch (err) {
        console.error('Erro ao processar pagamento:', err);
      }
    }

    res.sendStatus(200);
  }
}
