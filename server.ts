import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { env } from './src/config/env';
import apiRouter from './src/routes/index';
import { seedInitialData } from './src/server/seed';

async function startServer(): Promise<void> {
  const app = express();
  const PORT = 3000;

  // Middlewares básicos de segurança e parsing
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check direto
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Rotas de API registradas PRIMEIRO
  app.use('/api', apiRouter);

  // Integração com Vite para servir a interface ou estáticos
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor SiSGO (SafeONG) em execução em http://0.0.0.0:${PORT}`);
    console.log(`📦 Banco de dados SQLite conectado em: prisma/dev.db`);
    console.log(`🔒 Autenticação JWT via Cookie httpOnly ativo`);

    // Inicializa dados do banco SQLite de forma assíncrona sem bloquear o bind da porta
    seedInitialData().catch((err) => {
      console.error('Erro não-bloqueante ao inicializar dados do seed:', err);
    });
  });
}

startServer().catch((err) => {
  console.error('Falha crítica ao inicializar servidor:', err);
  process.exit(1);
});
