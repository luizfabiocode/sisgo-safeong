# SiSGO (SafeONG) - Sistema Integrado de Gestão Segura para ONGs

O **SiSGO (SafeONG)** é uma plataforma completa e segura desenvolvida para atender às demandas de governança, conformidade e gestão financeira de Organizações Não Governamentais (ONGs). O sistema combina um backend robusto em Node.js com controle rigoroso de acesso baseado em papéis (RBAC), trilha de auditoria contínua e proteção de dados sensíveis, acompanhado de um frontend moderno e intuitivo para operadores, gestores financeiros e administradores.

---

## 🚀 Stack Tecnológica

O projeto foi construído utilizando tecnologias modernas no ecossistema TypeScript:

### **Backend & Infraestrutura**
- **Node.js & Express (TypeScript):** Servidor HTTP e API RESTful modularizada com separação de rotas, controladores e middlewares de segurança.
- **Prisma ORM:** Modelagem de dados, migrações automáticas, validação tipada em tempo de compilação e integração de banco de dados.
- **SQLite:** Banco de dados relacional leve e embutido (`prisma/dev.db`), ideal para desenvolvimento rápido e portabilidade sem necessidade de servidores externos.
- **Zod:** Validação e sanitização estrita de schemas para payloads de requisições e regras de negócio.
- **Bcrypt.js:** Criptografia com hash irreversível e salt seguro para armazenamento de senhas de usuários.
- **JSON Web Token (JWT) & Cookie-Parser:** Emissão e assinatura de tokens de autenticação com suporte a cabeçalho `Bearer` e cookies com flag `httpOnly`.

### **Frontend**
- **React 19:** Biblioteca declarativa para criação de interfaces dinâmicas, com componentes funcionais e hooks.
- **Vite:** Ferramenta de build de alta performance e middleware de desenvolvimento integrado ao Express.
- **Tailwind CSS v4:** Framework de estilização utilitária para design responsivo, elegante e com contraste visual refinado.
- **Lucide React:** Biblioteca de ícones vetoriais leves e acessíveis.
- **Motion:** Microinterações e transições fluidas entre telas e modais.

---

## 🛡️ Arquitetura e Mecanismos de Segurança

O SiSGO adota o princípio de **Defesa em Profundidade** (*Defense in Depth*) para garantir a integridade dos dados e impedir fraudes financeiras:

1. **Autenticação Dupla (Cookies httpOnly & Bearer Header):**
   - Na autenticação (`POST /api/auth/login`), um token JWT assinado é gerado com tempo de expiração configurável (`1d`).
   - O token é gravado em cookie assinado com atributos `httpOnly`, `sameSite: 'lax'` e `secure` (em produção), prevenindo ataques de *Cross-Site Scripting* (XSS).
   - O sistema também suporta envio do cabeçalho `Authorization: Bearer <token>` para compatibilidade e consumo direto via API.

2. **Criptografia de Senhas com Salt (Bcrypt):**
   - Senhas em texto puro nunca são salvas no banco. Toda verificação é feita comparando o hash via `bcrypt.compare`.

3. **Controle de Acesso Baseado em Funções (RBAC - Role-Based Access Control):**
   - Middleware `autorizarRole(['ADM', 'Financeiro', ...])` protege cada endpoint individualmente.
   - Operações sensíveis (como acesso aos logs de auditoria e alteração de status de operadores) são estritamente restritas a administradores (`ADM`).

4. **Validação de Entrada com Zod:**
   - Schemas rigorosos rejeitam parâmetros ausentes, tipos incorretos, valores numéricos negativos ou formas de pagamento não homologadas antes de atingirem a camada de persistência.

5. **Trilha Imutável de Auditoria (`LogSistema`):**
   - Cada login, tentativa de acesso, alteração de status e cadastro de doação é automaticamente registrado na tabela `LogSistema`, capturando carimbo de data/hora, ID do usuário, IP de origem, User-Agent e nível de criticidade.

6. **Detecção Automática de Risco e Alertas Financeiros:**
   - Regras de negócio integradas analisam doações em tempo real:
     - Doações $\ge$ R$ 5.000,00 disparam alertas automáticos com criticidade **ALTA**.
     - Doações pendentes com valores elevados geram notificações operacionais na tabela `Alerta` para revisão do setor financeiro.

