import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

export async function seedInitialData(): Promise<void> {
  try {
    const userCount = await prisma.usuario.count();
    if (userCount > 0) {
      return;
    }

    console.log('🌱 Inicializando dados padrão do SiSGO (SafeONG)...');

    const salt = await bcrypt.genSalt(10);
    const senhaHashAdmin = await bcrypt.hash('Admin@123', salt);
    const senhaHashFinan = await bcrypt.hash('Finan@123', salt);
    const senhaHashAtend = await bcrypt.hash('Atend@123', salt);

    // 1. Criar Usuários padrão
    const admin = await prisma.usuario.create({
      data: {
        nome: 'Administrador do Sistema',
        login: 'admin',
        senhaHash: senhaHashAdmin,
        role: 'ADM',
        status: 'ATIVO',
      },
    });

    const financeiro = await prisma.usuario.create({
      data: {
        nome: 'Coordenador Financeiro',
        login: 'financeiro',
        senhaHash: senhaHashFinan,
        role: 'Financeiro',
        status: 'ATIVO',
      },
    });

    const atendente = await prisma.usuario.create({
      data: {
        nome: 'Atendente de Captação',
        login: 'atendente',
        senhaHash: senhaHashAtend,
        role: 'Atendente',
        status: 'ATIVO',
      },
    });

    // 2. Criar Doações iniciais
    await prisma.doacao.create({
      data: {
        valor: 250.0,
        formaPagamento: 'PIX',
        status: 'CONCLUIDA',
        usuarioId: atendente.id,
      },
    });

    await prisma.doacao.create({
      data: {
        valor: 1500.0,
        formaPagamento: 'TRANSFERENCIA',
        status: 'CONCLUIDA',
        usuarioId: financeiro.id,
      },
    });

    const doacaoSuspeita = await prisma.doacao.create({
      data: {
        valor: 7500.0,
        formaPagamento: 'CARTAO_CREDITO',
        status: 'PENDENTE',
        usuarioId: atendente.id,
      },
    });

    // 3. Criar Alertas operacionais
    await prisma.alerta.create({
      data: {
        titulo: 'Transação Suspeita/Alto Valor: R$ 7500.00 (CARTAO_CREDITO)',
        criticidade: 'ALTA',
        lido: false,
        doacaoId: doacaoSuspeita.id,
      },
    });

    await prisma.alerta.create({
      data: {
        titulo: 'Doação Pendente sob monitoramento: R$ 7500.00',
        criticidade: 'MEDIA',
        lido: false,
        doacaoId: doacaoSuspeita.id,
      },
    });

    // 4. Criar Logs de Auditoria
    await prisma.logSistema.createMany({
      data: [
        {
          usuarioId: admin.id,
          acao: 'SISTEMA_INICIALIZADO: Banco de dados SQLite criado e migrado',
          ip: '127.0.0.1',
          userAgent: 'SiSGO System Bootstrap',
          risco: 'BAIXO',
        },
        {
          usuarioId: atendente.id,
          acao: 'CADASTRO_DOACAO: R$ 7500.00 (CARTAO_CREDITO) - status: PENDENTE',
          ip: '192.168.1.45',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          risco: 'MEDIO',
        },
      ],
    });

    console.log('✅ Dados padrão do SiSGO criados com sucesso.');
    console.log('   Usuário ADM: login "admin", senha "Admin@123"');
    console.log('   Usuário Financeiro: login "financeiro", senha "Finan@123"');
    console.log('   Usuário Atendente: login "atendente", senha "Atend@123"');
  } catch (error) {
    console.error('Erro ao executar seed inicial:', error);
  }
}
