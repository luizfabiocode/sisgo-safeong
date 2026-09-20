import React, { useState } from 'react';
import {
  LayoutDashboard,
  HeartHandshake,
  BellRing,
  History,
  Users,
  LogOut,
  Database,
  CheckCircle2,
  KeyRound,
  Sun,
  Moon,
  HelpCircle,
} from 'lucide-react';
import { UserAuth, NavTab, SystemStatus, ThemeMode } from '../types';
import { GuiaGovernancaModal } from './GuiaGovernancaModal';

interface HeaderProps {
  currentUser: UserAuth | null;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onLogout: () => void;
  systemStatus: SystemStatus | null;
  unreadAlertsCount: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  systemStatus,
  unreadAlertsCount,
  theme,
  onToggleTheme,
}) => {
  const [showGuideModal, setShowGuideModal] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADM':
        return {
          bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
          dot: 'bg-indigo-500 dark:bg-indigo-400',
          label: 'Administrador (ADM)',
        };
      case 'Financeiro':
        return {
          bg: 'bg-[#2EC4B6]/15 text-[#199d91] dark:text-[#2EC4B6] border-[#2EC4B6]/30',
          dot: 'bg-[#2EC4B6]',
          label: 'Financeiro',
        };
      case 'Atendente':
        return {
          bg: 'bg-[#00A8FF]/15 text-[#0082c7] dark:text-[#00A8FF] border-[#00A8FF]/30',
          dot: 'bg-[#00A8FF]',
          label: 'Atendente',
        };
      default:
        return {
          bg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
          dot: 'bg-slate-400',
          label: role || 'Usuário',
        };
    }
  };

  const roleStyle = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 dark:border-slate-800/80 dark:bg-[#0F172A]/95 text-slate-900 dark:text-slate-100 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo e Nome do Sistema */}
          <div className="flex items-center gap-3">
            <img
              src="/Logo.png"
              alt="Logo SiSGO SafeONG"
              className="w-10 h-10 object-contain drop-shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">SiSGO</span>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30">
                  SafeONG
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Gestão Segura &amp; Auditoria</p>
            </div>
          </div>

          {/* Navegação por Abas Desktop */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-800 text-[#00A8FF] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
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
                    ? 'bg-white dark:bg-slate-800 text-[#00A8FF] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
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
                    ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
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
                        ? 'bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <History className="h-4 w-4" />
                    Auditoria
                    <span className="text-[9px] px-1 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-mono">
                      ADM
                    </span>
                  </button>

                  <button
                    id="nav-tab-usuarios"
                    onClick={() => setActiveTab('usuarios')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'usuarios'
                        ? 'bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Usuários
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Ações da Direita: Status SQLite, Alternador de Tema, Ajuda e Usuário */}
          <div className="flex items-center gap-2.5">
            {/* Botão de Ajuda / Guia de Governança SiSGO (HelpCircle) */}
            <button
              id="btn-help-guide"
              type="button"
              onClick={() => setShowGuideModal(true)}
              title="Guia do Usuário & Protocolos de Governança SiSGO"
              aria-label="Abrir Guia do Usuário e Protocolos de Governança"
              className="p-2 rounded-xl border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:text-[#00A8FF] dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-300 dark:hover:text-[#00A8FF]"
            >
              <HelpCircle className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
            </button>

            {/* Botão de Alternância de Tema Claro / Escuro (Sol / Lua) */}
            <button
              id="btn-theme-toggle"
              type="button"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
              aria-label="Alternar tema"
              className="p-2 rounded-xl border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-amber-300"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-300 transition-transform duration-200 hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
              )}
            </button>

            {/* Status do Banco de Dados SQLite (Verde Folha #2EC4B6) */}
            {systemStatus && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <Database className="h-3.5 w-3.5 text-[#00A8FF]" />
                <span className="text-slate-500 dark:text-slate-400">SQLite:</span>
                <span className="text-[#2EC4B6] flex items-center gap-1 font-mono text-[11px] font-semibold">
                  <CheckCircle2 className="h-3 w-3 text-[#2EC4B6]" />
                  Online
                </span>
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-slate-900 dark:text-slate-200 flex items-center justify-end gap-1.5">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 dark:bg-slate-900 dark:hover:bg-rose-950/50 dark:text-slate-300 dark:hover:text-rose-300 dark:border-slate-800 dark:hover:border-rose-800/50 text-xs font-medium transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                <span>Não autenticado</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        {currentUser && (
          <div className="flex md:hidden items-center gap-1 py-2 overflow-x-auto border-t border-slate-200 dark:border-slate-900 scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-800 text-[#00A8FF] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('doacoes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium transition-colors ${
                activeTab === 'doacoes'
                  ? 'bg-white dark:bg-slate-800 text-[#00A8FF] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <HeartHandshake className="h-3.5 w-3.5" />
              Doações
            </button>
            <button
              onClick={() => setActiveTab('alertas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium transition-colors ${
                activeTab === 'alertas'
                  ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <BellRing className="h-3.5 w-3.5" />
              Alertas {unreadAlertsCount > 0 && `(${unreadAlertsCount})`}
            </button>
            {currentUser.role === 'ADM' && (
              <>
                <button
                  onClick={() => setActiveTab('auditoria')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium transition-colors ${
                    activeTab === 'auditoria'
                      ? 'bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  Auditoria
                </button>
                <button
                  onClick={() => setActiveTab('usuarios')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium transition-colors ${
                    activeTab === 'usuarios'
                      ? 'bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
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

      {/* Modal Flutuante: Guia do Usuário & Protocolos de Governança SiSGO */}
      <GuiaGovernancaModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </header>
  );
};