---

## 🗄️ Mapeamento do Banco de Dados (Prisma Schema)

O esquema relacional é estruturado em 4 entidades centrais:

| Modelo | Descrição | Principais Campos |
| :--- | :--- | :--- |
| **`Usuario`** | Representa os operadores e membros da ONG. | `id`, `nome`, `login`, `senhaHash`, `role` (`ADM`, `Financeiro`, `Atendente`), `status` (`ATIVO`, `INATIVO`, `BLOQUEADO`), `createdAt` |
| **`Doacao`** | Registro financeiro das arrecadações recebidas. | `id`, `valor`, `formaPagamento` (`PIX`, `BOLETO`, `CARTAO_CREDITO`, `TRANSFERENCIA`, `DINHEIRO`), `status` (`PENDENTE`, `CONCLUIDA`, `ESTORNADA`, `CANCELADA`), `dataHora`, `usuarioId` |
| **`LogSistema`** | Histórico imutável de eventos e segurança para auditoria. | `id`, `usuarioId`, `acao`, `ip`, `userAgent`, `risco` (`BAIXO`, `MEDIO`, `ALTO`, `CRITICO`), `timestamp` |
| **`Alerta`** | Notificações operacionais e avisos de segurança/conformidade. | `id`, `titulo`, `criticidade` (`BAIXA`, `MEDIA`, `ALTA`, `CRITICA`), `lido`, `doacaoId`, `createdAt` |

---

## 👥 Contas de Teste Pré-cadastradas (Seed)

O sistema conta com rotina automática de inicialização (`seed`) que gera 3 perfis para testes imediatos das permissões de RBAC:

| Perfil / Função | Login | Senha | Nível de Acesso no Sistema |
| :--- | :--- | :--- | :--- |
| **Administrador (ADM)** | `admin` | `Admin@123` | **Acesso Total:** Dashboard, Doações, Central de Alertas, Trilha de Auditoria (`LogSistema`) e Gestão de Operadores. |
| **Coordenador Financeiro** | `financeiro` | `Finan@123` | **Acesso Financeiro:** Dashboard gerencial, KPIs de arrecadação, cadastro de doações e monitoramento de alertas. |
| **Atendente de Captação** | `atendente` | `Atend@123` | **Acesso Operacional:** Registro rápido de doações, visualização da listagem de doações e acompanhamento básico. |

> *Dica: Na tela de Login do aplicativo há botões de "Preenchimento Rápido" para alternar entre os usuários com um único clique.*

---

## 💻 Passo a Passo para Execução Local

Siga as instruções abaixo para clonar, configurar e executar a aplicação em seu ambiente local:

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/sisgo-safeong.git
cd sisgo-safeong
```

### 2. Instalar as dependências do projeto
```bash
npm install
```

### 3. Configurar as variáveis de ambiente
Copie o arquivo de exemplo para criar o seu arquivo `.env`:
```bash
cp .env.example .env
```
*(As configurações padrão do `.env.example` já vêm preparadas para execução local com SQLite)*.

### 4. Sincronizar o banco de dados SQLite com o Prisma
Execute o comando para criar o arquivo do banco de dados (`prisma/dev.db`) e aplicar os modelos:
```bash
npx prisma db push
```

### 5. Iniciar o servidor de desenvolvimento
Inicie a aplicação completa (Backend Express + Frontend Vite):
```bash
npm run dev
```

Abra seu navegador e acesse:
```
http://localhost:3000
```

---

## 🛠️ Comandos Úteis do Projeto

| Comando | Função |
| :--- | :--- |
| `npm run dev` | Inicia o servidor Node.js com Vite e hot-reload via `tsx`. |
| `npx prisma db push` | Sincroniza o arquivo `schema.prisma` diretamente com o banco SQLite. |
| `npx prisma studio` | Abre a interface visual do Prisma Studio no navegador para inspecionar registros. |
| `npm run lint` | Executa a verificação estática de tipos TypeScript (`tsc --noEmit`). |
| `npm run build` | Gera o build de produção do frontend e empacota o backend com `esbuild`. |
| `npm run start` | Executa o bundle de produção compilado em `dist/server.cjs`. |

---

## 📄 Licença
Projeto desenvolvido para fins educacionais e de governança para organizações sem fins lucrativos sob a licença MIT.
