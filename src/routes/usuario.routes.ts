import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateJWT, authorizeRoles, AuthRequest } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { UpdateStatusUsuarioSchema } from '../schemas/auth.schema';
import { registrarLogSistema } from '../middlewares/audit.middleware';

const router = Router();

// Todas as rotas de usuários são protegidas e exclusivas do ADM
router.use(authenticateJWT);
router.use(authorizeRoles('ADM'));

// GET /api/usuarios - Lista todos os usuários
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        login: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            doacoes: true,
            logs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      sucesso: true,
      total: usuarios.length,
      usuarios,
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar usuários.',
    });
  }
});

// PATCH /api/usuarios/:id/status - Altera status do usuário (ATIVO, INATIVO, BLOQUEADO)
router.patch(
  '/:id/status',
  validateBody(UpdateStatusUsuarioSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Não permite que o ADM bloqueie a si mesmo
      if (req.user?.id === id && status !== 'ATIVO') {
        res.status(400).json({
          sucesso: false,
          mensagem: 'O administrador não pode alterar o próprio status para inativo/bloqueado.',
        });
        return;
      }

      const atualizado = await prisma.usuario.update({
        where: { id },
        data: { status },
        select: {
          id: true,
          nome: true,
          login: true,
          role: true,
          status: true,
        },
      });

      await registrarLogSistema({
        usuarioId: req.user?.id,
        acao: `STATUS_USUARIO_ALTERADO: ${atualizado.login} alterado para ${status}`,
        risco: 'MEDIO',
        req,
      });

      res.status(200).json({
        sucesso: true,
        mensagem: 'Status do usuário atualizado com sucesso.',
        usuario: atualizado,
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar status do usuário.',
      });
    }
  }
);

export default router;
