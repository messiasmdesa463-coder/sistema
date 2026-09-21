import { Company, User, Product, StockMovement, Ticket } from './types';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 1,
    razao_social: 'TechStore Soluções em Tecnologia LTDA',
    nome_fantasia: 'TechStore Brasil',
    cnpj: '12.345.678/0001-90',
    email: 'contato@techstore.com.br',
    telefone: '(11) 3456-7890',
    endereco: 'Av. Paulista, 1000, Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    status: 'aprovada',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
    cor_tema: '#2563eb',
    created_at: '2026-01-15 09:30:00',
    updated_at: '2026-03-10 14:22:00'
  },
  {
    id: 2,
    razao_social: 'Mercado & Conveniência Estrela Real LTDA',
    nome_fantasia: 'Super Estrela Express',
    cnpj: '23.456.789/0001-01',
    email: 'financeiro@estrela.com.br',
    telefone: '(21) 2234-5678',
    endereco: 'Rua das Flores, 450, Centro',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    status: 'aprovada',
    cor_tema: '#16a34a',
    created_at: '2026-02-01 11:15:00'
  },
  {
    id: 3,
    razao_social: 'Distribuidora Nacional de Peças S/A',
    nome_fantasia: 'Nacional Auto Peças',
    cnpj: '98.765.432/0001-11',
    email: 'marcos@nacionalpecas.com.br',
    telefone: '(31) 98765-4321',
    endereco: 'Av. Amazonas, 2500',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    status: 'pendente', // Testar aprovação do admin!
    created_at: '2026-09-18 16:45:00'
  },
  {
    id: 4,
    razao_social: 'Logística Expresso Brasil EIRELI',
    nome_fantasia: 'Expresso Brasil Cargas',
    cnpj: '45.678.901/0001-22',
    email: 'operacoes@expressobr.com.br',
    telefone: '(41) 3322-1100',
    endereco: 'Rodovia BR-116, km 98',
    cidade: 'Curitiba',
    estado: 'PR',
    status: 'suspensa',
    created_at: '2025-11-20 10:00:00'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    empresa_id: null,
    nome: 'Super Administrador SaaS',
    email: 'admin@saas.com.br',
    perfil: 'admin',
    cargo: 'Diretor de Plataforma',
    departamento: 'Gestão SaaS Global',
    ativo: true,
    ultimo_acesso: '2026-09-20 14:10:00',
    created_at: '2025-01-01 00:00:00'
  },
  {
    id: 2,
    empresa_id: 1,
    nome: 'Carlos Eduardo Andrade',
    email: 'carlos@techstore.com.br',
    cnpj: '12.345.678/0001-90',
    perfil: 'dono',
    cargo: 'Sócio Proprietário',
    departamento: 'Diretoria Executiva',
    ativo: true,
    ultimo_acesso: '2026-09-20 15:02:00',
    created_at: '2026-01-15 09:30:00'
  },
  {
    id: 3,
    empresa_id: 1,
    nome: 'Mariana Silva Santos',
    email: 'mariana@techstore.com.br',
    perfil: 'gerente',
    cargo: 'Gerente Geral de Operações',
    departamento: 'Operações e Estoque',
    ativo: true,
    ultimo_acesso: '2026-09-20 11:20:00',
    created_at: '2026-01-20 10:00:00'
  },
  {
    id: 4,
    empresa_id: 1,
    nome: 'Roberto Almeida',
    email: 'roberto@techstore.com.br',
    perfil: 'funcionario',
    cargo: 'Assistente de Estoque',
    departamento: 'Logística',
    ativo: true,
    ultimo_acesso: '2026-09-19 18:30:00',
    created_at: '2026-02-01 08:00:00'
  },
  {
    id: 5,
    empresa_id: 1,
    nome: 'Beatriz Souza',
    email: 'beatriz@techstore.com.br',
    perfil: 'funcionario',
    cargo: 'Atendente de Suporte',
    departamento: 'Atendimento',
    ativo: true,
    ultimo_acesso: '2026-09-20 13:45:00',
    created_at: '2026-03-05 09:00:00'
  },
  {
    id: 6,
    empresa_id: 3,
    nome: 'Marcos Vinicius Ribeiro',
    email: 'marcos@nacionalpecas.com.br',
    cnpj: '98.765.432/0001-11',
    perfil: 'dono',
    cargo: 'Diretor Geral',
    departamento: 'Diretoria',
    ativo: true,
    created_at: '2026-09-18 16:45:00'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    empresa_id: 1,
    nome: 'Notebook Ultra Core i7 16GB 512GB SSD',
    sku: 'NOTE-I7-16G',
    codigo_barras: '7891234567890',
    categoria: 'Informática',
    preco_custo: 2450.00,
    preco_venda: 4290.00,
    estoque_atual: 14,
    estoque_minimo: 5,
    unidade_medida: 'UN',
    localizacao: 'Corredor A - Prateleira 2',
    ativo: true,
    created_at: '2026-01-20 10:00:00'
  },
  {
    id: 2,
    empresa_id: 1,
    nome: 'Monitor Gamer Curvo 27" 165Hz IPS 1ms',
    sku: 'MON-27-165HZ',
    codigo_barras: '7891234567891',
    categoria: 'Monitores',
    preco_custo: 780.00,
    preco_venda: 1390.00,
    estoque_atual: 3, // ESTOQUE CRÍTICO
    estoque_minimo: 8,
    unidade_medida: 'UN',
    localizacao: 'Corredor B - Prateleira 1',
    ativo: true,
    created_at: '2026-01-22 14:00:00'
  },
  {
    id: 3,
    empresa_id: 1,
    nome: 'Teclado Mecânico RGB Switch Blue ABNT2',
    sku: 'TEC-MEC-RGB',
    codigo_barras: '7891234567892',
    categoria: 'Periféricos',
    preco_custo: 95.00,
    preco_venda: 249.00,
    estoque_atual: 42,
    estoque_minimo: 10,
    unidade_medida: 'UN',
    localizacao: 'Gaveteiro 04',
    ativo: true,
    created_at: '2026-02-05 09:30:00'
  },
  {
    id: 4,
    empresa_id: 1,
    nome: 'Mouse Ergonômico Wireless 2.4GHz 4000 DPI',
    sku: 'MOU-ERG-WL',
    codigo_barras: '7891234567893',
    categoria: 'Periféricos',
    preco_custo: 48.00,
    preco_venda: 129.90,
    estoque_atual: 0, // ESGOTADO
    estoque_minimo: 10,
    unidade_medida: 'UN',
    localizacao: 'Gaveteiro 06',
    ativo: true,
    created_at: '2026-02-10 11:00:00'
  },
  {
    id: 5,
    empresa_id: 1,
    nome: 'SSD NVMe M.2 1TB Gen4x4 5000MB/s',
    sku: 'SSD-1TB-NVME',
    codigo_barras: '7891234567894',
    categoria: 'Armazenamento',
    preco_custo: 185.00,
    preco_venda: 399.00,
    estoque_atual: 5, // NO LIMITE MÍNIMO
    estoque_minimo: 8,
    unidade_medida: 'UN',
    localizacao: 'Armário Seguro 01',
    ativo: true,
    created_at: '2026-02-15 15:20:00'
  },
  {
    id: 6,
    empresa_id: 1,
    nome: 'Cabo HDMI 2.1 Ultra High Speed 8K 3 Metros',
    sku: 'CAB-HDMI-3M',
    codigo_barras: '7891234567895',
    categoria: 'Cabos e Conectores',
    preco_custo: 16.50,
    preco_venda: 49.90,
    estoque_atual: 68,
    estoque_minimo: 20,
    unidade_medida: 'UN',
    localizacao: 'Caixa de Cabos C-12',
    ativo: true,
    created_at: '2026-03-01 08:45:00'
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 1,
    empresa_id: 1,
    produto_id: 1,
    produto_nome: 'Notebook Ultra Core i7 16GB 512GB SSD',
    produto_sku: 'NOTE-I7-16G',
    tipo: 'entrada',
    quantidade: 20,
    saldo_anterior: 0,
    saldo_posterior: 20,
    motivo: 'Compra de Lote Inicial - NF-e 45981 Fornecedor Dell Brasil',
    documento_ref: 'NF-45981',
    usuario_id: 2,
    usuario_nome: 'Carlos Eduardo Andrade',
    valor_unitario: 2450.00,
    created_at: '2026-09-01 10:30:00'
  },
  {
    id: 2,
    empresa_id: 1,
    produto_id: 1,
    produto_nome: 'Notebook Ultra Core i7 16GB 512GB SSD',
    produto_sku: 'NOTE-I7-16G',
    tipo: 'saida',
    quantidade: 6,
    saldo_anterior: 20,
    saldo_posterior: 14,
    motivo: 'Venda corporativa Pedido #10842 Cliente Escritório Central',
    documento_ref: 'PED-10842',
    usuario_id: 3,
    usuario_nome: 'Mariana Silva Santos',
    valor_unitario: 4290.00,
    created_at: '2026-09-12 14:15:00'
  },
  {
    id: 3,
    empresa_id: 1,
    produto_id: 2,
    produto_nome: 'Monitor Gamer Curvo 27" 165Hz IPS 1ms',
    produto_sku: 'MON-27-165HZ',
    tipo: 'saida',
    quantidade: 5,
    saldo_anterior: 8,
    saldo_posterior: 3,
    motivo: 'Saída balcão e e-commerce Pedido #10910',
    documento_ref: 'PED-10910',
    usuario_id: 4,
    usuario_nome: 'Roberto Almeida',
    valor_unitario: 1390.00,
    created_at: '2026-09-18 16:40:00'
  },
  {
    id: 4,
    empresa_id: 1,
    produto_id: 4,
    produto_nome: 'Mouse Ergonômico Wireless 2.4GHz 4000 DPI',
    produto_sku: 'MOU-ERG-WL',
    tipo: 'ajuste',
    quantidade: 4,
    saldo_anterior: 4,
    saldo_posterior: 0,
    motivo: 'Inventário físico - 4 unidades com defeito encaminhadas à garantia',
    documento_ref: 'RMA-9923',
    usuario_id: 3,
    usuario_nome: 'Mariana Silva Santos',
    created_at: '2026-09-19 11:10:00'
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 1,
    empresa_id: 1,
    empresa_nome: 'TechStore Brasil',
    usuario_id: 2,
    usuario_nome: 'Carlos Eduardo Andrade',
    titulo: 'Como integrar a emissão automática de NF-e via API no SaaS?',
    categoria: 'suporte',
    prioridade: 'alta',
    status: 'em_atendimento',
    descricao: 'Gostaria de saber como vincular a saída dos produtos do estoque diretamente com o certificado digital A1 da empresa para gerar o XML e DANFE automaticamente.',
    created_at: '2026-09-18 09:20:00',
    updated_at: '2026-09-18 14:30:00',
    mensagens: [
      {
        id: 1,
        ticket_id: 1,
        usuario_id: 2,
        usuario_nome: 'Carlos Eduardo Andrade',
        usuario_perfil: 'dono',
        mensagem: 'Gostaria de saber como vincular a saída dos produtos do estoque diretamente com o certificado digital A1 da empresa.',
        created_at: '2026-09-18 09:20:00'
      },
      {
        id: 2,
        ticket_id: 1,
        usuario_id: 1,
        usuario_nome: 'Super Administrador SaaS',
        usuario_perfil: 'admin',
        mensagem: 'Olá Carlos! O módulo fiscal está disponível nas configurações avançadas da empresa. Você pode enviar seu arquivo .pfx e configurar a numeração de série.',
        created_at: '2026-09-18 14:30:00'
      }
    ]
  },
  {
    id: 2,
    empresa_id: 1,
    empresa_nome: 'TechStore Brasil',
    usuario_id: 3,
    usuario_nome: 'Mariana Silva Santos',
    titulo: 'Solicitação de permissão de inventário para equipe de expedição',
    categoria: 'duvida',
    prioridade: 'media',
    status: 'aberto',
    descricao: 'Precisamos cadastrar mais 2 operadores de estoque para realizar a contagem física quinzenal com leitor de código de barras.',
    created_at: '2026-09-20 10:15:00',
    updated_at: '2026-09-20 10:15:00',
    mensagens: [
      {
        id: 3,
        ticket_id: 2,
        usuario_id: 3,
        usuario_nome: 'Mariana Silva Santos',
        usuario_perfil: 'gerente',
        mensagem: 'Precisamos cadastrar mais 2 operadores de estoque para realizar a contagem física quinzenal com leitor de código de barras.',
        created_at: '2026-09-20 10:15:00'
      }
    ]
  }
];

export const MOCK_COMPANIES = INITIAL_COMPANIES;
export const MOCK_USERS = INITIAL_USERS;
export const MOCK_PRODUCTS = INITIAL_PRODUCTS;
export const MOCK_MOVEMENTS = INITIAL_MOVEMENTS;
export const MOCK_TICKETS = INITIAL_TICKETS;

