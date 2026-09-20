export type UserRole = 'ADM' | 'Financeiro' | 'Atendente';
export type UserStatus = 'ATIVO' | 'INATIVO' | 'BLOQUEADO';

export interface UserAuth {
  id: string;
  nome: string;
  login: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
}

export type FormaPagamento = 'PIX' | 'BOLETO' | 'CARTAO_CREDITO' | 'TRANSFERENCIA' | 'DINHEIRO';
export type StatusDoacao = 'CONCLUIDA' | 'PENDENTE' | 'ESTORNADA' | 'CANCELADA';

export interface DoacaoItem {
  id: string;
  valor: number;
  formaPagamento: FormaPagamento;
  status: StatusDoacao;
  dataHora: string;
  usuarioId: string;
  usuario?: {
    id: string;
    nome: string;
    login: string;
    role: UserRole;
  };
  alertas?: Array<{
    id: string;
    titulo: string;
    criticidade: CriticidadeAlerta;
    lido: boolean;
  }>;
}

export type CriticidadeAlerta = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface AlertaItem {
  id: string;
  titulo: string;
  criticidade: CriticidadeAlerta;
  lido: boolean;
  doacaoId: string | null;
  createdAt: string;
  doacao?: {
    id: string;
    valor: number;
    formaPagamento: FormaPagamento;
    status: StatusDoacao;
    dataHora: string;
  } | null;
}

export type RiscoLog = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export interface LogItem {
  id: string;
  usuarioId: string | null;
  acao: string;
  ip: string | null;
  userAgent: string | null;
  risco: RiscoLog;
  timestamp: string;
  usuario?: {
    id: string;
    nome: string;
    login: string;
    role: UserRole;
  } | null;
}

export interface UsuarioItem {
  id: string;
  nome: string;
  login: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  _count?: {
    doacoes: number;
    logs: number;
  };
}

export interface EstatisticasDoacoes {
  totalDoacoes: number;
  totalArrecadado: number;
  ticketMedio: number;
  doacoesConcluidas: number;
}

export interface SystemStatus {
  sucesso: boolean;
  banco: {
    tipo: string;
    arquivo: string;
    status: string;
  };
  tabelas: {
    usuarios: number;
    doacoes: number;
    logs: number;
    alertas: number;
  };
}

export type NavTab = 'dashboard' | 'doacoes' | 'alertas' | 'auditoria' | 'usuarios';

export type ThemeMode = 'light' | 'dark';
