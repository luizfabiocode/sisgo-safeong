import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter no mínimo 16 caracteres').default('sisgo_secret_jwt_key_segura_para_autenticacao_safeong_2025'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  COOKIE_SECRET: z.string().default('sisgo_cookie_secret_safeong_signing_key'),
  APP_URL: z.string().default('http://localhost:3000'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Configuração inválida das variáveis de ambiente:', parsedEnv.error.format());
  throw new Error('Variáveis de ambiente inválidas. Verifique seu arquivo .env');
}

export const env = parsedEnv.data;
