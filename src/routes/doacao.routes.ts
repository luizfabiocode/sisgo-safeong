import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateJWT, authorizeRoles, AuthRequest } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import { CreateDoacaoSchema, QueryDoacoesSchema, CreateDoacaoInput } from '../schemas/doacao.schema';
import { registrarLogSistema } from '../middlewares/audit.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateJWT);

// GET /api/doacoes - Lista doações
router.get(
  '/',
  validateQuery(QueryDoacoesSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status, formaPagamento, limit, offset } = req.query as any;

      const whereClause: any = {};
      if (status) whereClause.status = status;
      if (formaPagamento) whereClause.formaPagamento = formaPagamento;

      const [total, doacoes] = await Promise.all([
        prisma.doacao.count({ where: whereClause }),
        prisma.doacao.findMany({
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
            alertas: true,
          },
          orderBy: { dataHora: 'desc' },
          take: limit || 50,
          skip: offset || 0,
        }),
      ]);

      res.status(200).json({
        sucesso: true,
        total,
        doacoes,
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar doações.',
      });
    }
  }
);

// GET /api/doacoes/stats - Métricas financeiras
router.get(
  '/stats',
  authorizeRoles('ADM', 'Financeiro'),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const [totalContagem, soma, concluidas] = await Promise.all([
        prisma.doacao.count(),
        prisma.doacao.aggregate({
          _sum: { valor: true },
          _avg: { valor: true },
        }),
        prisma.doacao.count({ where: { status: 'CONCLUIDA' } }),
      ]);

      res.status(200).json({
        sucesso: true,
        estatisticas: {
          totalDoacoes: totalContagem,
          totalArrecadado: soma._sum.valor ?? 0,
          ticketMedio: soma._avg.valor ?? 0,
          doacoesConcluidas: concluidas,
        },
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao obter métricas de doações.',
      });
    }
  }
);

// POST /api/doacoes - Cadastrar nova doação
router.post(
  '/',
  validateBody(CreateDoacaoSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { valor, formaPagamento, status }: CreateDoacaoInput = req.body;
      const usuarioId = req.user?.id;

      const novaDoacao = await prisma.doacao.create({
        data: {
          valor,
          formaPagamento,
          status: status || 'CONCLUIDA',
          usuarioId,
        },
        include: {
          usuario: {
            select: { id: true, nome: true, login: true, role: true },
          },
        },
      });

      // Verificação de Regras de Negócio e Segurança:
      // Se valor >= R$ 5.000, gera Alerta automático de ALTA criticidade
      if (valor >= 5000) {
        await prisma.alerta.create({
          data: {
            titulo: `Transação Suspeita/Alto Valor: R$ ${valor.toFixed(2)} (${formaPagamento})`,
            criticidade: 'ALTA',
            doacaoId: novaDoacao.id,
          },
        });
      }

      // Se status for PENDENTE com valor superior a R$ 1.000
      if (status === 'PENDENTE' && valor >= 1000) {
        await prisma.alerta.create({
          data: {
            titulo: `Doação Pendente sob monitoramento: R$ ${valor.toFixed(2)}`,
            criticidade: 'MEDIA',
            doacaoId: novaDoacao.id,
          },
        });
      }

      await registrarLogSistema({
        usuarioId,
        acao: `CADASTRO_DOACAO: R$ ${valor} (${formaPagamento}) - status: ${status}`,
        risco: valor >= 5000 ? 'MEDIO' : 'BAIXO',
        req,
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Doação registrada com sucesso.',
        doacao: novaDoacao,
      });
    } catch (error) {
      console.error('Erro ao registrar doação:', error);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno ao registrar doação.',
      });
    }
  }
);

export default router;
