import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('123456', 10);
  const email = 'novo_admin@teste.com';

  // Verifica se o usuário já existe
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email },
  });

  if (usuarioExistente) {
    console.log('⚠️ Usuário já existe!');
    return;
  }

  // Tenta buscar a empresa 1, se não existir, cria
  let empresa = await prisma.empresa.findUnique({
    where: { id: 1 }
  });

  if (!empresa) {
    console.log('⚠️ Empresa 1 não encontrada, criando...');
    empresa = await prisma.empresa.create({
      data: {
        id: 1,
        nome: 'Academia Teste 2',
        email: 'academia2@teste.com'
      }
    });
  }

  // Cria o usuário vinculado à empresa ID 1
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Novo Admin',
      email,
      senhaHash,
      role: 'admin',
      empresaId: empresa.id, // Vincula à empresa encontrada/criada
    },
  });

  console.log('✅ Usuário criado com sucesso!');
  console.log(`📧 Email: ${usuario.email}`);
  console.log(`🔑 Senha: 123456`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar usuário:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
