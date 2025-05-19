import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { alunoRoutes } from './routes/aluno.routes';
import { entradaRoutes } from './routes/entrada.routes';
import { financeiroRoutes } from './routes/financeiroRoutes';
// import { verificarTokenFirebase } from '../../src/middlewares/firebase-auth.middleware';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/entradas', entradaRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/financeiro', financeiroRoutes);

export default app;
