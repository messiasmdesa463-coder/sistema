import React, { useState } from 'react';
import { Company, User } from '../types';
import { 
  Building2, 
  Lock, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Building,
  User as UserIcon,
  Phone
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: User, company: Company | null) => void;
  onRegisterCompany: (companyData: {
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    email: string;
    telefone: string;
    nome_dono: string;
    email_dono: string;
    senha_dono: string;
  }) => { success: boolean; message: string };
  companies: Company[];
  users: User[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  onRegisterCompany,
  companies,
  users
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'recover'>('login');

  // Login form
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form
  const [regRazao, setRegRazao] = useState('');
  const [regFantasia, setRegFantasia] = useState('');
  const [regCnpj, setRegCnpj] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelefone, setRegTelefone] = useState('');
  const [regNomeDono, setRegNomeDono] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');
  const [regErrorMessage, setRegErrorMessage] = useState('');

  // Recover form
  const [recEmail, setRecEmail] = useState('');
  const [simulatedToken, setSimulatedToken] = useState<string | null>(null);
  const [recNewPassword, setRecNewPassword] = useState('');
  const [recSuccess, setRecSuccess] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanInput = identifier.trim();
    const cleanDigits = cleanInput.replace(/\D/g, '');

    // Busca usuário por CNPJ ou por E-mail
    let matchedUser: User | undefined;
    let matchedCompany: Company | null = null;

    if (cleanDigits.length === 14) {
      // Login por CNPJ da empresa
      matchedCompany = companies.find(c => c.cnpj.replace(/\D/g, '') === cleanDigits) || null;
      if (matchedCompany) {
        matchedUser = users.find(u => u.empresa_id === matchedCompany!.id && (u.perfil === 'dono' || u.perfil === 'gerente'));
      }
    } else {
      // Login por E-mail
      matchedUser = users.find(u => u.email.toLowerCase() === cleanInput.toLowerCase());
      if (matchedUser && matchedUser.empresa_id) {
        matchedCompany = companies.find(c => c.id === matchedUser!.empresa_id) || null;
      }
    }

    if (!matchedUser) {
      setLoginError('Nenhum usuário ou empresa encontrado com este E-mail/CNPJ.');
      return;
    }

    // Se for admin, não precisa de empresa
    if (matchedUser.perfil === 'admin') {
      onSuccessLogin(matchedUser, null);
      onClose();
      return;
    }

    // Validação de Status da Empresa (Requisito: Aprovação pelo admin)
    if (matchedCompany) {
      if (matchedCompany.status === 'pendente') {
        setLoginError('Esta empresa está com cadastro PENDENTE de aprovação pelo Administrador do SaaS. Aguarde a análise do CNPJ.');
        return;
      }
      if (matchedCompany.status === 'rejeitada' || matchedCompany.status === 'suspensa') {
        setLoginError(`Acesso bloqueado: o status da empresa é ${matchedCompany.status.toUpperCase()}. Entre em contato com o suporte.`);
        return;
      }
    }

    onSuccessLogin(matchedUser, matchedCompany);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMessage('');
    setRegSuccessMessage('');

    if (!regRazao || !regCnpj || !regNomeDono || !regEmail || !regSenha) {
      setRegErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const res = onRegisterCompany({
      razao_social: regRazao,
      nome_fantasia: regFantasia || regRazao,
      cnpj: regCnpj,
      email: regEmail,
      telefone: regTelefone,
      nome_dono: regNomeDono,
      email_dono: regEmail,
      senha_dono: regSenha
    });

    if (res.success) {
      setRegSuccessMessage(res.message);
      // Limpa formulário
      setRegRazao('');
      setRegFantasia('');
      setRegCnpj('');
      setRegEmail('');
      setRegNomeDono('');
      setRegSenha('');
    } else {
      setRegErrorMessage(res.message);
    }
  };

  const handleRecoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recEmail) return;

    // Simula geração de token seguro de 64 chars
    const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    setSimulatedToken(token);
    setRecSuccess('Instruções e token gerados com sucesso!');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recNewPassword || recNewPassword.length < 6) {
      alert('A nova senha deve conter pelo menos 6 dígitos.');
      return;
    }
    alert(`Senha do e-mail ${recEmail} redefinida com sucesso com o token de recuperação!`);
    setSimulatedToken(null);
    setRecEmail('');
    setRecNewPassword('');
    setTab('login');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xl font-extrabold text-blue-600 mb-1">
            <Building2 className="w-6 h-6" />
            <span>GestãoSaaS</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Gestão Empresarial Multi-Tenant com controle por perfis
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
          <button
            onClick={() => { setTab('login'); setLoginError(''); }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'login' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Acessar Conta
          </button>
          <button
            onClick={() => { setTab('register'); setRegErrorMessage(''); setRegSuccessMessage(''); }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'register' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cadastrar Empresa
          </button>
          <button
            onClick={() => { setTab('recover'); setSimulatedToken(null); }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'recover' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recuperar Senha
          </button>
        </div>

        {/* TAB 1: LOGIN (E-mail ou CNPJ) */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail de Usuário ou CNPJ da Empresa *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: carlos@techstore.com.br ou 12.345.678/0001-90"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-xs pl-3.5 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Você pode digitar seu e-mail cadastrado ou o CNPJ da sua empresa.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Senha de Acesso *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              Entrar no Sistema
            </button>

            {/* Quick Demo Access Box */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-600 block mb-2">
                Preencher com Contas de Demonstração:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => { setIdentifier('admin@saas.com.br'); setLoginPassword('Admin@123'); }}
                  className="p-2 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 text-left border border-purple-200"
                >
                  <strong className="block font-bold">Admin Global</strong>
                  <span className="text-[10px] text-purple-600">admin@saas.com.br</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIdentifier('12.345.678/0001-90'); setLoginPassword('Dono@123'); }}
                  className="p-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 text-left border border-blue-200"
                >
                  <strong className="block font-bold">Login por CNPJ</strong>
                  <span className="text-[10px] text-blue-600">TechStore (Dono)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIdentifier('mariana@techstore.com.br'); setLoginPassword('Gerente@123'); }}
                  className="p-2 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-left border border-emerald-200"
                >
                  <strong className="block font-bold">Gerente</strong>
                  <span className="text-[10px] text-emerald-600">mariana@techstore...</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIdentifier('98.765.432/0001-11'); setLoginPassword('Dono@123'); }}
                  className="p-2 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 text-left border border-amber-200"
                >
                  <strong className="block font-bold">Empresa Pendente</strong>
                  <span className="text-[10px] text-amber-600">Testar bloqueio</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: CADASTRO DE EMPRESA */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {regSuccessMessage && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Empresa Enviada para Análise!</strong>
                  <span>{regSuccessMessage}</span>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setTab('login')}
                      className="underline font-bold text-emerald-900"
                    >
                      Ir para a tela de login
                    </button>
                  </div>
                </div>
              </div>
            )}

            {regErrorMessage && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-medium">
                {regErrorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-0.5">Razão Social *</label>
              <input
                type="text"
                required
                placeholder="Ex: Alfa Logística e Transportes LTDA"
                value={regRazao}
                onChange={(e) => setRegRazao(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">CNPJ *</label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-00"
                  value={regCnpj}
                  onChange={(e) => setRegCnpj(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">Nome Fantasia</label>
                <input
                  type="text"
                  placeholder="Ex: Alfa Express"
                  value={regFantasia}
                  onChange={(e) => setRegFantasia(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">Nome do Dono / Diretor *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={regNomeDono}
                  onChange={(e) => setRegNomeDono(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={regTelefone}
                  onChange={(e) => setRegTelefone(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">E-mail Comercial *</label>
                <input
                  type="email"
                  required
                  placeholder="contato@empresa.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">Senha Inicial *</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 dígitos"
                  value={regSenha}
                  onChange={(e) => setRegSenha(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
              ⚡ <strong>Fluxo de Aprovação:</strong> O cadastro será registrado com status <strong>Pendente</strong> e necessitará de liberação pelo Administrador antes do primeiro login.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              Cadastrar Empresa e Solicitar Aprovação
            </button>
          </form>
        )}

        {/* TAB 3: RECUPERAR SENHA */}
        {tab === 'recover' && (
          <div className="space-y-4">
            {!simulatedToken ? (
              <form onSubmit={handleRecoverSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Digite seu E-mail Cadastrado *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={recEmail}
                    onChange={(e) => setRecEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Enviar Instruções de Recuperação
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-blue-800">
                    <Mail className="w-4 h-4" /> Simulação de E-mail Enviado com Token:
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Para: <strong>{recEmail}</strong><br />
                    Token criptográfico: <code className="font-mono bg-white px-1.5 py-0.5 rounded text-blue-700">{simulatedToken}</code>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nova Senha *</label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 dígitos"
                    value={recNewPassword}
                    onChange={(e) => setRecNewPassword(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Salvar Nova Senha
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
