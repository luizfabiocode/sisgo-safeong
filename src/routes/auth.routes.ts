import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { validateBody } from '../middlewares/validate.middleware';
import { LoginSchema, RegisterSchema, LoginInput, RegisterInput } from '../schemas/auth.schema';
import { authenticateJWT, AuthRequest } from '../middlewares/auth.middleware';
import { registrarLogSistema } from '../middlewares/audit.middleware';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  validateBody(RegisterSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { nome, login, senha, role }: RegisterInput = req.body;

      // 1. Verifica se login já existe
      const existente = await prisma.usuario.findUnique({
        where: { login },
      });

      if (existente) {
        res.status(409).json({
          sucesso: false,
          mensagem: 'Este login já está em uso no sistema.',
        });
        return;
      }

      // 2. Hash seguro da senha com Bcrypt
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      // 3. Cria usuário
      const novoUsuario = await prisma.usuario.create({
        data: {
          nome,
          login,
          senhaHash,
          role,
          status: 'ATIVO',
        },
        select: {
          id: true,
          nome: true,
          login: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      // 4. Auditoria de segurança
      await registrarLogSistema({
        usuarioId: novoUsuario.id,
        acao: `USUARIO_CADASTRADO: ${login} com papel ${role}`,
        risco: 'MEDIO',
        req,
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Usuário cadastrado com sucesso!',
        usuario: novoUsuario,
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno ao cadastrar usuário.',
      });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  validateBody(LoginSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { login, senha }: LoginInput = req.body;

      // 1. Busca usuário pelo login
      const usuario = await prisma.usuario.findUnique({
        where: { login },
      });

      if (!usuario) {
        await registrarLogSistema({
          acao: `TENTATIVA_LOGIN_FALHOU: login inexistente "${login}"`,
          risco: 'MEDIO',
          req,
        });

        res.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas (login ou senha incorretos).',
        });
        return;
      }

      // 2. Verifica se a conta está ativa
      if (usuario.status !== 'ATIVO') {
        await registrarLogSistema({
          usuarioId: usuario.id,
          acao: `TENTATIVA_LOGIN_BLOQUEADO: status ${usuario.status}`,
          risco: 'ALTO',
          req,
        });

        res.status(403).json({
          sucesso: false,
          mensagem: `Acesso bloqueado. Conta com status: ${usuario.status}`,
        });
        return;
      }

      // 3. Valida senha com Bcrypt
      const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

      if (!senhaValida) {
        await registrarLogSistema({
          usuarioId: usuario.id,
          acao: `TENTATIVA_LOGIN_SENHA_ERRADA: login "${login}"`,
          risco: 'MEDIO',
          req,
        });

        res.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas (login ou senha incorretos).',
        });
        return;
      }

      // 4. Gera JWT assinado
      const token = jwt.sign(
        {
          id: usuario.id,
          login: usuario.login,
          role: usuario.role,
        },
        env.JWT_SECRET,
        {
          expiresIn: '1d',
        }
      );

      // 5. Configura Cookie HTTP-Only seguro
      const isProduction = env.NODE_ENV === 'production';
      res.cookie('sisgo_token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 dia
        path: '/',
      });

      // 6. Registra log de login bem-sucedido
      await registrarLogSistema({
        usuarioId: usuario.id,
        acao: `LOGIN_SUCESSO: ${login} (${usuario.role})`,
        risco: 'BAIXO',
        req,
      });

      res.status(200).json({
        sucesso: true,
        mensagem: 'Autenticado com sucesso!',
        token, // Também enviado para clientes que precisam de Authorization header
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          login: usuario.login,
          role: usuario.role,
          status: usuario.status,
          createdAt: usuario.createdAt,
        },
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno ao realizar login.',
      });
    }
  }
);

// POST /api/auth/logout
router.post('/logout', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await registrarLogSistema({
        usuarioId: req.user.id,
        acao: `LOGOUT: ${req.user.login}`,
        risco: 'BAIXO',
        req,
      });
    }

    res.clearCookie('sisgo_token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    res.status(200).json({
      sucesso: true,
      mensagem: 'Logout realizado com sucesso. Cookie httpOnly removido.',
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao deslogar.',
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    sucesso: true,
    usuario: req.user,
  });
});

export default router;
