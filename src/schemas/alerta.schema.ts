import { z } from 'zod';

export const CriticidadeEnum = z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']);

export const CreateAlertaSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  criticidade: CriticidadeEnum.default('MEDIA'),
  doacaoId: z.string().uuid().optional(),
});

export const UpdateAlertaSchema = z.object({
  lido: z.boolean(),
});

export type CreateAlertaInput = z.infer<typeof CreateAlertaSchema>;
export type UpdateAlertaInput = z.infer<typeof UpdateAlertaSchema>;
