import React, { useState } from 'react';
import {
  History,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Terminal,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';
import { LogItem, RiscoLog, UserAuth } from '../types';
import { formatDate } from '../services/api';

interface AuditoriaViewProps {
  currentUser: UserAuth;
  logs: LogItem[];
  loading: boolean;
  onRefresh: () => void;
}

export const AuditoriaView: React.FC<AuditoriaViewProps> = ({
  currentUser,
  logs,
  loading,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisco, setFilterRisco] = useState<string>('TODOS');

  // Caso o usuário não seja ADM
  if (currentUser.role !== 'ADM') {
    return (
      <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl mx-auto space-y-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Acesso Restrito a Administradores (ADM)
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Seu papel atual é <strong>{currentUser.role}</strong>. Pelo modelo de Controle de Acesso Baseado em Papéis (RBAC) do SiSGO, somente administradores têm permissão para consultar os registros de auditoria da tabela <code className="text-[#00A8FF] font-semibold">LogSistema</code>.
        </p>
      </div>
    );
  }

  const filteredLogs = logs.filter((l) => {
    if (filterRisco !== 'TODOS' && l.risco !== filterRisco) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAcao = l.acao.toLowerCase().includes(q);
      const matchIp = l.ip?.toLowerCase().includes(q);
      const matchUser =
        l.usuario?.nome.toLowerCase().includes(q) ||
        l.usuario?.login.toLowerCase().includes(q);
      if (!matchAcao && !matchIp && !matchUser) return false;
    }
    return true;
  });

  const getRiscoBadge = (risco: RiscoLog) => {
    switch (risco) {
      case 'CRITICO':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'ALTO':
        return 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30';
      case 'MEDIO':
        return 'bg-[#00A8FF]/15 text-[#0072ad] dark:text-[#00A8FF] border-[#00A8FF]/30';
      case 'BAIXO':
      default:
        return 'bg-[#2EC4B6]/15 text-[#168a7f] dark:text-[#2EC4B6] border-[#2EC4B6]/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <History className="h-6 w-6 text-[#00A8FF]" />
              Painel de Auditoria &amp; Logs do Sistema
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#00A8FF]/10 text-[#007cb8] dark:text-[#00A8FF] border border-[#00A8FF]/20">
              Tabela: LogSistema
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Rastreamento cronológico de segurança, acessos, cadastros e modificações de estado.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-all cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#00A8FF]' : ''}`} />
          <span>Atualizar Logs</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs transition-colors">
        <div className="w-full sm:w-auto flex-1 max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            id="input-search-logs"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por ação, operador ou IP..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00A8FF]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            id="select-filter-risco"
            value={filterRisco}
            onChange={(e) => setFilterRisco(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#00A8FF] cursor-pointer"
          >
            <option value="TODOS">Todos os Riscos</option>
            <option value="CRITICO">Crítico</option>
            <option value="ALTO">Alto</option>
            <option value="MEDIO">Médio</option>
            <option value="BAIXO">Baixo</option>
          </select>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Ação Executada</th>
                <th className="py-3 px-4">Nível de Risco</th>
                <th className="py-3 px-4">Operador</th>
                <th className="py-3 px-4">Endereço IP</th>
                <th className="py-3 px-4">User-Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-3.5 w-3.5 text-[#00A8FF] flex-shrink-0" />
                        <span className="font-sans font-medium text-slate-900 dark:text-slate-100 text-xs break-all">
                          {log.acao}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRiscoBadge(
                          log.risco
                        )}`}
                      >
                        {log.risco === 'CRITICO' || log.risco === 'ALTO' ? (
                          <AlertOctagon className="h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 text-[#2EC4B6]" />
                        )}
                        {log.risco}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      {log.usuario ? (
                        <div>
                          <div className="text-slate-800 dark:text-slate-200 font-semibold">{log.usuario.nome}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            @{log.usuario.login} ({log.usuario.role})
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Sistema / Anônimo</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono">
                        {log.ip || '127.0.0.1'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500 text-[10px] max-w-[200px] truncate" title={log.userAgent || ''}>
                      {log.userAgent || 'Mozilla/5.0'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
