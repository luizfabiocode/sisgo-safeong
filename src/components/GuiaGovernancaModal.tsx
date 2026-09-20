import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  HelpCircle,
  X,
  ShieldAlert,
  Users,
  History,
  Scale,
  UserCheck,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  Activity,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface GuiaGovernancaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'compliance' | 'rbac' | 'auditoria';

export const GuiaGovernancaModal: React.FC<GuiaGovernancaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('compliance');

  // Fechar com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Previne rolagem de fundo enquanto o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      id="modal-guia-governanca-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-guia-titulo"
    >
      <div
        id="modal-guia-governanca-container"
        className="w-full max-w-3xl max-h-[80vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Fixo do Modal: Título, Botão Fechar e Abas */}
        <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start justify-between px-6 py-4 sm:py-5">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#00A8FF]/10 text-[#00A8FF] border border-[#00A8FF]/20">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="modal-guia-titulo"
                    className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                  >
                    Guia do Usuário &amp; Protocolos de Governança SiSGO
                  </h2>
                  <span className="hidden sm:inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2EC4B6]/15 text-[#1b9a8f] dark:text-[#2EC4B6] border border-[#2EC4B6]/30">
                    SafeONG
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                  Diretrizes de Compliance Financeiro, Matriz RBAC e Auditoria Contínua
                </p>
              </div>
            </div>

            <button
              id="btn-fechar-modal-guia"
              type="button"
              onClick={onClose}
              aria-label="Fechar Guia de Governança"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Barra de Abas do Modal */}
          <div className="flex border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 gap-2 overflow-x-auto scrollbar-none">
            <button
              id="tab-guia-compliance"
              type="button"
              onClick={() => setActiveTab('compliance')}
              className={`flex items-center gap-2 py-3.5 px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'compliance'
                  ? 'border-[#00A8FF] text-[#00A8FF] font-semibold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Alertas &amp; Compliance Financeiro</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00A8FF]/15 text-[#008bd1] dark:text-[#00A8FF] border border-[#00A8FF]/30">
                Destaque
              </span>
            </button>

            <button
              id="tab-guia-rbac"
              type="button"
              onClick={() => setActiveTab('rbac')}
              className={`flex items-center gap-2 py-3.5 px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'rbac'
                  ? 'border-[#00A8FF] text-[#00A8FF] font-semibold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Níveis de Acesso (RBAC)</span>
            </button>

            <button
              id="tab-guia-auditoria"
              type="button"
              onClick={() => setActiveTab('auditoria')}
              className={`flex items-center gap-2 py-3.5 px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'auditoria'
                  ? 'border-[#00A8FF] text-[#00A8FF] font-semibold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Logs &amp; Auditoria de Segurança</span>
            </button>
          </div>
        </div>

        {/* Conteúdo com Rolagem Interna */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* =========================================================================
              ABA 1: ALERTAS & COMPLIANCE FINANCEIRO (DESTAQUE PRINCIPAL)
             ========================================================================= */}
          {activeTab === 'compliance' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Box de Destaque da Regra de R$ 5.000,00 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-200">
                      Gatilho Automático de Pendência: Doações &ge; R$ 5.000,00
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-amber-100/90 mt-1 leading-relaxed">
                      No SiSGO, toda doação lançada com valor <strong>igual ou superior a R$ 5.000,00</strong> gera
                      automaticamente um alerta preventivo no painel de segurança. A transação é registrada
                      como <strong>Pendente de Homologação</strong> e demanda ação humana e análise manual
                      exclusiva do setor <strong>Financeiro</strong> ou <strong>Administrador (ADM)</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Os 4 Pilares de Compliance */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Scale className="h-4 w-4 text-[#00A8FF]" />
                  Por que essa exigência é mandatória no Terceiro Setor?
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pilar 1: PLD */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                      <div className="p-1.5 rounded-lg bg-indigo-500/15">
                        <Scale className="h-4 w-4" />
                      </div>
                      <h5 className="text-slate-900 dark:text-white">Prevenção à Lavagem de Dinheiro (PLD)</h5>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Atende às exigências regulatórias nacionais (COAF / Receita Federal) e padrões internacionais de compliance.
                      Evita que organizações do terceiro setor sejam instrumentalizadas para ocultação, dissimulação ou
                      fracionamento de capitais de origem ilícita.
                    </p>
                  </div>

                  {/* Pilar 2: KYC */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2.5 text-[#00A8FF] font-bold text-sm">
                      <div className="p-1.5 rounded-lg bg-[#00A8FF]/15">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <h5 className="text-slate-900 dark:text-white">Identificação do Doador (KYC)</h5>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Protocolo de <em>Know Your Customer</em> para verificar a identidade civil (CPF) ou jurídica (CNPJ)
                      do benfeitor. Assegura a idoneidade do doador de grande porte antes da emissão de certidões e
                      alocação nos projetos sociais da ONG.
                    </p>
                  </div>

                  {/* Pilar 3: Recibos */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2.5 text-[#2EC4B6] font-bold text-sm">
                      <div className="p-1.5 rounded-lg bg-[#2EC4B6]/15">
                        <FileCheck className="h-4 w-4" />
                      </div>
                      <h5 className="text-slate-900 dark:text-white">Emissão de Recibos &amp; Prestação de Contas</h5>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Garante documentação contábil rigorosa, emissão de recibo timbrado oficial e vinculação direta aos
                      centros de custo. Facilita auditorias externas independentes e prestação pública de contas aos
                      conselhos fiscalizadores.
                    </p>
                  </div>

                  {/* Pilar 4: Chargeback */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2.5 text-rose-500 font-bold text-sm">
                      <div className="p-1.5 rounded-lg bg-rose-500/15">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <h5 className="text-slate-900 dark:text-white">Prevenção a Fraudes &amp; Chargeback</h5>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Protege a instituição contra fraudes de cartões clonados ou transações contestadas (evitando taxas
                      bancárias pesadas de estorno) e previne contra erros materiais de digitação humana no momento do
                      cadastro.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fluxo do Botão 'Marcar como Tratado' */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#2EC4B6]" />
                    Fluxo do Botão &quot;Marcar como Tratado&quot;
                  </h4>
                  <span className="text-[11px] font-semibold text-[#2EC4B6] px-2 py-0.5 rounded bg-[#2EC4B6]/10 border border-[#2EC4B6]/25">
                    Auditoria Humana Registrada
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/70">
                    <span className="font-bold text-[#00A8FF] block mb-1">1. Gatilho Ativado</span>
                    <p className="text-slate-600 dark:text-slate-300">
                      Doação &ge; R$ 5.000,00 entra na fila de pendência com contador de alerta.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/70">
                    <span className="font-bold text-indigo-500 dark:text-indigo-400 block mb-1">2. Análise Manual</span>
                    <p className="text-slate-600 dark:text-slate-300">
                      Financeiro ou ADM checa extrato bancário, comprovante e cadastro do doador.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/70">
                    <span className="font-bold text-[#2EC4B6] block mb-1">3. Ação &quot;Tratado&quot;</span>
                    <p className="text-slate-600 dark:text-slate-300">
                      O gestor clica no botão, remove a pendência visual e homologa o lançamento.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/70">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">4. Log no SQLite</span>
                    <p className="text-slate-600 dark:text-slate-300">
                      O SiSGO grava na tabela <code className="font-mono text-[11px] text-[#00A8FF]">LogSistema</code> o
                      usuário, IP, data/hora e justificativa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              ABA 2: NÍVEIS DE ACESSO (RBAC)
             ========================================================================= */}
          {activeTab === 'rbac' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#00A8FF]" />
                  Controle de Acesso Baseado em Funções (RBAC - Role-Based Access Control)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  O SiSGO adota o princípio do menor privilégio (PoLP). Cada colaborador acessa unicamente as funções
                  indispensáveis para a execução de suas atividades institucionais.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Papel: Administrador */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-2 border-indigo-500/30 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                        ADM
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Nível 1</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Administrador</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Acesso Total &amp; Governança Geral</p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>Gestão total de usuários (criar, resetar senha, ativar/inativar).</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>Acesso integral à trilha de auditoria e logs do sistema (<code className="font-mono text-[10px]">LogSistema</code>).</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>Tratamento de alertas de segurança e compliance de qualquer valor.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>Exclusão autorizada de doações com log obrigatório de motivo.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-indigo-600 dark:text-indigo-300 font-medium">
                    Acesso a todas as telas do sistema
                  </div>
                </div>

                {/* Papel: Financeiro */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-2 border-[#2EC4B6]/30 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#2EC4B6]/15 text-[#1a9a8f] dark:text-[#2EC4B6] border border-[#2EC4B6]/30">
                        Financeiro
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Nível 2</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Financeiro</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Validação &amp; Prestação de Contas</p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#2EC4B6] shrink-0 mt-0.5" />
                        <span>Validação, análise e tratamento de alertas de doações &ge; R$ 5.000,00.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#2EC4B6] shrink-0 mt-0.5" />
                        <span>Lançamento e edição de doações financeiras e recibos.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#2EC4B6] shrink-0 mt-0.5" />
                        <span>Acompanhamento do Dashboard e métricas de arrecadação.</span>
                      </li>
                      <li className="flex items-start gap-1.5 text-slate-400 dark:text-slate-400">
                        <X className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>Sem permissão para gerenciar usuários ou deletar registros.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-[#1a9a8f] dark:text-[#2EC4B6] font-medium">
                    Telas: Dashboard, Doações e Alertas
                  </div>
                </div>

                {/* Papel: Atendente */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-2 border-[#00A8FF]/30 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#00A8FF]/15 text-[#0082c7] dark:text-[#00A8FF] border border-[#00A8FF]/30">
                        Atendente
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Nível 3</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Atendente</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Operação &amp; Lançamentos Rápidos</p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#00A8FF] shrink-0 mt-0.5" />
                        <span>Cadastro ágil de novas doações recebidas de apoiadores.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#00A8FF] shrink-0 mt-0.5" />
                        <span>Visualização dos painéis informativos básicos e histórico.</span>
                      </li>
                      <li className="flex items-start gap-1.5 text-slate-400 dark:text-slate-400">
                        <X className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>Sem permissão para tratar ou homologar alertas de compliance.</span>
                      </li>
                      <li className="flex items-start gap-1.5 text-slate-400 dark:text-slate-400">
                        <X className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>Sem acesso a usuários, logs de auditoria ou exclusões.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-[#0082c7] dark:text-[#00A8FF] font-medium">
                    Telas: Dashboard e Doações
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              ABA 3: LOGS & AUDITORIA DE SEGURANÇA
             ========================================================================= */}
          {activeTab === 'auditoria' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-[#00A8FF]" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Tabela de Auditoria Imutável (<code className="font-mono text-xs text-[#00A8FF]">LogSistema</code>)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  O SiSGO rastreia em tempo real todas as atividades dos colaboradores no banco de dados SQLite.
                  Cada registro armazena: <strong>Endereço IP de origem</strong>, <strong>Identificador do Usuário</strong>,
                  <strong>Papel no Sistema</strong>, <strong>Tipo da Operação</strong>, <strong>Carimbo Temporal Exato</strong> e
                  <strong>Detalhes Técnicos da Ação</strong>.
                </p>
              </div>

              {/* Classificação por Níveis de Risco */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#00A8FF]" />
                  Matriz de Classificação de Risco Operacional
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Risco Baixo */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#2EC4B6]/15 text-[#199d91] dark:text-[#2EC4B6] border border-[#2EC4B6]/30">
                        Risco Baixo
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Operações Rotineiras</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Logins efetuados com sucesso, visualização de painéis, pesquisas normais e consultas de rotina.
                    </p>
                  </div>

                  {/* Risco Médio */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#00A8FF]/15 text-[#0082c7] dark:text-[#00A8FF] border border-[#00A8FF]/30">
                        Risco Médio
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Transações &amp; Edições</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Inclusão de doações padrão (&lt; R$ 5.000,00), atualização de dados de doadores e edições cadastrais.
                    </p>
                  </div>

                  {/* Risco Alto */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        Risco Alto
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Alertas &amp; Compliance</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Lançamento de doação &ge; R$ 5.000,00, tratamento de pendências financeiras e alterações de senhas.
                    </p>
                  </div>

                  {/* Risco Crítico */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        Risco Crítico
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Exclusões &amp; Segurança</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Exclusão de registros de doação, tentativas de acesso a áreas restritas (RBAC bypass) e falhas repetidas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Princípio de Transparência Institucional */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-950 dark:text-indigo-200">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200">
                      Garantia de Não-Repúdio e Conformidade Contínua
                    </span>
                    <p className="text-slate-700 dark:text-indigo-200/90 leading-relaxed">
                      Nenhuma ação que envolva valores, homologação ou alteração de permissões pode ser executada de
                      forma anônima. A rastreabilidade por IP e carimbo UTC confere validade probatória perante auditorias
                      externas, Ministério Público e órgãos reguladores de ONGs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal com Botões de Ação */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Info className="h-4 w-4 text-[#00A8FF]" />
            <span className="hidden sm:inline">Para mais dúvidas, contate o setor de Compliance / ADM.</span>
            <span className="sm:hidden">SiSGO SafeONG v1.0</span>
          </div>

          <button
            id="btn-concluir-guia-modal"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#00A8FF] hover:bg-[#0093e0] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Entendido / Fechar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
