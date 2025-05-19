import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
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
    delete data.id;

    try {
      const aluno = await prisma.aluno.create({
        data: {
          ...data,
          nascimento: new Date(data.nascimento),
          fotoBase64: req.body.fotoBase64,
          descriptor: data.descriptor ?? undefined
        },
      });

      res.status(201).json(aluno);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const mensagemErro = error.message.toLowerCase();

        let campo = 'campo único';

        if (mensagemErro.includes('cpf')) {
          campo = 'CPF';
        } else if (mensagemErro.includes('email')) {
          campo = 'e-mail';
        }

        return res.status(409).json({
          mensagem: `Já existe um aluno com o mesmo ${campo}.`,
        });
      }

      console.error(error);
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
