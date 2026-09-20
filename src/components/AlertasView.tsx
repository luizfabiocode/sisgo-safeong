import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  X,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  AlertaItem,
  CriticidadeAlerta,
  UserAuth,
} from '../types';
import { formatCurrency, formatDate } from '../services/api';

interface AlertasViewProps {
  currentUser: UserAuth;
  alertas: AlertaItem[];
  loading: boolean;
  onRefresh: () => void;
  onToggleLido: (id: string, currentStatus: boolean) => Promise<void>;
  onCreateAlerta: (data: {
    titulo: string;
    criticidade: CriticidadeAlerta;
  }) => Promise<boolean>;
}

export const AlertasView: React.FC<AlertasViewProps> = ({
  alertas,
  loading,
  onRefresh,
  onToggleLido,
  onCreateAlerta,
}) => {
  const [filterCriticidade, setFilterCriticidade] = useState<string>('TODAS');
  const [filterLido, setFilterLido] = useState<string>('TODOS');
  const [showManualModal, setShowManualModal] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [criticidade, setCriticidade] = useState<CriticidadeAlerta>('ALTA');
  const [submitting, setSubmitting] = useState(false);

  const filteredAlertas = alertas.filter((a) => {
    if (filterCriticidade !== 'TODAS' && a.criticidade !== filterCriticidade) return false;
    if (filterLido === 'NAO_LIDOS' && a.lido) return false;
    if (filterLido === 'LIDOS' && !a.lido) return false;
    return true;
  });

  const totalNaoLidos = alertas.filter((a) => !a.lido).length;
  const totalAltos = alertas.filter((a) => a.criticidade === 'ALTA' || a.criticidade === 'CRITICA').length;

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    setSubmitting(true);
    const ok = await onCreateAlerta({ titulo, criticidade });
    setSubmitting(false);

    if (ok) {
      setTitulo('');
      setShowManualModal(false);
    }
  };

  const getCriticidadeStyle = (crit: CriticidadeAlerta) => {
    switch (crit) {
      case 'CRITICA':
        return {
          badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
          card: 'border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/15',
          iconColor: 'text-rose-500',
        };
      case 'ALTA':
        return {
          badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
          card: 'border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/15',
          iconColor: 'text-amber-500',
        };
      case 'MEDIA':
        return {
          badge: 'bg-[#00A8FF]/15 text-[#0072ad] dark:text-[#00A8FF] border-[#00A8FF]/30',
          card: 'border-sky-200 bg-sky-50/30 dark:border-sky-900/30 dark:bg-sky-950/10',
          iconColor: 'text-[#00A8FF]',
        };
      case 'BAIXA':
      default:
        return {
          badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          card: 'border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-900/40',
          iconColor: 'text-slate-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <BellRing className="h-6 w-6 text-amber-500" />
              Central de Alertas de Segurança
            </h1>
            {totalNaoLidos > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                {totalNaoLidos} Pendentes
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitoramento preventivo de transações atípicas, conformidade financeira e eventos críticos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            title="Atualizar alertas"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>

          <button
            id="btn-open-manual-alert"
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold dark:border-slate-700/80 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4 text-amber-500" />
            Novo Alerta Manual
          </button>
        </div>
      </div>

      {/* Regra de Ouro em Destaque */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 dark:bg-gradient-to-r dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-950 dark:border-amber-500/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 flex-shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
              Disparo Automático de Alertas (Backend Policy)
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">
              Qualquer doação registrada com valor igual ou superior a <strong>R$ 5.000,00</strong> dispara imediatamente um alerta de <strong className="text-amber-700 dark:text-amber-300">ALTA criticidade</strong> para análise da diretoria.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
          <span className="font-mono px-2 py-1 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-bold shadow-xs">
            {totalAltos} Alto / Crítico
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shadow-xs transition-colors">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Filtrar:
          </span>

          <select
            id="filter-alert-crit"
            value={filterCriticidade}
            onChange={(e) => setFilterCriticidade(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#00A8FF] cursor-pointer"
          >
            <option value="TODAS">Todas as Criticidades</option>
            <option value="CRITICA">Crítica</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Média</option>
            <option value="BAIXA">Baixa</option>
          </select>

          <select
            id="filter-alert-status"
            value={filterLido}
            onChange={(e) => setFilterLido(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#00A8FF] cursor-pointer"
          >
            <option value="TODOS">Todos os Alertas ({alertas.length})</option>
            <option value="NAO_LIDOS">Somente Não Lidos ({totalNaoLidos})</option>
            <option value="LIDOS">Somente Resolvidos / Lidos ({alertas.length - totalNaoLidos})</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Exibindo {filteredAlertas.length} de {alertas.length} registros
        </span>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-3">
        {filteredAlertas.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs">
            <CheckCircle2 className="h-10 w-10 text-[#2EC4B6] mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">Nenhum alerta localizado</p>
            <p className="text-xs text-slate-500 mt-0.5">Todos os requisitos de segurança estão conformes.</p>
          </div>
        ) : (
          filteredAlertas.map((alerta) => {
            const style = getCriticidadeStyle(alerta.criticidade);
            const isHighValueAlert = alerta.doacao && alerta.doacao.valor >= 5000;

            return (
              <div
                key={alerta.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${style.card} ${
                  alerta.lido ? 'opacity-65' : 'shadow-xs'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider border ${style.badge}`}
                    >
                      {alerta.criticidade}
                    </span>

                    {isHighValueAlert && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                        VALOR ≥ R$ 5.000,00
                      </span>
                    )}

                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {formatDate(alerta.createdAt)}
                    </span>

                    {alerta.lido ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#168a7f] dark:text-[#2EC4B6] font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Tratado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-bold animate-pulse">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Pendente de Ação
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {alerta.titulo}
                  </h3>

                  {/* Informações da Doação Vinculada */}
                  {alerta.doacao && (
                    <div className="mt-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <ExternalLink className="h-3 w-3 text-[#00A8FF]" />
                        Doação Vinculada:
                      </span>
                      <span className="font-bold text-[#0082c7] dark:text-[#00A8FF] font-mono">
                        {formatCurrency(alerta.doacao.valor)}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono border border-slate-200 dark:border-slate-700">
                        {alerta.doacao.formaPagamento}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Status: <strong className="text-slate-800 dark:text-slate-200">{alerta.doacao.status}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Ações do Alerta */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  <button
                    id={`btn-toggle-alerta-${alerta.id}`}
                    onClick={() => onToggleLido(alerta.id, alerta.lido)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      alerta.lido
                        ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        : 'bg-[#2EC4B6] hover:bg-[#28b2a5] text-white shadow-md shadow-[#2EC4B6]/25'
                    }`}
                  >
                    {alerta.lido ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Reabrir Alerta
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Marcar como Tratado
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Alerta Manual */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Criar Alerta de Segurança</h3>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="input-manual-titulo" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Descrição / Motivo do Alerta *
                </label>
                <input
                  id="input-manual-titulo"
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Auditoria solicitada para lote de doações PIX"
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="select-manual-crit" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nível de Criticidade *
                </label>
                <select
                  id="select-manual-crit"
                  value={criticidade}
                  onChange={(e) => setCriticidade(e.target.value as CriticidadeAlerta)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/50 cursor-pointer"
                >
                  <option value="CRITICA">Crítica (Intervenção Imediata)</option>
                  <option value="ALTA">Alta (Análise em até 24h)</option>
                  <option value="MEDIA">Média (Acompanhamento)</option>
                  <option value="BAIXA">Baixa (Informativo)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirm-manual-alert"
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : 'Publicar Alerta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
