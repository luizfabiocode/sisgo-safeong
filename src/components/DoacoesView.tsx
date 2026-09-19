import React, { useState } from 'react';
import {
  HeartHandshake,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  X,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  DoacaoItem,
  FormaPagamento,
  StatusDoacao,
  UserAuth,
} from '../types';
import { formatCurrency, formatDate } from '../services/api';

interface DoacoesViewProps {
  currentUser: UserAuth;
  doacoes: DoacaoItem[];
  loading: boolean;
  onRefresh: () => void;
  onCreateDoacao: (data: {
    valor: number;
    formaPagamento: FormaPagamento;
    status: StatusDoacao;
  }) => Promise<boolean>;
  initialOpenModal?: boolean;
  onModalClosed?: () => void;
}

export const DoacoesView: React.FC<DoacoesViewProps> = ({
  doacoes,
  loading,
  onRefresh,
  onCreateDoacao,
  initialOpenModal = false,
  onModalClosed,
}) => {
  const [showModal, setShowModal] = useState(initialOpenModal);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialOpenModal) {
      setShowModal(true);
    }
  }, [initialOpenModal]);

  const handleClose = () => {
    setShowModal(false);
    if (onModalClosed) onModalClosed();
  };

  // Form State
  const [valor, setValor] = useState<string>('250.00');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');
  const [status, setStatus] = useState<StatusDoacao>('CONCLUIDA');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterPagamento, setFilterPagamento] = useState<string>('TODOS');

  const numValor = parseFloat(valor) || 0;
  const willTriggerAlert = numValor >= 5000;
  const willTriggerPendingAlert = status === 'PENDENTE' && numValor >= 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numValor <= 0) {
      setModalError('O valor da doação deve ser maior que zero.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    const success = await onCreateDoacao({
      valor: numValor,
      formaPagamento,
      status,
    });

    setSubmitting(false);
    if (success) {
      handleClose();
      setValor('250.00');
    } else {
      setModalError('Não foi possível registrar a doação.');
    }
  };

  // Filtragem local das doações
  const filteredDoacoes = doacoes.filter((d) => {
    if (filterStatus !== 'TODOS' && d.status !== filterStatus) return false;
    if (filterPagamento !== 'TODOS' && d.formaPagamento !== filterPagamento) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = d.id.toLowerCase().includes(q);
      const matchUser = d.usuario?.nome.toLowerCase().includes(q) || d.usuario?.login.toLowerCase().includes(q);
      const matchForma = d.formaPagamento.toLowerCase().includes(q);
      if (!matchId && !matchUser && !matchForma) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    if (filteredDoacoes.length === 0) return;
    const headers = ['ID', 'Valor', 'Forma Pagamento', 'Status', 'Data/Hora', 'Operador'];
    const rows = filteredDoacoes.map((d) => [
      d.id,
      d.valor.toFixed(2),
      d.formaPagamento,
      d.status,
      d.dataHora,
      d.usuario ? `${d.usuario.nome} (${d.usuario.login})` : 'Sistema',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `doacoes_sisgo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header com Título e Botão de Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <HeartHandshake className="h-6 w-6 text-emerald-400" />
            Gestão de Doações
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro contábil de entradas financeiras e rastreabilidade por operador.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Atualizar dados"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-all cursor-pointer"
            title="Exportar dados filtrados em CSV"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            id="btn-open-donation-modal"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Registrar Doação
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Input de Busca */}
        <div className="sm:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            id="input-search-doacoes"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID, operador ou método..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>

        {/* Filtro por Status */}
        <div className="sm:col-span-3">
          <div className="relative">
            <select
              id="select-filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none cursor-pointer"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="CONCLUIDA">Concluídas</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="ESTORNADA">Estornadas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-500">
              <Filter className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Filtro por Forma de Pagamento */}
        <div className="sm:col-span-3">
          <div className="relative">
            <select
              id="select-filter-pagamento"
              value={filterPagamento}
              onChange={(e) => setFilterPagamento(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none cursor-pointer"
            >
              <option value="TODOS">Todas as Formas</option>
              <option value="PIX">PIX</option>
              <option value="BOLETO">Boleto</option>
              <option value="CARTAO_CREDITO">Cartão de Crédito</option>
              <option value="TRANSFERENCIA">Transferência</option>
              <option value="DINHEIRO">Dinheiro</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-500">
              <Filter className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Doações */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Forma de Pagamento</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Data &amp; Hora</th>
                <th className="py-3 px-4">Operador Responsável</th>
                <th className="py-3 px-4">Alertas de Auditoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDoacoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Nenhuma doação encontrada para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredDoacoes.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">
                          {formatCurrency(d.valor)}
                        </span>
                        {d.valor >= 5000 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            ALTO VALOR
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-200 font-mono text-[11px]">
                        {d.formaPagamento}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          d.status === 'CONCLUIDA'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : d.status === 'PENDENTE'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            d.status === 'CONCLUIDA'
                              ? 'bg-emerald-400'
                              : d.status === 'PENDENTE'
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        />
                        {d.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {formatDate(d.dataHora)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {d.usuario ? (
                        <div>
                          <div className="text-slate-200 font-medium">{d.usuario.nome}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            @{d.usuario.login} ({d.usuario.role})
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">Sistema</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {d.alertas && d.alertas.length > 0 ? (
                        <div className="space-y-1">
                          {d.alertas.map((al) => (
                            <span
                              key={al.id}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                al.lido
                                  ? 'bg-slate-800 text-slate-400 line-through'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              <AlertTriangle className="h-3 w-3" />
                              {al.criticidade}: {al.titulo.substring(0, 30)}...
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500/50" />
                          Conforme
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro de Nova Doação */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Plus className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Registrar Nova Doação
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Valor */}
              <div className="space-y-1.5">
                <label
                  htmlFor="input-modal-valor"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Valor da Doação (R$) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                  </div>
                  <input
                    id="input-modal-valor"
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="Ex: 250.00"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* Botões Rápidos de Valor */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400">Valores rápidos:</span>
                {[50, 150, 500, 2000, 5500, 10000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValor(v.toFixed(2))}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all cursor-pointer ${
                      numValor === v
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    R$ {v}
                  </button>
                ))}
              </div>

              {/* Aviso dinâmico de Alerta do Backend */}
              {willTriggerAlert && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Gatilho de Segurança Ativo:</span>
                    <span>
                      Valores a partir de R$ 5.000,00 geram automaticamente um alerta de{' '}
                      <strong>ALTA CRITICIDADE</strong> na Central de Segurança.
                    </span>
                  </div>
                </div>
              )}

              {willTriggerPendingAlert && !willTriggerAlert && (
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Monitoramento de Pendência:</span>
                    <span>
                      Doações com status Pendente acima de R$ 1.000,00 geram alerta de média criticidade.
                    </span>
                  </div>
                </div>
              )}

              {/* Campo Forma de Pagamento */}
              <div className="space-y-1.5">
                <label
                  htmlFor="select-modal-forma"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Forma de Pagamento *
                </label>
                <select
                  id="select-modal-forma"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="PIX">PIX (Instantâneo)</option>
                  <option value="BOLETO">Boleto Bancário</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="TRANSFERENCIA">Transferência Bancária (TED/DOC)</option>
                  <option value="DINHEIRO">Dinheiro em Espécie</option>
                </select>
              </div>

              {/* Campo Status */}
              <div className="space-y-1.5">
                <label
                  htmlFor="select-modal-status"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Status da Operação *
                </label>
                <select
                  id="select-modal-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusDoacao)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="CONCLUIDA">Concluída (Recurso Confirmado)</option>
                  <option value="PENDENTE">Pendente (Aguardando Compensação)</option>
                  <option value="ESTORNADA">Estornada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>

              {/* Rodapé do Modal */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  id="btn-confirm-new-donation"
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Gravando no Prisma...' : 'Registrar Doação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
