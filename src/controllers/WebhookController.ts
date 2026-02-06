import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const prisma = new PrismaClient();

export class WebhookController {

  async receberNotificacao(req: Request, res: Response) {
    const { type, data } = req.body;
    const empresaId = Number(req.query.empresaId);

    console.log('🔔 Webhook recebido:', req.body);
    console.log('🏢 Empresa ID (query param):', empresaId);

    if (type === 'payment') {
      try {
        let paymentClient;
        
        if (empresaId) {
          // Busca o token da empresa específica
          const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
          if (empresa?.mpAccessToken) {
            const mercadopago = new MercadoPagoConfig({ accessToken: empresa.mpAccessToken });
            paymentClient = new Payment(mercadopago);
          }
        } 
        
        // Fallback: Se não vier empresaId ou não achar empresa, tenta usar token global (retrocompatibilidade)
        if (!paymentClient) {
          console.log('⚠️ Usando token global (fallback) para processar webhook.');
          const mercadopago = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
          paymentClient = new Payment(mercadopago);
        }

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
