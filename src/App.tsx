import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { DoacoesView } from './components/DoacoesView';
import { AlertasView } from './components/AlertasView';
import { AuditoriaView } from './components/AuditoriaView';
import { UsuariosView } from './components/UsuariosView';
import { api, getStoredToken } from './services/api';
import {
  UserAuth,
  NavTab,
  DoacaoItem,
  AlertaItem,
  LogItem,
  UsuarioItem,
  EstatisticasDoacoes,
  SystemStatus,
  FormaPagamento,
  StatusDoacao,
  CriticidadeAlerta,
  UserStatus,
} from './types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [initialLoading, setInitialLoading] = useState(true);

  // Data states
  const [doacoes, setDoacoes] = useState<DoacaoItem[]>([]);
  const [stats, setStats] = useState<EstatisticasDoacoes | null>(null);
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Quick Donation trigger for DoacoesView
  const [openDonationModalOnDoacoes, setOpenDonationModalOnDoacoes] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{
    tipo: 'sucesso' | 'erro' | 'info';
    texto: string;
  } | null>(null);

  const showToast = (texto: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso') => {
    setToast({ tipo, texto });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Carregar status do sistema
  const loadSystemStatus = async () => {
    try {
      const s = await api.status();
      setSystemStatus(s);
    } catch (err) {
      console.warn('Status backend indisponível', err);
    }
  };

  // Carregar dados de acordo com o papel do usuário
  const loadAllData = useCallback(async (user: UserAuth) => {
    setLoadingData(true);
    try {
      // 1. Doações e Alertas (Disponíveis para todos autenticados)
      const [doacoesRes, alertasRes] = await Promise.all([
        api.doacoes.list({ limit: 100 }).catch(() => ({ sucesso: false, total: 0, doacoes: [] })),
        api.alertas.list().catch(() => ({ sucesso: false, total: 0, naoLidos: 0, alertas: [] })),
      ]);

      if (doacoesRes.doacoes) setDoacoes(doacoesRes.doacoes);
      if (alertasRes.alertas) setAlertas(alertasRes.alertas);

      // 2. Estatísticas (ADM e Financeiro)
      if (user.role === 'ADM' || user.role === 'Financeiro') {
        try {
          const statsRes = await api.doacoes.stats();
          if (statsRes.estatisticas) setStats(statsRes.estatisticas);
        } catch {
          // Fallback para cálculo local
        }
      }

      // 3. Logs de Auditoria e Usuários (Exclusivo ADM)
      if (user.role === 'ADM') {
        const [logsRes, usuariosRes] = await Promise.all([
          api.logs.list({ limit: 100 }).catch(() => ({ sucesso: false, total: 0, logs: [] })),
          api.usuarios.list().catch(() => ({ sucesso: false, total: 0, usuarios: [] })),
        ]);
        if (logsRes.logs) setLogs(logsRes.logs);
        if (usuariosRes.usuarios) setUsuarios(usuariosRes.usuarios);
      }

      loadSystemStatus();
    } catch (error) {
      console.error('Erro ao carregar dados do SiSGO:', error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Verificar se o usuário já possui sessão ativa (Token ou Cookie)
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      try {
        const res = await api.auth.me();
        if (res.sucesso && res.usuario) {
          setCurrentUser(res.usuario);
          loadAllData(res.usuario);
        }
      } catch {
        // Se falhou e tinha token inválido, limpa
        if (storedToken) {
          // Token pode ter expirado
        }
      } finally {
        setInitialLoading(false);
        loadSystemStatus();
      }
    };

    initAuth();
  }, [loadAllData]);

  // Handler de Login Concluído
  const handleLoginSuccess = (user: UserAuth) => {
    setCurrentUser(user);
    showToast(`Bem-vindo ao SiSGO, ${user.nome}! Sessão iniciada como ${user.role}.`, 'sucesso');
    loadAllData(user);
    setActiveTab('dashboard');
  };

  // Handler de Logout
  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Erro no logout', err);
    } finally {
      setCurrentUser(null);
      setDoacoes([]);
      setAlertas([]);
      setLogs([]);
      setUsuarios([]);
      setStats(null);
      showToast('Sessão encerrada com segurança.', 'info');
      loadSystemStatus();
    }
  };

  // Handler de Criação de Doação
  const handleCreateDoacao = async (data: {
    valor: number;
    formaPagamento: FormaPagamento;
    status: StatusDoacao;
  }): Promise<boolean> => {
    try {
      const res = await api.doacoes.create(data);
      if (res.sucesso) {
        showToast(`Doação de R$ ${data.valor.toFixed(2)} registrada com sucesso!`);
        if (currentUser) {
          loadAllData(currentUser);
        }
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Erro ao registrar doação.', 'erro');
      return false;
    }
  };

  // Handler de Marcar Alerta como Lido / Reabrir
  const handleToggleAlertLido = async (id: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      await api.alertas.toggleLido(id, nextStatus);
      // Atualização otimista local
      setAlertas((prev) =>
        prev.map((a) => (a.id === id ? { ...a, lido: nextStatus } : a))
      );
      showToast(
        nextStatus
          ? 'Alerta marcado como tratado/lido.'
          : 'Alerta reaberto para monitoramento.',
        'sucesso'
      );
      if (currentUser) loadAllData(currentUser);
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar alerta.', 'erro');
    }
  };

  // Handler de Criação de Alerta Manual
  const handleCreateAlerta = async (data: {
    titulo: string;
    criticidade: CriticidadeAlerta;
  }): Promise<boolean> => {
    try {
      const res = await api.alertas.create(data);
      if (res.sucesso) {
        showToast('Alerta de segurança publicado com sucesso.', 'sucesso');
        if (currentUser) loadAllData(currentUser);
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar alerta manual.', 'erro');
      return false;
    }
  };

  // Handler de Atualização de Status de Usuário (ADM)
  const handleUpdateUserStatus = async (id: string, status: UserStatus) => {
    try {
      const res = await api.usuarios.updateStatus(id, status);
      if (res.sucesso) {
        showToast(`Status do usuário alterado para ${status}.`, 'sucesso');
        if (currentUser) loadAllData(currentUser);
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao alterar status do usuário.', 'erro');
    }
  };

  const unreadAlertsCount = alertas.filter((a) => !a.lido).length;

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-300">
        <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold tracking-wide text-white">
          Iniciando SiSGO (SafeONG)...
        </span>
        <span className="text-xs text-slate-500 mt-1">Conectando ao backend e Prisma SQLite</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Toast Notification Flutuante */}
      {toast && (
        <div
          id="toast-notification"
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 max-w-md ${
            toast.tipo === 'sucesso'
              ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
              : toast.tipo === 'erro'
              ? 'bg-slate-900 border-rose-500/40 text-rose-300'
              : 'bg-slate-900 border-sky-500/40 text-sky-300'
          }`}
        >
          {toast.tipo === 'sucesso' && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
          {toast.tipo === 'erro' && <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />}
          {toast.tipo === 'info' && <Info className="h-4 w-4 text-sky-400 flex-shrink-0" />}
          <span className="flex-1">{toast.texto}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header com Navegação e Perfil */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        systemStatus={systemStatus}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!currentUser ? (
          <LoginView onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div>
            {activeTab === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                stats={stats}
                doacoes={doacoes}
                alertas={alertas}
                setActiveTab={setActiveTab}
                onOpenNewDonation={() => {
                  setOpenDonationModalOnDoacoes(true);
                  setActiveTab('doacoes');
                }}
                onMarkAlertRead={handleToggleAlertLido}
              />
            )}

            {activeTab === 'doacoes' && (
              <DoacoesView
                currentUser={currentUser}
                doacoes={doacoes}
                loading={loadingData}
                onRefresh={() => loadAllData(currentUser)}
                onCreateDoacao={handleCreateDoacao}
                initialOpenModal={openDonationModalOnDoacoes}
                onModalClosed={() => setOpenDonationModalOnDoacoes(false)}
              />
            )}

            {activeTab === 'alertas' && (
              <AlertasView
                currentUser={currentUser}
                alertas={alertas}
                loading={loadingData}
                onRefresh={() => loadAllData(currentUser)}
                onToggleLido={handleToggleAlertLido}
                onCreateAlerta={handleCreateAlerta}
              />
            )}

            {activeTab === 'auditoria' && (
              <AuditoriaView
                currentUser={currentUser}
                logs={logs}
                loading={loadingData}
                onRefresh={() => loadAllData(currentUser)}
              />
            )}

            {activeTab === 'usuarios' && (
              <UsuariosView
                currentUser={currentUser}
                usuarios={usuarios}
                loading={loadingData}
                onRefresh={() => loadAllData(currentUser)}
                onUpdateStatus={handleUpdateUserStatus}
              />
            )}
          </div>
        )}
      </main>

      {/* Rodapé Institucional */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SiSGO - SafeONG &copy; {new Date().getFullYear()} • Gestão Financeira Segura &amp; Auditoria</span>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>Stack: Node.js, Express, Prisma, SQLite, React 19, Tailwind</span>
            <span>•</span>
            <span className="text-emerald-500/80 font-mono">RBAC Enforced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
