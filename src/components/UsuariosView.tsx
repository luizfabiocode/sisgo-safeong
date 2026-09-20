import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Lock,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { UsuarioItem, UserAuth, UserStatus } from '../types';
import { formatDate } from '../services/api';

interface UsuariosViewProps {
  currentUser: UserAuth;
  usuarios: UsuarioItem[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: UserStatus) => Promise<void>;
}

export const UsuariosView: React.FC<UsuariosViewProps> = ({
  currentUser,
  usuarios,
  loading,
  onRefresh,
  onUpdateStatus,
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (currentUser.role !== 'ADM') {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl mx-auto space-y-3 shadow-xs">
        <Lock className="h-8 w-8 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Acesso Exclusivo para Administrador</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">Somente usuários com papel ADM podem gerenciar os operadores.</p>
      </div>
    );
  }

  const handleStatusToggle = async (user: UsuarioItem) => {
    if (user.id === currentUser.id) {
      alert('Você não pode alterar o status do seu próprio usuário logado.');
      return;
    }

    const nextStatus: UserStatus = user.status === 'ATIVO' ? 'BLOQUEADO' : 'ATIVO';
    setUpdatingId(user.id);
    try {
      await onUpdateStatus(user.id, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-[#00A8FF]" />
            Gestão de Usuários &amp; Controle de Acesso
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualização de contas autorizadas no sistema, papéis de segurança e status operacional.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#00A8FF]' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Nome do Operador</th>
                <th className="py-3.5 px-4">Login</th>
                <th className="py-3.5 px-4">Papel (RBAC)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Data de Criação</th>
                <th className="py-3.5 px-4">Atividades</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      {u.nome.charAt(0)}
                    </div>
                    <span>{u.nome}</span>
                    {u.id === currentUser.id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2EC4B6]/15 text-[#168a7f] dark:text-[#2EC4B6] font-mono border border-[#2EC4B6]/30">
                        Você
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    @{u.login}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        u.role === 'ADM'
                          ? 'bg-[#00A8FF]/15 text-[#0072ad] dark:text-[#00A8FF] border-[#00A8FF]/30'
                          : u.role === 'Financeiro'
                          ? 'bg-[#2EC4B6]/15 text-[#168a7f] dark:text-[#2EC4B6] border-[#2EC4B6]/30'
                          : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.status === 'ATIVO'
                          ? 'bg-[#2EC4B6]/15 text-[#168a7f] dark:text-[#2EC4B6] border-[#2EC4B6]/30'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.status === 'ATIVO' ? 'bg-[#2EC4B6]' : 'bg-rose-500'
                        }`}
                      />
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {formatDate(u.createdAt)}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                    {u._count ? (
                      <span className="text-slate-500 dark:text-slate-400">
                        {u._count.doacoes} doações / {u._count.logs} logs
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {u.id !== currentUser.id && (
                      <button
                        onClick={() => handleStatusToggle(u)}
                        disabled={updatingId === u.id}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          u.status === 'ATIVO'
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            : 'bg-[#2EC4B6]/15 hover:bg-[#2EC4B6]/25 text-[#168a7f] dark:text-[#2EC4B6] border border-[#2EC4B6]/30'
                        }`}
                      >
                        {updatingId === u.id
                          ? 'Atualizando...'
                          : u.status === 'ATIVO'
                          ? 'Bloquear'
                          : 'Reativar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
