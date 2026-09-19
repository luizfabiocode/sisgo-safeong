import { z } from 'zod';

export const RoleEnum = z.enum(['ADM', 'Financeiro', 'Atendente'], {
  errorMap: () => ({ message: 'Role deve ser ADM, Financeiro ou Atendente' }),
});

export const StatusUsuarioEnum = z.enum(['ATIVO', 'INATIVO', 'BLOQUEADO']);

export const LoginSchema = z.object({
  login: z
    .string({ required_error: 'Login é obrigatório' })
    .min(3, 'Login deve ter pelo menos 3 caracteres')
    .trim(),
  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const RegisterSchema = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim(),
  login: z
    .string({ required_error: 'Login é obrigatório' })
    .min(3, 'Login deve ter no mínimo 3 caracteres')
    .max(30, 'Login deve ter no máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Login pode conter apenas letras, números, ponto, hífen e sublinhado')
    .trim(),
  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: RoleEnum.default('Atendente'),
});

export const UpdateStatusUsuarioSchema = z.object({
  status: StatusUsuarioEnum,
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type Role = z.infer<typeof RoleEnum>;
