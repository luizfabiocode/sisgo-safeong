import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateJWT, authorizeRoles, AuthRequest } from '../middlewares/auth.middleware';
import { validateQuery } from '../middlewares/validate.middleware';
import { QueryLogsSchema } from '../schemas/log.schema';

const router = Router();

// Logs de auditoria são de acesso restrito a administradores
router.use(authenticateJWT);
router.use(authorizeRoles('ADM'));

// GET /api/logs - Listar logs de auditoria
router.get(
  '/',
  validateQuery(QueryLogsSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { risco, usuarioId, limit, offset } = req.query as any;

      const whereClause: any = {};
      if (risco) whereClause.risco = risco;
      if (usuarioId) whereClause.usuarioId = usuarioId;

      const [total, logs] = await Promise.all([
        prisma.logSistema.count({ where: whereClause }),
        prisma.logSistema.findMany({
          where: whereClause,
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                login: true,
                role: true,
              },
            },
          },
          orderBy: { timestamp: 'desc' },
          take: limit || 50,
          skip: offset || 0,
        }),
      ]);

      res.status(200).json({
        sucesso: true,
        total,
        logs,
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao consultar logs do sistema.',
      });
    }
  }
);

export default router;
