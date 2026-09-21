import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Users2, 
  UserPlus, 
  Shield, 
  Mail, 
  Briefcase, 
  Building, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Edit,
  Clock
} from 'lucide-react';

interface EmployeesViewProps {
  users: User[];
  currentRole: UserRole;
  onSaveUser: (user: Partial<User>) => void;
  onToggleUserStatus: (userId: number) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  users,
  currentRole,
  onSaveUser,
  onToggleUserStatus
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const canManage = currentRole === 'admin' || currentRole === 'dono' || currentRole === 'gerente';

  const handleOpenAdd = () => {
    setEditingUser({
      nome: '',
      email: '',
      perfil: 'funcionario',
      cargo: '',
      departamento: 'Operações',
      ativo: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.nome || !editingUser?.email) {
      alert('Nome e E-mail são obrigatórios.');
      return;
    }
    onSaveUser(editingUser);
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const getRoleBadge = (perfil: UserRole) => {
    switch (perfil) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[11px] font-bold">Admin Global</span>;
      case 'dono':
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[11px] font-bold">Dono / Diretor</span>;
      case 'gerente':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[11px] font-bold">Gerente</span>;
      case 'funcionario':
        return <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full text-[11px] font-bold">Funcionário</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Cadastro e Acompanhamento de Funcionários</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle os colaboradores da empresa e defina permissões por perfis de acesso: Dono, Gerente e Funcionário.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-xs shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Colaborador</span>
          </button>
        )}
      </div>

      {/* Tabela de Colaboradores */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Perfil de Acesso</th>
                <th className="py-3 px-4">Cargo / Função</th>
                <th className="py-3 px-4">Departamento</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Último Acesso</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                        {user.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.nome}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getRoleBadge(user.perfil)}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {user.cargo || 'Não especificado'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {user.departamento || 'Geral'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      user.ativo 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {user.ativo ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
                    {user.ultimo_acesso || 'Nunca acessou'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {canManage && user.perfil !== 'admin' && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar colaborador"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleUserStatus(user.id)}
                          className={`p-1.5 rounded-lg transition-colors text-xs font-semibold ${
                            user.ativo 
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' 
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={user.ativo ? 'Desativar acesso' : 'Reativar acesso'}
                        >
                          {user.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar/Editar Colaborador */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser.id ? 'Editar Colaborador' : 'Novo Colaborador'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ana Clara Martins"
                  value={editingUser.nome || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, nome: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail de Acesso *</label>
                <input
                  type="email"
                  required
                  placeholder="ana@empresa.com.br"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Perfil de Permissão *</label>
                <select
                  value={editingUser.perfil || 'funcionario'}
                  onChange={(e) => setEditingUser({ ...editingUser, perfil: e.target.value as UserRole })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="funcionario">Funcionário (Acesso a estoque e abertura de tickets)</option>
                  <option value="gerente">Gerente (Gestão de estoque, produtos, tickets e equipe)</option>
                  {currentRole === 'admin' && (
                    <option value="dono">Dono (Controle total da empresa e configurações)</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    placeholder="Ex: Assistente de Estoque"
                    value={editingUser.cargo || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, cargo: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Departamento</label>
                  <input
                    type="text"
                    placeholder="Ex: Logística"
                    value={editingUser.departamento || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, departamento: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {!editingUser.id && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Senha Provisória</label>
                  <input
                    type="password"
                    placeholder="Padrão: Senha@123"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
