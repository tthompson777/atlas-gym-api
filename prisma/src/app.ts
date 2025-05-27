import express from 'express';
import cors from 'cors';
import webhookRoutes from './routes/webhook.routes';
import 'dotenv/config';

import { alunoRoutes } from './routes/aluno.routes';
import { registroAcessoRoutes } from './routes/RegistroAcesso.routes';
import { financeiroRoutes } from './routes/financeiroRoutes';
import { fichaRoutes } from './routes/ficha.routes';
import { empresaRoutes } from './routes/empresa.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/registro-acesso', registroAcessoRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/fichas', fichaRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/empresas', empresaRoutes);

export default app;
