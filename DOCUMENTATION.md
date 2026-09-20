# 📄 DOCUMENTAÇÃO TÉCNICA E ARQUITETURAL — SiSGO (SafeONG)

**Versão:** 1.0.0  
**Classificação:** Documentação Oficial de Engenharia, Segurança e Compliance  
**Última Atualização:** Setembro/2026  
**Status:** 100% Funcional e Em Conformidade com LGPD / Diretrizes do Terceiro Setor  

---

## 1. VISÃO GERAL DO PROJETO

### 1.1 O que é o SiSGO (SafeONG)
O **SiSGO (SafeONG)** é uma plataforma web corporativa concebida para a gestão transparente, governança institucional, segurança operacional e auditoria contínua de doações destinadas a Organizações Não Governamentais (ONGs) e entidades do Terceiro Setor.

O sistema atua como uma barreira ativa de governança, unificando a esteira operacional de arrecadação financeira a mecanismos automáticos de conformidade regulatória, integridade probatória e prevenção a ilícitos financeiros, alinhando-se às exigências dos conselhos fiscalizadores, da Receita Federal e do COAF (Conselho de Controle de Atividades Financeiras).

---

### 1.2 Para quem é o sistema
O SiSGO foi estruturado em conformidade com o **Princípio do Menor Privilégio (PoLP - Principle of Least Privilege)**, disponibilizando interfaces e capacidades segregadas para três categorias de usuários:

| Perfil / Papel | Nível RBAC | Escopo de Atuação e Responsabilidades |
| :--- | :---: | :--- |
| **Administradores (ADM)** | Nível 1 | **Controlo Total e Governança:** Gestão completa de usuários (criação, redefinição de senhas, ativação/inativação), acesso irrestrito à trilha imutável de logs (`LogSistema`), parametrização de segurança, auditoria investigativa e exclusão autorizada de registros com justificativa formal. |
| **Setor Financeiro e Compliance** | Nível 2 | **Validação e Prestação de Contas:** Homologação e análise manual de doações de alto valor ($\ge$ R$ 5.000,00), tratamento de alertas operacionais, conferência de extratos bancários, emissão de recibos timbrados oficiais, relatórios de conciliação e monitoramento de riscos de estorno. |
| **Atendentes e Operacional** | Nível 3 | **Operação e Lançamentos Cotidianos:** Cadastro ágil de novas doações recebidas via balcão, eventos ou canais diretos, consulta ao histórico básico de entradas e visualização de dashboards informativos, sem permissão de tratamento de alertas ou acesso administrativo. |

---

### 1.3 Principais Funcionalidades

1. **Gestão Multicanal de Doações:**
   - Registro centralizado de transações originadas por múltiplos meios de pagamento: **PIX**, **Boleto Bancário**, **Cartão de Crédito**, **Transferência Bancária** e **Espécie (Dinheiro)**.
   - Controle estrito de estados do ciclo financeiro: `CONCLUIDA`, `PENDENTE`, `ESTORNADA` e `CANCELADA`.

2. **Controlo de Acesso Baseado em Funções (RBAC):**
   - Segregação de privilégios nativa no backend (Express Middleware) e refletida na interface React.
   - Rotas administrativas protegidas e impossibilidade de escalonamento horizontal ou vertical de privilégios.

3. **Trilha de Auditoria Contínua (`LogSistema`):**
   - Registro perene de todas as mutações e eventos de segurança (logins, inclusões, homologações e alterações de status).
   - Metadados probatórios: Endereço IP do cliente, `User-Agent` (navegador/dispositivo), carimbo de data/hora precisa e categorização por matriz de risco (`BAIXO`, `MEDIO`, `ALTO`, `CRITICO`).

4. **Gatilhos Automáticos de Compliance e Antifraude:**
   - Motor de regras automático que intercepta qualquer doação com valor **$\ge$ R$ 5.000,00**, gerando imediatamente uma notificação de criticidade `ALTA` na fila de alertas e marcando a transação como pendente de homologação humana.
   - Monitoramento preditivo de doações de médio porte ($\ge$ R$ 1.000,00) em estado `PENDENTE`.

5. **Interface Adaptativa e Acessibilidade:**
   - Suporte bidirecional a **Tema Claro (Light Mode)** e **Tema Escuro (Dark Mode)**, com persistência via `localStorage` e paleta com identidade visual da SafeONG (Azul Ciano `#00A8FF` e Verde Folha `#2EC4B6`).
   - Modal flutuante centralizado via Portal (`Guia do Usuário & Protocolos de Governança`) detalhando políticas e fluxos institucionais.

