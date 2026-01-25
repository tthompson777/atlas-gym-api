import nodemailer from 'nodemailer';

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass',
      },
    });
  }

  async enviarEmailBoasVindas(nome: string, email: string, linkPagamento: string) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Atlas Gym" <nao-responda@atlasgym.com>',
        to: email,
        subject: 'Bem-vindo à Atlas Gym! 🏋️‍♂️',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Olá, ${nome}! 👋</h2>
            <p>Seu cadastro foi realizado com sucesso.</p>
            <p>Para concluir sua matrícula e liberar seu acesso, por favor realize o pagamento através do link abaixo:</p>
            <div style="margin: 20px 0;">
              <a href="${linkPagamento}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Pagar Matrícula</a>
            </div>
            <p>Ou copie e cole o link no seu navegador:</p>
            <p><a href="${linkPagamento}">${linkPagamento}</a></p>
            <br>
            <p>Atenciosamente,<br>Equipe Atlas Gym</p>
          </div>
        `,
      });

      console.log('📧 E-mail enviado: %s', info.messageId);
      // Se for Ethereal, mostra o link de preview no console
      if (process.env.SMTP_HOST?.includes('ethereal')) {
        console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
    }
  }
}

export const emailService = new EmailService();
