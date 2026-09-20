import React, { useState } from 'react';
import { ShieldCheck, User, KeyRound, ArrowRight, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { UserAuth } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserAuth, token?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [login, setLogin] = useState('admin');
  const [senha, setSenha] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const testAccounts = [
    {
      role: 'ADM',
      label: 'Administrador (ADM)',
      login: 'admin',
      senha: 'Admin@123',
      desc: 'Acesso total: auditoria de logs, gestão de usuários, alertas e doações.',
      badgeColor: 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20',
    },
    {
      role: 'Financeiro',
      label: 'Operador Financeiro',
      login: 'financeiro',
      senha: 'Finan@123',
      desc: 'Gestão de doações, métricas de arrecadação e alertas de transações.',
      badgeColor: 'bg-[#2EC4B6]/10 dark:bg-[#2EC4B6]/15 text-[#168a7f] dark:text-[#2EC4B6] border-[#2EC4B6]/30 hover:bg-[#2EC4B6]/20',
    },
    {
      role: 'Atendente',
      label: 'Atendente de Recepção',
      login: 'atendente',
      senha: 'Atend@123',
      desc: 'Registro e consulta de doações recebidas de apoiadores.',
      badgeColor: 'bg-[#00A8FF]/10 dark:bg-[#00A8FF]/15 text-[#007cbd] dark:text-[#00A8FF] border-[#00A8FF]/30 hover:bg-[#00A8FF]/20',
    },
  ];

  const handleQuickFill = (accLogin: string, accSenha: string) => {
    setLogin(accLogin);
    setSenha(accSenha);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.auth.login(login, senha);
      if (response.sucesso) {
        onLoginSuccess(response.usuario, response.token);
      } else {
        setErrorMessage(response.mensagem || 'Credenciais inválidas.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao comunicar com o servidor de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Coluna Esquerda: Apresentação & Atalhos */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00A8FF]/10 text-[#00A8FF] border border-[#00A8FF]/30 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-[#00A8FF]" />
              Autenticação Segura RBAC
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              SiSGO <span className="text-[#00A8FF] font-semibold">SafeONG</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Sistema unificado de gestão de doações para organizações sem fins lucrativos com controle de acesso baseado em papéis, auditoria de acessos e monitoramento de transações de alto valor.
            </p>
          </div>

          {/* Cartões de Contas Rápidas de Demonstração */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
              <span className="font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Selecione uma conta para teste rápido:
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {testAccounts.map((acc) => (
                <button
                  key={acc.role}
                  id={`btn-fill-${acc.role.toLowerCase()}`}
                  type="button"
                  onClick={() => handleQuickFill(acc.login, acc.senha)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${acc.badgeColor} ${
                    login === acc.login
                      ? 'ring-2 ring-[#00A8FF] bg-white dark:bg-slate-900 shadow-sm'
                      : 'bg-white/80 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {acc.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      login: <strong className="text-slate-800 dark:text-slate-200">{acc.login}</strong>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{acc.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 shadow-xs">
            <div className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-[#00A8FF]" />
              Proteção de Sessão em Dois Níveis
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              O backend grava um cookie <code className="text-[#00A8FF] font-semibold">httpOnly: true</code> assinado e fornece o token JWT retornado no payload JSON, enviado via cabeçalho <code className="text-[#00A8FF] font-semibold">Authorization: Bearer &lt;token&gt;</code> pelo cliente.
            </p>
          </div>
        </div>

        {/* Coluna Direita: Formulário de Login */}
        <div className="lg:col-span-6">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl dark:shadow-slate-950/80 backdrop-blur-xl transition-colors">
            <div className="mb-6">
              <img
                src="/Logo.png"
                alt="Logo SiSGO SafeONG"
                className="w-12 h-12 object-contain mb-3 drop-shadow-xs"
              />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Acesso ao Sistema</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Digite suas credenciais corporativas para acessar o painel
              </p>
            </div>

            {errorMessage && (
              <div
                id="login-error-alert"
                className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Falha de autenticação</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="input-login"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
                >
                  Usuário / Login
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="input-login"
                    type="text"
                    required
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="Ex: admin, financeiro, atendente"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/40 focus:border-[#00A8FF] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="input-senha"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
                  >
                    Senha de Acesso
                  </label>
                  <span className="text-[11px] text-slate-500">Mínimo 6 caracteres</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="input-senha"
                    type="password"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/40 focus:border-[#00A8FF] transition-all"
                  />
                </div>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 mt-2 rounded-xl bg-[#00A8FF] hover:bg-[#0093e0] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#00A8FF]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no SiSGO</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

