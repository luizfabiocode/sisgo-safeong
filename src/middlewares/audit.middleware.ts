import { Request } from 'express';
import { prisma } from '../lib/prisma';

interface LogOptions {
  usuarioId?: string | null;
  acao: string;
  risco?: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  req?: Request;
  ip?: string;
  userAgent?: string;
}

export async function registrarLogSistema({
  usuarioId = null,
  acao,
  risco = 'BAIXO',
  req,
  ip,
  userAgent,
}: LogOptions): Promise<void> {
  try {
    const clientIp =
      ip ||
      (req?.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req?.socket.remoteAddress ||
      '127.0.0.1';

    const clientUserAgent =
      userAgent ||
      (req?.headers['user-agent'] as string) ||
      'Desconhecido';

    await prisma.logSistema.create({
      data: {
        usuarioId,
        acao,
        ip: clientIp,
        userAgent: clientUserAgent.substring(0, 255),
        risco,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar LogSistema:', error);
  }
}
