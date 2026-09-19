import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import usuarioRoutes from './usuario.routes';
import doacaoRoutes from './doacao.routes';
import alertaRoutes from './alerta.routes';
import logRoutes from './log.routes';
import { prisma } from '../lib/prisma';

const apiRouter = Router();

// Endpoint de saúde do backend
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    servico: 'SiSGO (SafeONG) Backend API',
    versao: '1.0.0',
  });
});

// Endpoint de estatísticas gerais do sistema
apiRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const [usuarios, doacoes, logs, alertas] = await Promise.all([
      prisma.usuario.count(),
      prisma.doacao.count(),
      prisma.logSistema.count(),
      prisma.alerta.count(),
    ]);

    res.status(200).json({
      sucesso: true,
      banco: {
        tipo: 'SQLite via Prisma ORM',
        arquivo: 'prisma/dev.db',
        status: 'conectado',
      },
      tabelas: {
        usuarios,
        doacoes,
        logs,
        alertas,
      },
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao consultar status do banco.',
    });
  }
});

// Registro dos submódulos da API
apiRouter.use('/auth', authRoutes);
apiRouter.use('/usuarios', usuarioRoutes);
apiRouter.use('/doacoes', doacaoRoutes);
apiRouter.use('/alertas', alertaRoutes);
apiRouter.use('/logs', logRoutes);

export default apiRouter;
