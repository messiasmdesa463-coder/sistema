import React, { useState } from 'react';
import { Ticket, TicketPriority, TicketStatus, User } from '../types';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  User as UserIcon,
  Tag
} from 'lucide-react';

interface TicketsViewProps {
  tickets: Ticket[];
  currentUser: User;
  onOpenTicket: (ticket: {
    titulo: string;
    categoria: 'suporte' | 'financeiro' | 'duvida' | 'sugestao' | 'urgente';
    prioridade: TicketPriority;
    descricao: string;
  }) => void;
  onReplyTicket: (ticketId: number, message: string) => void;
  onUpdateStatus: (ticketId: number, status: TicketStatus) => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  tickets,
  currentUser,
  onOpenTicket,
  onReplyTicket,
  onUpdateStatus
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(tickets[0]?.id || null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Formulário de Novo Ticket
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<'suporte' | 'financeiro' | 'duvida' | 'sugestao' | 'urgente'>('suporte');
  const [prioridade, setPrioridade] = useState<TicketPriority>('media');
  const [descricao, setDescricao] = useState('');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !descricao) {
      alert('Preencha o título e a descrição do problema.');
      return;
    }
    onOpenTicket({
      titulo,
      categoria,
      prioridade,
      descricao
    });
    setTitulo('');
    setDescricao('');
    setIsNewModalOpen(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    onReplyTicket(selectedTicket.id, replyMessage.trim());
    setReplyMessage('');
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'aberto':
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[11px] font-bold">Aberto</span>;
      case 'em_atendimento':
        return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[11px] font-bold">Em Atendimento</span>;
      case 'resolvido':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[11px] font-bold">Resolvido</span>;
      case 'fechado':
        return <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-bold">Fechado</span>;
    }
  };

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case 'urgente':
        return <span className="text-red-600 font-extrabold uppercase text-[10px]">● Urgente</span>;
      case 'alta':
        return <span className="text-amber-600 font-bold uppercase text-[10px]">● Alta</span>;
      case 'media':
        return <span className="text-blue-600 font-semibold uppercase text-[10px]">● Média</span>;
      case 'baixa':
        return <span className="text-slate-500 font-medium uppercase text-[10px]">● Baixa</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900">Central de Atendimento & Suporte (Tickets)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Abra chamados para suporte técnico, financeiro, solicitação de novas funções ou resolução de incidentes.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Novo Ticket</span>
        </button>
      </div>

      {/* Grid: Tickets List + Active Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-between">
            <span>Chamados Registrados ({tickets.length})</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[560px]">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum chamado aberto.
              </div>
            ) : (
              tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full text-left p-4 transition-all flex flex-col gap-1.5 ${
                    selectedTicket?.id === ticket.id 
                      ? 'bg-purple-50/70 border-l-4 border-purple-600' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400 font-mono">#{ticket.id}</span>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{ticket.titulo}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{ticket.descricao}</p>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100/60 mt-1">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(ticket.prioridade)}
                      <span>• Categoria: {ticket.categoria}</span>
                    </div>
                    <span>{ticket.created_at.split(' ')[0]}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Conversation View */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          {selectedTicket ? (
            <>
              {/* Ticket Top bar */}
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-600">#{selectedTicket.id}</span>
                    <h3 className="text-sm font-bold text-slate-900">{selectedTicket.titulo}</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Solicitante: <strong>{selectedTicket.usuario_nome}</strong> ({selectedTicket.empresa_nome || 'Empresa'}) • Aberto em: {selectedTicket.created_at}
                  </p>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Status:</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => onUpdateStatus(selectedTicket.id, e.target.value as TicketStatus)}
                    className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="aberto">Aberto</option>
                    <option value="em_atendimento">Em Atendimento</option>
                    <option value="resolvido">Resolvido</option>
                    <option value="fechado">Fechado</option>
                  </select>
                </div>
              </div>

              {/* Message Thread */}
              <div className="p-5 overflow-y-auto max-h-[380px] flex-1 space-y-4">
                {/* Original Description */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Descrição do Problema</span>
                    <span className="text-[10px] text-slate-400 font-normal">{selectedTicket.created_at}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line text-slate-700">{selectedTicket.descricao}</p>
                </div>

                {/* Thread replies */}
                {selectedTicket.mensagens.map(msg => {
                  const isSupportOrAdmin = msg.usuario_perfil === 'admin' || msg.usuario_perfil === 'gerente';

                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col text-xs p-3.5 rounded-xl border ${
                        isSupportOrAdmin 
                          ? 'bg-purple-50/60 border-purple-200 ml-4' 
                          : 'bg-white border-slate-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          {msg.usuario_nome}
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {msg.usuario_perfil.toUpperCase()}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400">{msg.created_at}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">{msg.mensagem}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input Box */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-slate-50/50 flex gap-2">
                <input
                  type="text"
                  placeholder="Escreva sua resposta para este chamado..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={!replyMessage.trim()}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
              Selecione um chamado ao lado para visualizar a conversa.
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Ticket */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Abertura de Chamado / Ticket de Suporte
              </h3>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Chamado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dúvida sobre emissão de notas ou erro no fechamento"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="suporte">Suporte Técnico</option>
                    <option value="financeiro">Financeiro / Cobrança</option>
                    <option value="duvida">Dúvida Operacional</option>
                    <option value="sugestao">Sugestão de Recurso</option>
                    <option value="urgente">Incidente Crítico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value as TicketPriority)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente (Bloqueio)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Detalhada *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explique o que aconteceu, passos para reproduzir ou a dúvida com o máximo de detalhes..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Abrir Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
