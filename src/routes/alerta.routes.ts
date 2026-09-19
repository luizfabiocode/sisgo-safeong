import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateJWT, AuthRequest } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { CreateAlertaSchema, UpdateAlertaSchema, CreateAlertaInput, UpdateAlertaInput } from '../schemas/alerta.schema';
import { registrarLogSistema } from '../middlewares/audit.middleware';

const router = Router();

router.use(authenticateJWT);

// GET /api/alertas - Lista alertas
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { criticidade, lido } = req.query;

    const whereClause: any = {};
    if (criticidade) whereClause.criticidade = String(criticidade);
    if (lido !== undefined) whereClause.lido = lido === 'true';

    const [total, naoLidos, alertas] = await Promise.all([
      prisma.alerta.count({ where: whereClause }),
      prisma.alerta.count({ where: { lido: false } }),
      prisma.alerta.findMany({
        where: whereClause,
        include: {
          doacao: {
            select: {
              id: true,
              valor: true,
              formaPagamento: true,
              status: true,
              dataHora: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.status(200).json({
      sucesso: true,
      total,
      naoLidos,
      alertas,
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar alertas.',
    });
  }
});

// PATCH /api/alertas/:id/lido - Marca alerta como lido/não lido
router.patch(
  '/:id/lido',
  validateBody(UpdateAlertaSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { lido }: UpdateAlertaInput = req.body;

      const alerta = await prisma.alerta.update({
        where: { id },
        data: { lido },
      });

      await registrarLogSistema({
        usuarioId: req.user?.id,
        acao: `ALERTA_ATUALIZADO: ${alerta.titulo} marcado como ${lido ? 'LIDO' : 'NAO_LIDO'}`,
        risco: 'BAIXO',
        req,
      });

      res.status(200).json({
        sucesso: true,
        mensagem: `Alerta marcado como ${lido ? 'lido' : 'não lido'}.`,
        alerta,
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar status do alerta.',
      });
    }
  }
);

// POST /api/alertas - Criação manual de alerta
router.post(
  '/',
  validateBody(CreateAlertaSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { titulo, criticidade, doacaoId }: CreateAlertaInput = req.body;

      const novoAlerta = await prisma.alerta.create({
        data: {
          titulo,
          criticidade,
          doacaoId: doacaoId || null,
        },
      });

      await registrarLogSistema({
        usuarioId: req.user?.id,
        acao: `NOVO_ALERTA_CRIADO: ${titulo} [${criticidade}]`,
        risco: criticidade === 'CRITICA' || criticidade === 'ALTA' ? 'ALTO' : 'MEDIO',
        req,
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Alerta gerado com sucesso.',
        alerta: novoAlerta,
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao criar alerta.',
      });
    }
  }
);

export default router;