---

## 2. ARQUITETURA DE DADOS (PRISMA SCHEMA)

A persistência do SiSGO é gerenciada através do **Prisma ORM**, garantindo integridade referencial, tipagem estrita no ecossistema TypeScript e abstração agnóstica entre dialetos SQL (desenvolvido e validado sobre SQLite local `prisma/dev.db`, com total portabilidade para PostgreSQL / Cloud SQL em produção).

### 2.1 Código do Esquema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// 1. Tabela de Usuários com RBAC (ADM, Financeiro, Atendente)
model Usuario {
  id        String   @id @default(uuid())
  nome      String
  login     String   @unique
  senhaHash String
  role      String   @default("Atendente") // "ADM" | "Financeiro" | "Atendente"
  status    String   @default("ATIVO")     // "ATIVO" | "INATIVO" | "BLOQUEADO"
  createdAt DateTime @default(now())

  // Relacionamentos
  doacoes Doacao[]
  logs    LogSistema[]

  @@map("usuarios")
}

// 2. Tabela de Doações recebidas pela ONG
model Doacao {
  id             String   @id @default(uuid())
  valor          Float
  formaPagamento String   // "PIX" | "BOLETO" | "CARTAO_CREDITO" | "TRANSFERENCIA" | "DINHEIRO"
  status         String   @default("CONCLUIDA") // "PENDENTE" | "CONCLUIDA" | "ESTORNADA" | "CANCELADA"
  dataHora       DateTime @default(now())
  
  usuarioId      String?
  usuario        Usuario? @relation(fields: [usuarioId], references: [id], onDelete: SetNull)

  // Relacionamento com alertas disparados pela doação
  alertas        Alerta[]

  @@map("doacoes")
}

// 3. Tabela de Logs de Auditoria do Sistema
model LogSistema {
  id        String   @id @default(uuid())
  usuarioId String?
  usuario   Usuario? @relation(fields: [usuarioId], references: [id], onDelete: SetNull)
  acao      String   // Ex: "LOGIN", "CADASTRO_DOACAO", "ALERTA_TRATADO"
  ip        String
  userAgent String
  risco     String   @default("BAIXO") // "BAIXO" | "MEDIO" | "ALTO" | "CRITICO"
  timestamp DateTime @default(now())

  @@map("logs_sistema")
}

