import { z } from 'zod';

export const FormaPagamentoEnum = z.enum([
  'PIX',
  'BOLETO',
  'CARTAO_CREDITO',
  'TRANSFERENCIA',
  'DINHEIRO',
]);

export const StatusDoacaoEnum = z.enum([
  'PENDENTE',
  'CONCLUIDA',
  'ESTORNADA',
  'CANCELADA',
]);

export const CreateDoacaoSchema = z.object({
  valor: z
    .number({ required_error: 'Valor é obrigatório' })
    .positive('Valor da doação deve ser maior que zero')
    .max(1000000, 'Valor excede o limite máximo permitido por transação'),
  formaPagamento: FormaPagamentoEnum,
  status: StatusDoacaoEnum.default('CONCLUIDA'),
});

export const QueryDoacoesSchema = z.object({
  status: StatusDoacaoEnum.optional(),
  formaPagamento: FormaPagamentoEnum.optional(),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 50)),
  offset: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 0)),
});

export type CreateDoacaoInput = z.infer<typeof CreateDoacaoSchema>;
