import React, { useState } from 'react';
import { 
  MOCK_COMPANIES, 
  MOCK_USERS, 
  MOCK_PRODUCTS, 
  MOCK_MOVEMENTS, 
  MOCK_TICKETS 
} from './mockData';
import { 
  Company, 
  User, 
  Product, 
  StockMovement, 
  Ticket, 
  NavigationTab, 
  UserRole, 
  CompanyStatus,
  MovementType,
  TicketStatus,
  TicketPriority
} from './types';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { StockMovementsView } from './components/StockMovementsView';
import { EmployeesView } from './components/EmployeesView';
import { TicketsView } from './components/TicketsView';
import { SettingsView } from './components/SettingsView';
import { AdminCompaniesView } from './components/AdminCompaniesView';
import { PhpBackendViewer } from './components/PhpBackendViewer';
import { AuthModal } from './components/AuthModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  // Estado das Coleções de Dados do Sistema
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [movements, setMovements] = useState<StockMovement[]>(MOCK_MOVEMENTS);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);

  // Sessão do Usuário Conectado
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[1]); // Padrão: Carlos Dono
  const [currentCompany, setCurrentCompany] = useState<Company | null>(MOCK_COMPANIES[0]); // TechStore Brasil

  // Navegação
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Gatilhos de Movimentação Rápida de Estoque
  const [stockModalType, setStockModalType] = useState<'entrada' | 'saida' | null>(null);
  const [preSelectedProductId, setPreSelectedProductId] = useState<number | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Switch de Perfis de Demonstração (Dono, Gerente, Funcionário, Admin)
  const handleSwitchRole = (newRole: UserRole) => {
    const targetUser = users.find(u => u.perfil === newRole);
    if (targetUser) {
      setCurrentUser(targetUser);
      if (targetUser.empresa_id) {
        const comp = companies.find(c => c.id === targetUser.empresa_id) || null;
        setCurrentCompany(comp);
      } else {
        setCurrentCompany(null);
      }
      showToast(`Perfil alternado para: ${newRole.toUpperCase()} (${targetUser.nome})`, 'info');
    }
  };

  // Gerenciamento de Status de Empresa (Aprovação / Rejeição pelo Admin)
  const handleUpdateCompanyStatus = (companyId: number, newStatus: CompanyStatus) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return { ...c, status: newStatus };
      }
      return c;
    }));

    const comp = companies.find(c => c.id === companyId);
    showToast(`Status da empresa "${comp?.nome_fantasia}" alterado para: ${newStatus.toUpperCase()}`, 'success');
  };

  // Salvar ou Criar Produto
  const handleSaveProduct = (prodData: Partial<Product>) => {
    if (prodData.id) {
      // Atualização
      setProducts(prev => prev.map(p => p.id === prodData.id ? { ...p, ...prodData } as Product : p));
      showToast('Produto atualizado com sucesso!', 'success');
    } else {
      // Novo
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      const newProd: Product = {
        id: newId,
        empresa_id: currentCompany?.id || 1,
        nome: prodData.nome || '',
        sku: prodData.sku || '',
        codigo_barras: prodData.codigo_barras,
        categoria: prodData.categoria || 'Geral',
        preco_custo: prodData.preco_custo || 0,
        preco_venda: prodData.preco_venda || 0,
        estoque_atual: prodData.estoque_atual || 0,
        estoque_minimo: prodData.estoque_minimo || 5,
        unidade_medida: prodData.unidade_medida || 'UN',
        localizacao: prodData.localizacao,
        ativo: true,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setProducts(prev => [newProd, ...prev]);
      showToast('Produto cadastrado com sucesso!', 'success');
    }
  };

  // Excluir Produto
  const handleDeleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Produto removido com sucesso.', 'info');
  };

  // Ação Rápida de Estoque
  const handleQuickMoveProduct = (productId: number) => {
    setPreSelectedProductId(productId);
    setActiveTab('estoque');
  };

  // Registrar Movimentação de Estoque
  const handleRecordMovement = (movement: {
    produto_id: number;
    tipo: MovementType;
    quantidade: number;
    motivo: string;
    documento_ref?: string;
    valor_unitario?: number;
  }): { success: boolean; message: string } => {
    const targetProduct = products.find(p => p.id === movement.produto_id);
    if (!targetProduct) {
      return { success: false, message: 'Produto não encontrado.' };
    }

    const saldoAnterior = targetProduct.estoque_atual;
    let saldoPosterior = saldoAnterior;

    if (movement.tipo === 'entrada' || movement.tipo === 'devolucao') {
      saldoPosterior = saldoAnterior + movement.quantidade;
    } else if (movement.tipo === 'saida') {
      if (saldoAnterior < movement.quantidade) {
        return { 
          success: false, 
          message: `Saldo insuficiente! Estoque atual é de ${saldoAnterior} ${targetProduct.unidade_medida}, impossível dar saída de ${movement.quantidade}.` 
        };
      }
      saldoPosterior = saldoAnterior - movement.quantidade;
    } else if (movement.tipo === 'ajuste') {
      saldoPosterior = movement.quantidade;
    }

    // Atualiza o estoque do produto
    setProducts(prev => prev.map(p => p.id === targetProduct.id ? { ...p, estoque_atual: saldoPosterior } : p));

    // Grava registro da movimentação no Kardex auditável
    const newMovementId = movements.length > 0 ? Math.max(...movements.map(m => m.id)) + 1 : 1;
    const newMov: StockMovement = {
      id: newMovementId,
      empresa_id: currentCompany?.id || 1,
      produto_id: targetProduct.id,
      produto_nome: targetProduct.nome,
      usuario_id: currentUser.id,
      usuario_nome: currentUser.nome,
      tipo: movement.tipo,
      quantidade: movement.quantidade,
      saldo_anterior: saldoAnterior,
      saldo_posterior: saldoPosterior,
      motivo: movement.motivo,
      documento_ref: movement.documento_ref,
      valor_unitario: movement.valor_unitario,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setMovements(prev => [newMov, ...prev]);
    showToast(`Movimentação de ${movement.tipo.toUpperCase()} registrada com sucesso! Novo saldo: ${saldoPosterior}`, 'success');
    return { success: true, message: 'Movimentação registrada com sucesso.' };
  };

  // Salvar ou Criar Colaborador
  const handleSaveUser = (userData: Partial<User>) => {
    if (userData.id) {
      setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } as User : u));
      showToast('Dados do colaborador atualizados!', 'success');
    } else {
      const newUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUser: User = {
        id: newUserId,
        empresa_id: currentCompany?.id || 1,
        nome: userData.nome || '',
        email: userData.email || '',
        perfil: userData.perfil || 'funcionario',
        cargo: userData.cargo || 'Assistente',
        departamento: userData.departamento || 'Geral',
        ativo: true,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setUsers(prev => [newUser, ...prev]);
      showToast('Novo colaborador cadastrado com sucesso!', 'success');
    }
  };

  const handleToggleUserStatus = (userId: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const next = !u.ativo;
        showToast(`Colaborador ${u.nome} foi ${next ? 'ativado' : 'desativado'}.`, 'info');
        return { ...u, ativo: next };
      }
      return u;
    }));
  };

  // Abrir Novo Ticket
  const handleOpenTicket = (ticketData: {
    titulo: string;
    categoria: 'suporte' | 'financeiro' | 'duvida' | 'sugestao' | 'urgente';
    prioridade: TicketPriority;
    descricao: string;
  }) => {
    const newTicketId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newTicket: Ticket = {
      id: newTicketId,
      empresa_id: currentCompany?.id || 1,
      empresa_nome: currentCompany?.nome_fantasia || 'Empresa',
      usuario_id: currentUser.id,
      usuario_nome: currentUser.nome,
      titulo: ticketData.titulo,
      categoria: ticketData.categoria,
      prioridade: ticketData.prioridade,
      status: 'aberto',
      descricao: ticketData.descricao,
      mensagens: [
        {
          id: 1,
          ticket_id: newTicketId,
          usuario_id: currentUser.id,
          usuario_nome: currentUser.nome,
          usuario_perfil: currentUser.perfil,
          mensagem: ticketData.descricao,
          created_at: now
        }
      ],
      created_at: now,
      updated_at: now
    };

    setTickets(prev => [newTicket, ...prev]);
    showToast(`Chamado #${newTicketId} aberto com sucesso!`, 'success');
  };

  // Responder a um Ticket
  const handleReplyTicket = (ticketId: number, messageText: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newMsgId = t.mensagens.length + 1;
        const newMsg = {
          id: newMsgId,
          ticket_id: ticketId,
          usuario_id: currentUser.id,
          usuario_nome: currentUser.nome,
          usuario_perfil: currentUser.perfil,
          mensagem: messageText,
          created_at: now
        };
        return {
          ...t,
          status: t.status === 'aberto' ? 'em_atendimento' : t.status,
          mensagens: [...t.mensagens, newMsg],
          updated_at: now
        };
      }
      return t;
    }));
    showToast('Resposta enviada com sucesso.', 'success');
  };

  // Atualizar Status do Ticket
  const handleUpdateTicketStatus = (ticketId: number, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    showToast(`Status do ticket #${ticketId} atualizado para: ${newStatus.toUpperCase()}`, 'info');
  };

  // Salvar Configurações da Empresa
  const handleSaveCompanySettings = (updated: Partial<Company>) => {
    if (!currentCompany) return;
    const nextComp = { ...currentCompany, ...updated };
    setCurrentCompany(nextComp);
    setCompanies(prev => prev.map(c => c.id === nextComp.id ? nextComp : c));
    showToast('Identidade visual e dados da empresa atualizados com sucesso!', 'success');
  };

  // Cadastrar Nova Empresa (Formulário do AuthModal)
  const handleRegisterCompany = (companyData: {
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    email: string;
    telefone: string;
    nome_dono: string;
    email_dono: string;
    senha_dono: string;
  }): { success: boolean; message: string } => {
    // Validação de duplicidade de CNPJ
    const cleanNewCnpj = companyData.cnpj.replace(/\D/g, '');
    const exists = companies.some(c => c.cnpj.replace(/\D/g, '') === cleanNewCnpj);
    if (exists) {
      return { success: false, message: 'Já existe uma empresa cadastrada com este CNPJ.' };
    }

    const newCompId = companies.length > 0 ? Math.max(...companies.map(c => c.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newComp: Company = {
      id: newCompId,
      razao_social: companyData.razao_social,
      nome_fantasia: companyData.nome_fantasia,
      cnpj: companyData.cnpj,
      email: companyData.email,
      telefone: companyData.telefone,
      status: 'pendente', // Obrigatoriamente 'pendente' para aprovação do admin
      cor_tema: '#2563eb',
      created_at: now,
      updated_at: now
    };

    const newOwnerId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newOwner: User = {
      id: newOwnerId,
      empresa_id: newCompId,
      nome: companyData.nome_dono,
      email: companyData.email_dono,
      perfil: 'dono',
      cargo: 'Diretor / Fundador',
      departamento: 'Diretoria',
      ativo: true,
      created_at: now
    };

    setCompanies(prev => [newComp, ...prev]);
    setUsers(prev => [newOwner, ...prev]);

    return { 
      success: true, 
      message: `Empresa "${companyData.nome_fantasia}" cadastrada com sucesso! Ela foi enviada para a fila de aprovação do Administrador.` 
    };
  };

  // Login bem sucedido via AuthModal
  const handleSuccessLogin = (user: User, company: Company | null) => {
    setCurrentUser(user);
    setCurrentCompany(company);
    showToast(`Bem-vindo, ${user.nome}! Conectado como ${user.perfil.toUpperCase()}.`, 'success');
  };

  const pendingCompaniesCount = companies.filter(c => c.status === 'pendente').length;
  const openTicketsCount = tickets.filter(t => t.status === 'aberto' || t.status === 'em_atendimento').length;
  const lowStockCount = products.filter(p => p.estoque_atual <= p.estoque_minimo).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Toast flutuante */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-bold ${
            toast.type === 'success' ? 'bg-emerald-900 text-white border-emerald-700' :
            toast.type === 'error' ? 'bg-rose-900 text-white border-rose-700' :
            'bg-slate-900 text-white border-slate-700'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentUser={currentUser}
        currentCompany={currentCompany}
        onSwitchUser={handleSwitchRole}
        onOpenCodeExplorer={() => setActiveTab('codigo')}
        onLogout={() => setIsAuthModalOpen(true)}
      />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Left Sidebar */}
        <Sidebar
          currentRole={currentUser.perfil}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingCount={pendingCompaniesCount}
          lowStockCount={lowStockCount}
          openTicketsCount={openTicketsCount}
        />

        {/* Main Content View */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              currentCompany={currentCompany}
              companies={companies}
              products={products}
              movements={movements}
              tickets={tickets}
              onNavigate={setActiveTab}
              onOpenNewMovement={(type: 'entrada' | 'saida') => {
                setStockModalType(type);
                setActiveTab('estoque');
              }}
            />
          )}

          {activeTab === 'produtos' && (
            <ProductsView
              products={products}
              currentRole={currentUser.perfil}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onQuickMove={handleQuickMoveProduct}
            />
          )}

          {activeTab === 'estoque' && (
            <StockMovementsView
              products={products}
              movements={movements}
              currentUser={currentUser}
              onRecordMovement={handleRecordMovement}
              initialModalType={stockModalType}
              onCloseInitialModal={() => setStockModalType(null)}
              preSelectedProductId={preSelectedProductId}
            />
          )}

          {activeTab === 'funcionarios' && (
            <EmployeesView
              users={users}
              currentRole={currentUser.perfil}
              onSaveUser={handleSaveUser}
              onToggleUserStatus={handleToggleUserStatus}
            />
          )}

          {activeTab === 'tickets' && (
            <TicketsView
              tickets={tickets}
              currentUser={currentUser}
              onOpenTicket={handleOpenTicket}
              onReplyTicket={handleReplyTicket}
              onUpdateStatus={handleUpdateTicketStatus}
            />
          )}

          {activeTab === 'configuracoes' && (
            <SettingsView
              currentCompany={currentCompany}
              onSaveSettings={handleSaveCompanySettings}
            />
          )}

          {activeTab === 'admin-empresas' && (
            <AdminCompaniesView
              companies={companies}
              onUpdateStatus={handleUpdateCompanyStatus}
            />
          )}

          {activeTab === 'codigo' && currentUser.perfil === 'admin' && (
            <PhpBackendViewer />
          )}
          {activeTab === 'codigo' && currentUser.perfil !== 'admin' && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-lg mx-auto mt-12 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 font-bold">
                !
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Acesso Restrito</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                A visualização e exportação da infraestrutura técnica do back-end é reservada exclusivamente para a equipe de desenvolvimento e administração global da plataforma SaaS.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Voltar ao Dashboard da Empresa
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal de Autenticação / Cadastro de Empresa / Recuperação de Senha */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessLogin={handleSuccessLogin}
        onRegisterCompany={handleRegisterCompany}
        companies={companies}
        users={users}
      />
    </div>
  );
}
