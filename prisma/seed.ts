import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpa dados existentes para evitar conflitos de unique key em testes manuais repetidos
  // Ordem importa por causa das FKs
  await prisma.transacao.deleteMany({});
  await prisma.fichaExercicio.deleteMany({});
  await prisma.registroAcesso.deleteMany({});
  await prisma.aluno.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.empresa.deleteMany({});

  const senhaHash = await bcrypt.hash('123456', 10);

  const empresa = await prisma.empresa.create({
    data: {
      nome: 'Academia Teste',
      email: 'academia@teste.com',
    },
  });

  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Admin',
      email: 'admin@admin.com',
      senhaHash,
      role: 'admin',
      empresaId: empresa.id,
    },
  });

  console.log('✅ Seed executado com sucesso!');
  console.log(`🏢 Empresa criada: ${empresa.nome} (ID: ${empresa.id})`);
  console.log(`👤 Usuário criado: ${usuario.email} (Senha: 123456)`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao rodar seed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
