import React from 'react';
import {
  DollarSign,
  HeartHandshake,
  BellRing,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PlusCircle,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';
import {
  UserAuth,
  EstatisticasDoacoes,
  DoacaoItem,
  AlertaItem,
  NavTab,
} from '../types';
import { formatCurrency, formatDate } from '../services/api';

interface DashboardViewProps {
  currentUser: UserAuth;
  stats: EstatisticasDoacoes | null;
  doacoes: DoacaoItem[];
  alertas: AlertaItem[];
  setActiveTab: (tab: NavTab) => void;
  onOpenNewDonation: () => void;
  onMarkAlertRead: (id: string, currentStatus: boolean) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  stats,
  doacoes,
  alertas,
  setActiveTab,
  onOpenNewDonation,
  onMarkAlertRead,
}) => {
  const totalArrecadado = stats?.totalArrecadado ?? doacoes.reduce((acc, d) => acc + (d.status === 'CONCLUIDA' ? d.valor : 0), 0);
  const totalDoacoes = stats?.totalDoacoes ?? doacoes.length;
  const ticketMedio = stats?.ticketMedio ?? (totalDoacoes > 0 ? totalArrecadado / totalDoacoes : 0);
  const alertasNaoLidos = alertas.filter((a) => !a.lido);
  const alertasAltos = alertas.filter((a) => a.criticidade === 'ALTA' || a.criticidade === 'CRITICA');

  // Últimas 4 doações
  const recentDoacoes = doacoes.slice(0, 5);
  // Últimos 4 alertas
  const recentAlertas = alertas.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Banner de Boas-vindas e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 dark:border-slate-800 dark:shadow-xl transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Olá, <span className="text-[#00A8FF]">{currentUser.nome}</span>
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#00A8FF]/10 text-[#00A8FF] border border-[#00A8FF]/25">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Painel de controle financeiro e monitoramento de segurança institucional da SafeONG.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-dash-new-donation"
            onClick={onOpenNewDonation}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A8FF] hover:bg-[#0093e0] text-white text-xs font-bold shadow-md shadow-[#00A8FF]/25 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Nova Doação
          </button>

          <button
            id="btn-dash-view-alerts"
            onClick={() => setActiveTab('alertas')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-200 text-xs font-medium dark:border-slate-700/80 transition-all cursor-pointer"
          >
            <BellRing className="h-4 w-4 text-amber-500" />
            Alertas ({alertasNaoLidos.length})
          </button>
        </div>
      </div>

      {/* Grid de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Total Arrecadado */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800/80 relative overflow-hidden shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Arrecadado
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#00A8FF]/10 border border-[#00A8FF]/20 flex items-center justify-center text-[#00A8FF]">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalArrecadado)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#2EC4B6] font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Valores validados no Prisma</span>
          </div>
        </div>

        {/* Card: Contagem de Doações */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800/80 relative overflow-hidden shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Doações Registradas
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#00A8FF]/10 border border-[#00A8FF]/20 flex items-center justify-center text-[#00A8FF]">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{totalDoacoes}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#2EC4B6]" />
            <span>{stats?.doacoesConcluidas ?? doacoes.filter((d) => d.status === 'CONCLUIDA').length} concluídas</span>
          </div>
        </div>

        {/* Card: Ticket Médio */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800/80 relative overflow-hidden shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ticket Médio
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(ticketMedio)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <CreditCard className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Média por transação</span>
          </div>
        </div>

        {/* Card: Alertas Pendentes */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800/80 relative overflow-hidden shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Alertas Pendentes
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              alertasNaoLidos.length > 0 ? 'bg-amber-500/15 border border-amber-500/30 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              <BellRing className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${alertasNaoLidos.length > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
              {alertasNaoLidos.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">não lidos</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{alertasAltos.length} de alta criticidade</span>
          </div>
        </div>
      </div>

      {/* Linha Dividida: Transações Recentes vs Central de Alertas Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Doações Recentes */}
        <div className="lg:col-span-7 bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-[#00A8FF]" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Doações Recentes</h2>
            </div>
            <button
              onClick={() => setActiveTab('doacoes')}
              className="text-xs text-[#00A8FF] hover:text-[#0093e0] flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              Ver todas ({doacoes.length})
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-2.5">Valor</th>
                  <th className="pb-2.5">Forma</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {recentDoacoes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      Nenhuma doação registrada ainda.
                    </td>
                  </tr>
                ) : (
                  recentDoacoes.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{formatCurrency(d.valor)}</span>
                        {d.valor >= 5000 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/30" title="Transação de Alto Valor (Alerta Gerado)">
                            ALTO VALOR
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/60 font-mono text-[11px]">
                          {d.formaPagamento}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            d.status === 'CONCLUIDA'
                              ? 'bg-[#2EC4B6]/15 text-[#168a7f] dark:text-[#2EC4B6] border border-[#2EC4B6]/30'
                              : d.status === 'PENDENTE'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        {formatDate(d.dataHora)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertas Recentes */}
        <div className="lg:col-span-5 bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Alertas de Segurança</h2>
              </div>
              <button
                onClick={() => setActiveTab('alertas')}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                Gerenciar ({alertas.length})
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentAlertas.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="h-8 w-8 text-[#2EC4B6] mx-auto mb-2" />
                  Nenhum alerta pendente no momento.
                </div>
              ) : (
                recentAlertas.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      a.lido
                        ? 'bg-slate-50 border-slate-200 dark:bg-slate-950/40 dark:border-slate-800/50 opacity-60'
                        : a.criticidade === 'ALTA' || a.criticidade === 'CRITICA'
                        ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            a.criticidade === 'ALTA' || a.criticidade === 'CRITICA'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {a.criticidade}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(a.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                        {a.titulo}
                      </p>
                    </div>

                    <button
                      onClick={() => onMarkAlertRead(a.id, a.lido)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors flex-shrink-0 cursor-pointer ${
                        a.lido
                          ? 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800'
                          : 'bg-[#2EC4B6]/15 hover:bg-[#2EC4B6]/25 text-[#168a7f] dark:text-[#2EC4B6] border border-[#2EC4B6]/30 font-semibold'
                      }`}
                    >
                      {a.lido ? 'Reabrir' : 'Lido'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Regra de monitoramento ativo:</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono font-medium">≥ R$ 5.000,00</span>
          </div>
        </div>
      </div>
    </div>
  );

};