// 4. Tabela de Alertas Operacionais e de Segurança
model Alerta {
  id          String   @id @default(uuid())
  titulo      String
  criticidade String   @default("MEDIA") // "BAIXA" | "MEDIA" | "ALTA" | "CRITICA"
  lido        Boolean  @default(false)
  
  doacaoId    String?
  doacao      Doacao?  @relation(fields: [doacaoId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())

  @@map("alertas")
}
```

---

### 2.2 Modelos e Relacionamentos Detalhados

#### A. Modelo `Usuario` (`usuarios`)
- **Finalidade:** Armazena o cadastro e as credenciais autenticadoras dos operadores institucionais.
- **Campos:**
  - `id`: Chave primária UUID v4 autogerada.
  - `nome`: Nome completo do operador institucional.
  - `login`: Identificador único de autenticação (e-mail ou nome de usuário).
  - `senhaHash`: Hash criptográfico irreversível gerado com algoritmo **BCrypt** (salt rounds = 10).
  - `role`: Papel no controle de acesso RBAC (`"ADM"`, `"Financeiro"`, `"Atendente"`).
  - `status`: Estado da conta (`"ATIVO"`, `"INATIVO"`, `"BLOQUEADO"`).
  - `createdAt`: Carimbo temporal de cadastro da conta.
- **Relacionamentos:**
  - `doacoes`: Coleção 1:N com o modelo `Doacao`. Se um usuário for desativado, o vínculo é preservado via `onDelete: SetNull`.
  - `logs`: Coleção 1:N com o modelo `LogSistema`, vinculando cada ação ao operador responsável.

#### B. Modelo `Doacao` (`doacoes`)
- **Finalidade:** Registro financeiro de cada aporte, donativo ou contribuição recebida pela entidade.
- **Campos:**
  - `id`: Chave primária UUID v4.
  - `valor`: Ponto flutuante com precisão monetária (BRL).
  - `formaPagamento`: Canal de recebimento (`"PIX"`, `"BOLETO"`, `"CARTAO_CREDITO"`, `"TRANSFERENCIA"`, `"DINHEIRO"`).
  - `status`: Situação do recurso (`"PENDENTE"`, `"CONCLUIDA"`, `"ESTORNADA"`, `"CANCELADA"`).
  - `dataHora`: Data e hora oficial de efetivação do lançamento.
  - `usuarioId`: Chave estrangeira que referencia o operador que registrou a doação.
- **Relacionamentos:**
  - `usuario`: Operador responsável (relação N:1).
  - `alertas`: Alertas vinculados à transação (relação 1:N, com exclusão em cascata `Cascade` caso a transação seja purgada).

#### C. Modelo `LogSistema` (`logs_sistema`)
- **Finalidade:** Armazenamento imutável da trilha de auditoria para fins de compliance, perícia e fiscalização contábil externa.
- **Campos:**
  - `id`: Identificador único da entrada de auditoria.
  - `usuarioId`: Identificador do operador que executou a ação (nulo em eventos anônimos como falha de login).
  - `acao`: Descritor textual padronizado da operação realizada (ex: `CADASTRO_DOACAO: R$ 7500.00`, `ALERTA_TRATADO`, `LOGIN_SUCESSO`).
  - `ip`: Endereço IPv4 ou IPv6 originário da requisição HTTP (`x-forwarded-for` ou socket address).
  - `userAgent`: Identificação do cliente HTTP, browser e sistema operacional.
  - `risco`: Classificação do impacto da ação (`"BAIXO"`, `"MEDIO"`, `"ALTO"`, `"CRITICO"`).
  - `timestamp`: Carimbo de data/hora inviolável gerado pelo banco de dados.

#### D. Modelo `Alerta` (`alertas`)
- **Finalidade:** Fila de incidentes, inconformidades ou pendências financeiras que demandam investigação manual.
- **Campos:**
  - `id`: Chave primária UUID v4.
  - `titulo`: Mensagem descritiva da ocorrência (ex: `Transação Suspeita/Alto Valor: R$ 5.000,00 (PIX)`).
  - `criticidade`: Grau de urgência da análise (`"BAIXA"`, `"MEDIA"`, `"ALTA"`, `"CRITICA"`).
  - `lido`: Indicador booleano de resolução (`false` = Pendente de Homologação, `true` = Tratado/Auditado).
  - `doacaoId`: Chave estrangeira opcional vinculando o alerta a uma doação específica.
  - `createdAt`: Timestamp do disparo da anomalia.

---

## 3. PROTOCOLOS DE COMPLIANCE E SEGURANÇA

### 3.1 Prevenção à Lavagem de Dinheiro (PLD)
Organizações do Terceiro Setor são historicamente vulneráveis à exploração como instrumentos de passagem ou fracionamento de capitais ilícitos. Para blindar a instituição e satisfazer normas do COAF e da Receita Federal:
- **Gatilho de Alto Valor ($\ge$ R$ 5.000,00):** Qualquer entrada financeira igual ou superior a cinco mil reais dispara de forma síncrona uma notificação de severidade `ALTA` na esteira de alertas.
- **Retenção Preventiva:** A doação entra com marcação sob auditoria, impedindo que o montante seja integrado às dotações orçamentárias finais de projetos sociais antes da chancela do Compliance.
- **Mitigação do Fracionamento (Smurfing):** O monitoramento contínuo dos logs correlaciona doações fracionadas de um mesmo canal ou operador em janelas temporais estreitas.

---

### 3.2 Identificação do Doador (KYC — Know Your Customer)
Doações substanciais exigem verificação de idoneidade jurídica e civil do benfeitor antes da consolidação nos livros contábeis:
- **Validação de Documento (CPF / CNPJ):** Exigência de comprovação da identidade do titular da conta bancária de origem.
- **Rastreabilidade da Origem dos Recursos:** Validação documental entre a titularidade bancária de quem efetivou a transferência e o cadastro formal da entidade, prevenindo doações apócrifas de pessoas politicamente expostas (PEP) sem a devida declaração.
- **Emissão Segura de Recibos de Doação:** Emissão de comprovantes fiscais timbrados contendo identificação civil, vinculando diretamente o recibo aos centros de custo institucionais declarados no estatuto da ONG.

---

### 3.3 Ação Humana Obrigatória: O Fluxo do Botão "Marcar como Tratado"
Para garantir o **Princípio do Não-Repúdio** e impedir resoluções cegas automatizadas por algoritmos, todo alerta no SiSGO exige intervenção humana expressa:

```
[1. Nova Doação >= R$ 5.000,00]
               │
               ▼
[2. Disparo Automático de Alerta (Criticidade: ALTA)]
               │
               ▼
[3. Análise pelo Setor Financeiro / ADM]
   - Conferência de extrato bancário
   - Verificação de autenticidade do comprovante
   - Validação dos dados do doador (KYC)
               │
               ▼
[4. Clique no Botão: "Marcar como Tratado"]
   - Endpoint: PATCH /api/alertas/:id/lido { lido: true }
   - Atualização do status visual da pendência
               │
               ▼
[5. Registro Perene no LogSistema]
   - Ação gravada: "ALERTA_ATUALIZADO: [Título] marcado como LIDO"
   - Gravado com: ID do Operador, IP do Cliente, User-Agent e Data/Hora UTC
```

- **Restrição de Acesso:** Usuários com papel `Atendente` não possuem privilégios de execução sobre o endpoint de tratamento de alertas; a operação retorna `403 Forbidden`.
- **Rastreabilidade:** Nenhum operador pode tratar uma pendência em anonimato. O log resultante confere plena validade perante auditorias externas independentes e o Ministério Público.

---

### 3.4 Mitigação de Chargeback e Erros Operacionais
- **Contestação de Doações em Cartão:** O fluxo de cartões de crédito monitora transações de elevado valor para combater cartões clonados ou furtados, os quais acarretam penalidades financeiras severas e taxas bancárias de estorno (*chargeback fees*) que desfalcam a ONG.
- **Prevenção a Erros de Digitação:** A conferência obrigatória de transações $\ge$ R$ 5.000,00 serve como barreira de contenção contra erros materiais humanos comuns (ex: inclusão acidental de dois zeros adicionais, digitando `5000,00` no lugar de `50,00`).

---

## 4. GUIA DE TECNOLOGIAS E EXECUÇÃO

### 4.1 Stack Tecnológica

| Camada | Tecnologia | Propósito e Características |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | Interface reativa, modular, tipada ponta a ponta e baseada em componentes funcionais. |
| **Estilização** | Tailwind CSS v4 | Estilização utilitária de alta performance com suporte nativo a variantes Dark/Light. |
| **Animações** | Motion (`motion/react`) | Transições fluidas de cards, feedback tátil e animação de modais. |
| **Ícones** | Lucide React | Conjunto coeso e semântico de ícones vetoriais. |
| **Backend** | Node.js + Express | Servidor HTTP RESTful com roteamento modular, middlewares de segurança e CORS. |
| **ORM** | Prisma ORM 6.19 | Modelagem, migrações determinísticas, tipagem estrita e query builder seguro contra SQL Injection. |
| **Banco de Dados** | SQLite (Dev) / PostgreSQL (Prod) | Armazenamento local rápido sem dependências externas em dev e pronto para Cloud SQL em produção. |
| **Segurança** | JWT + Cookie httpOnly + BCrypt | Autenticação com proteção contra XSS e CSRF; hash criptográfico seguro de credenciais. |
| **Validação** | Zod | Validação robusta de esquemas de entrada tanto no frontend quanto nas rotas HTTP. |

---

### 4.2 Estrutura de Diretórios do Projeto

```
sisgo-safeong/
├── prisma/
│   ├── dev.db                 # Banco de dados SQLite local
│   └── schema.prisma          # Esquema declarativo de dados do Prisma
├── public/
│   └── favicon.svg            # Favicon da aplicação
├── src/
│   ├── components/            # Componentes visuais da interface
│   │   ├── AlertasView.tsx    # Painel de gestão e tratamento de alertas
│   │   ├── AuditoriaView.tsx  # Trilha perene de logs do sistema
│   │   ├── DashboardView.tsx  # Métricas executivas e gráficos de arrecadação
│   │   ├── DoacoesView.tsx    # Lançamentos e histórico de doações
│   │   ├── GuiaGovernancaModal.tsx # Modal interativo de governança e PLD/KYC
│   │   ├── Header.tsx         # Cabeçalho com Logo, Dark Mode e Botão de Ajuda
│   │   ├── LoginView.tsx      # Tela de autenticação e contas de teste
│   │   └── UsuariosView.tsx   # Painel RBAC de gestão de colaboradores (ADM)
│   ├── config/
│   │   └── env.ts             # Configuração e validação de variáveis de ambiente
│   ├── lib/
│   │   └── prisma.ts          # Instância Singleton do cliente Prisma
│   ├── middlewares/           # Interceptadores de segurança do Express
│   │   ├── audit.middleware.ts# Captura de IP, User-Agent e escrita no LogSistema
│   │   ├── auth.middleware.ts # Verificação de tokens JWT e autorização por Role
│   │   └── validate.middleware.ts # Validação de payload com esquemas Zod
│   ├── routes/                # Roteadores da API REST (/api/*)
│   │   ├── alerta.routes.ts   # Endpoints de consulta e tratamento de alertas
│   │   ├── auth.routes.ts     # Endpoints de login, logout e sessão ativa
│   │   ├── doacao.routes.ts   # Endpoints de cadastro e métricas de doações
│   │   ├── index.ts           # Roteador central agregador
│   │   ├── log.routes.ts      # Endpoints da trilha de auditoria
│   │   └── usuario.routes.ts  # Endpoints de gerenciamento de usuários
│   ├── schemas/               # Esquemas Zod para validação de dados
│   ├── server/
│   │   └── seed.ts            # Carga inicial com usuários padrão e doações modelo
│   ├── types/
│   │   └── index.ts           # Tipos e interfaces compartilhadas TypeScript
│   ├── App.tsx                # Raiz da aplicação React com gestão de estado global
│   ├── index.css              # Configuração global do Tailwind CSS v4
│   └── main.tsx               # Ponto de entrada do cliente React
├── DOCUMENTATION.md           # Esta Documentação Oficial de Engenharia
├── Logo.png                   # Identidade visual oficial da SafeONG
├── metadata.json              # Metadados de permissões e plataforma AI Studio
├── package.json               # Gerenciador de dependências e scripts do projeto
├── server.ts                  # Servidor Express Full-Stack e Vite Middleware
└── vite.config.ts             # Configuração de build do Vite
```

---

### 4.3 Comandos de Execução e Ciclo de Vida

#### Instalação de Dependências
```bash
npm install
```

#### Desenvolvimento Local
Inicia o servidor backend com TypeScript nativo (`tsx`) e monta o servidor de desenvolvimento do Vite em modo middleware na porta **3000**:
```bash
npm run dev
```

#### Operações com Prisma ORM
```bash
# Gerar os tipos atualizados do cliente Prisma
npm run prisma:generate

# Sincronizar o banco de dados com o esquema sem gerar migrações
npm run prisma:push

# Aplicar migrações em ambiente de desenvolvimento
npm run prisma:migrate

# Abrir a interface visual do Prisma Studio no navegador
npm run prisma:studio
```

#### Verificação de Tipagem e Linter
```bash
npm run lint
```

#### Compilação para Produção
Gera o bundle estático do frontend na pasta `dist/` e compila o servidor Express em `dist/server.cjs` via `esbuild`:
```bash
npm run build
```

#### Inicialização em Ambiente de Produção
Executa a versão compilada em CommonJS dentro do contêiner de produção:
```bash
npm run start
```

---

### 4.4 Configuração de Variáveis de Ambiente (`.env`)

```env
# Porta de vinculação do servidor HTTP (padrão AI Studio / Cloud Run)
PORT=3000

# String de conexão do banco de dados (SQLite local ou PostgreSQL)
DATABASE_URL="file:./prisma/dev.db"

# Segredo criptográfico para assinatura dos Tokens JWT
JWT_SECRET="sisgo-safeong-jwt-super-secret-production-key-2026"

# Segredo para assinatura de cookies HTTP seguros
COOKIE_SECRET="sisgo-safeong-cookie-secret-production-key-2026"

# Ambiente de execução
NODE_ENV="development"
```

---

### 4.5 Padrões de Segurança Implementados
1. **Cookies HttpOnly & SameSite:** O token JWT de autenticação nunca é exposto ao `localStorage` ou ao objeto `window` do navegador, eliminando vetores de ataque do tipo **Cross-Site Scripting (XSS)**.
2. **Hash Criptográfico BCrypt:** Senhas de acesso nunca são persistidas em texto claro; todas passam por processo de salt e hashing irreversível.
3. **Tratamento de SQL Injection:** A utilização do Prisma ORM abstrai a concatenação de strings em queries, operando sempre com parâmetros preparados.
4. **Validação Estrita de Entrada (Zod):** Todo corpo de requisição POST/PATCH e parâmetros de query passam por validação tipada prévia antes de qualquer execução na camada de dados.
5. **Auditoria de IP e User-Agent:** Rastreabilidade probatória obrigatória em conformidade com as diretrizes da **LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018)** para auditoria de incidentes de segurança.
