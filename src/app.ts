import express, { Request, Response } from 'express';
import cors from 'cors';
import webhookRoutes from './routes/webhook.routes';
import 'dotenv/config';

import { alunoRoutes } from './routes/aluno.routes';
import { registroAcessoRoutes } from './routes/RegistroAcesso.routes';
import { financeiroRoutes } from './routes/financeiroRoutes';
import { fichaRoutes } from './routes/ficha.routes';
import { empresaRoutes } from './routes/empresa.routes';
import { usuarioRoutes } from './routes/usuario.routes';
import authRoutes from './routes/auth.routes';


const app = express();
app.use(cors({
  origin: ['https://atgym.com.br', 'http://localhost:4200'], // Permite produção e desenvolvimento local
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/registro-acesso', registroAcessoRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/fichas', fichaRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/usuarios', usuarioRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('API Atlas Gym rodando!');
});

export default app;