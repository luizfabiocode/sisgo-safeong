import { z } from 'zod';

export const RiscoLogEnum = z.enum(['BAIXO', 'MEDIO', 'ALTO', 'CRITICO']);

export const QueryLogsSchema = z.object({
  risco: RiscoLogEnum.optional(),
  usuarioId: z.string().optional(),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 50)),
  offset: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 0)),
});

export type RiscoLog = z.infer<typeof RiscoLogEnum>;
