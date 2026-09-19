import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { registrarLogSistema } from './audit.middleware';

export interface AuthenticatedUser {
  id: string;
  nome: string;
  login: string;
  role: string;
  status: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Prioriza Cookie httpOnly 'sisgo_token', com fallback para Header Authorization Bearer
    const tokenFromCookie = req.cookies?.sisgo_token;
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      res.status(401).json({
        sucesso: false,
        mensagem: 'Não autenticado. Token JWT ausente no cookie httpOnly ou cabeçalho.',
      });
      return;
    }

    // 2. Valida assinatura e expiração do JWT
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      login: string;
      role: string;
    };

    // 3. Busca usuário atualizado no banco
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        login: true,
        role: true,
        status: true,
      },
    });

    if (!usuario) {
      res.status(401).json({
        sucesso: false,
        mensagem: 'Usuário associado ao token não foi encontrado.',
      });
      return;
    }

    if (usuario.status !== 'ATIVO') {
      await registrarLogSistema({
        usuarioId: usuario.id,
        acao: 'TENTATIVA_ACESSO_CONTA_INATIVA',
        risco: 'MEDIO',
        req,
      });

      res.status(403).json({
        sucesso: false,
        mensagem: `Acesso negado. Sua conta está com status: ${usuario.status}`,
      });
      return;
    }

    req.user = usuario;
    next();
  } catch (error) {
    res.status(401).json({
      sucesso: false,
      mensagem: 'Token inválido ou expirado.',
      detalhes: error instanceof Error ? error.message : undefined,
    });
  }
};

export const authorizeRoles = (...rolesPermitidas: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        sucesso: false,
        mensagem: 'Usuário não autenticado.',
      });
      return;
    }

    if (!rolesPermitidas.includes(req.user.role)) {
      registrarLogSistema({
        usuarioId: req.user.id,
        acao: `ACESSO_NEGADO_ROLES: exigido [${rolesPermitidas.join(', ')}], usuario=${req.user.role}`,
        risco: 'ALTO',
        req,
      });

      res.status(403).json({
        sucesso: false,
        mensagem: `Permissão insuficiente. Esta rota requer privilégios de [${rolesPermitidas.join(', ')}].`,
      });
      return;
    }

    next();
  };
};
