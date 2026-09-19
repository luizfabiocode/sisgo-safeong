import React from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  HeartHandshake,
  BellRing,
  History,
  Users,
  LogOut,
  Database,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { UserAuth, NavTab, SystemStatus } from '../types';

interface HeaderProps {
  currentUser: UserAuth | null;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onLogout: () => void;
  systemStatus: SystemStatus | null;
  unreadAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  systemStatus,
  unreadAlertsCount,
}) => {
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADM':
        return {
          bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          dot: 'bg-indigo-400',
          label: 'Administrador (ADM)',
        };
      case 'Financeiro':
        return {
          bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: 'Financeiro',
        };
      case 'Atendente':
        return {
          bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          dot: 'bg-sky-400',
          label: 'Atendente',
        };
      default:
        return {
          bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
          dot: 'bg-slate-400',
          label: role || 'Usuário',
        };
    }
  };

  const roleStyle = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo e Nome do Sistema */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">SiSGO</span>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  SafeONG
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Gestão Segura &amp; Auditoria</p>
            </div>
          </div>

          {/* Navegação por Abas */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>

              <button
                id="nav-tab-doacoes"
                onClick={() => setActiveTab('doacoes')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'doacoes'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <HeartHandshake className="h-4 w-4" />
                Doações
              </button>

              <button
                id="nav-tab-alertas"
                onClick={() => setActiveTab('alertas')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                  activeTab === 'alertas'
                    ? 'bg-slate-800 text-amber-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <BellRing className="h-4 w-4" />
                Alertas
                {unreadAlertsCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {currentUser.role === 'ADM' && (
                <>
                  <button
                    id="nav-tab-auditoria"
                    onClick={() => setActiveTab('auditoria')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'auditoria'
                        ? 'bg-slate-800 text-indigo-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <History className="h-4 w-4" />
                    Auditoria
                    <span className="text-[9px] px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      ADM
                    </span>
                  </button>

                  <button
                    id="nav-tab-usuarios"
                    onClick={() => setActiveTab('usuarios')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'usuarios'
                        ? 'bg-slate-800 text-indigo-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Usuários
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Status do Banco e Usuário Logado */}
          <div className="flex items-center gap-3">
            {/* Status do Banco de Dados SQLite */}
            {systemStatus && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <Database className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-slate-400">SQLite:</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                  <CheckCircle2 className="h-3 w-3" />
                  Online
                </span>
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-slate-200 flex items-center justify-end gap-1.5">
                    <span>{currentUser.nome}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleStyle.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${roleStyle.dot}`} />
                      {roleStyle.label}
                    </span>
                  </div>
                </div>

                <button
                  id="btn-header-logout"
                  onClick={onLogout}
                  title="Encerrar Sessão Segura"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800/50 text-xs font-medium transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                <span>Não autenticado</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        {currentUser && (
          <div className="flex md:hidden items-center gap-1 py-2 overflow-x-auto border-t border-slate-900 scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
                activeTab === 'dashboard' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('doacoes')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
                activeTab === 'doacoes' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
              }`}
            >
              <HeartHandshake className="h-3.5 w-3.5" />
              Doações
            </button>
            <button
              onClick={() => setActiveTab('alertas')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
                activeTab === 'alertas' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'
              }`}
            >
              <BellRing className="h-3.5 w-3.5" />
              Alertas {unreadAlertsCount > 0 && `(${unreadAlertsCount})`}
            </button>
            {currentUser.role === 'ADM' && (
              <>
                <button
                  onClick={() => setActiveTab('auditoria')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
                    activeTab === 'auditoria' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400'
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  Auditoria
                </button>
                <button
                  onClick={() => setActiveTab('usuarios')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
                    activeTab === 'usuarios' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Usuários
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
