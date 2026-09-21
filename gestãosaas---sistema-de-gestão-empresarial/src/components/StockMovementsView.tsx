import React, { useState } from 'react';
import { Product, StockMovement, MovementType, User } from '../types';
import { 
  ArrowLeftRight, 
  ArrowDownRight, 
  ArrowUpRight, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  User as UserIcon, 
  ShieldCheck,
  RotateCcw,
  Boxes
} from 'lucide-react';

interface StockMovementsViewProps {
  products: Product[];
  movements: StockMovement[];
  currentUser: User;
  onRecordMovement: (movement: {
    produto_id: number;
    tipo: MovementType;
    quantidade: number;
    motivo: string;
    documento_ref?: string;
    valor_unitario?: number;
  }) => { success: boolean; message: string };
  initialModalType?: 'entrada' | 'saida' | null;
  onCloseInitialModal?: () => void;
  preSelectedProductId?: number | null;
}

export const StockMovementsView: React.FC<StockMovementsViewProps> = ({
  products,
  movements,
  currentUser,
  onRecordMovement,
  initialModalType,
  onCloseInitialModal,
  preSelectedProductId
}) => {
  const [filterType, setFilterType] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(Boolean(initialModalType) || Boolean(preSelectedProductId));

  // Formulário de Nova Movimentação
  const [selectedProdId, setSelectedProdId] = useState<number>(preSelectedProductId || products[0]?.id || 0);
  const [movementType, setMovementType] = useState<MovementType>(initialModalType || 'entrada');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [docRef, setDocRef] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const filteredMovements = movements.filter(m => {
    const matchesType = filterType === 'todos' || m.tipo === filterType;
    const matchesSearch = 
      (m.produto_nome && m.produto_nome.toLowerCase().includes(search.toLowerCase())) ||
      (m.motivo && m.motivo.toLowerCase().includes(search.toLowerCase())) ||
      (m.documento_ref && m.documento_ref.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const selectedProduct = products.find(p => p.id === selectedProdId);

  const handleOpenModal = (type: MovementType = 'entrada') => {
    setMovementType(type);
    setQuantity(1);
    setReason('');
    setDocRef('');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorMessage('');
    if (onCloseInitialModal) onCloseInitialModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdId) {
      setErrorMessage('Selecione um produto.');
      return;
    }
    if (quantity <= 0) {
      setErrorMessage('A quantidade deve ser maior que zero.');
      return;
    }
    if (!reason.trim()) {
      setErrorMessage('Informe o motivo ou justificativa da movimentação.');
      return;
    }

    const res = onRecordMovement({
      produto_id: selectedProdId,
      tipo: movementType,
      quantidade: quantity,
      motivo: reason,
      documento_ref: docRef,
      valor_unitario: unitPrice || (movementType === 'entrada' ? selectedProduct?.preco_custo : selectedProduct?.preco_venda)
    });

    if (res.success) {
      handleCloseModal();
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Movimentações e Controle de Estoque</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Histórico auditável (Kardex): registre compras (entradas), vendas (saídas), devoluções e ajustes de inventário.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenModal('entrada')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Registrar Entrada</span>
          </button>
          <button
            onClick={() => handleOpenModal('saida')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Registrar Saída</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por produto, motivo ou documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'todos' 
                ? 'bg-slate-900 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todas ({movements.length})
          </button>
          <button
            onClick={() => setFilterType('entrada')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'entrada' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Entradas
          </button>
          <button
            onClick={() => setFilterType('saida')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'saida' 
                ? 'bg-rose-600 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Saídas
          </button>
          <button
            onClick={() => setFilterType('ajuste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'ajuste' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Ajustes
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Data & Hora</th>
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4 text-center">Quantidade</th>
                <th className="py-3 px-4 text-center">Saldo Anterior</th>
                <th className="py-3 px-4 text-center">Saldo Posterior</th>
                <th className="py-3 px-4">Motivo / Justificativa</th>
                <th className="py-3 px-4">Doc. Ref</th>
                <th className="py-3 px-4">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Nenhuma movimentação de estoque encontrada.
                  </td>
                </tr>
              ) : (
                filteredMovements.map(mov => {
                  const isEntrada = mov.tipo === 'entrada' || mov.tipo === 'devolucao';
                  const isSaida = mov.tipo === 'saida';

                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {mov.created_at}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {mov.produto_nome}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isEntrada ? 'bg-emerald-100 text-emerald-800' :
                          isSaida ? 'bg-rose-100 text-rose-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {isEntrada && <ArrowUpRight className="w-3 h-3" />}
                          {isSaida && <ArrowDownRight className="w-3 h-3" />}
                          {mov.tipo.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className={isEntrada ? 'text-emerald-700' : isSaida ? 'text-rose-700' : 'text-blue-700'}>
                          {isEntrada ? '+' : isSaida ? '-' : ''}{mov.quantidade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 font-mono">
                        {mov.saldo_anterior}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900 font-mono">
                        {mov.saldo_posterior}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={mov.motivo}>
                        {mov.motivo}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {mov.documento_ref || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {mov.usuario_nome || 'Sistema'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Movimentação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Registrar Movimentação de Estoque
                </h3>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 mb-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo de Movimento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Operação *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('entrada')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      movementType === 'entrada' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    + Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('saida')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      movementType === 'saida' 
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    - Saída
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('ajuste')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      movementType === 'ajuste' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Ajuste
                  </button>
                </div>
              </div>

              {/* Produto Selecionado */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Produto *</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(parseInt(e.target.value))}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (Atual: {p.estoque_atual} {p.unidade_medida})
                    </option>
                  ))}
                </select>
                {selectedProduct && (
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                    <span>Estoque Atual: <strong>{selectedProduct.estoque_atual} {selectedProduct.unidade_medida}</strong></span>
                    <span>SKU: {selectedProduct.sku}</span>
                  </div>
                )}
              </div>

              {/* Quantidade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantidade *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doc. Ref (NF / Pedido)</label>
                  <input
                    type="text"
                    placeholder="Ex: NF-49021"
                    value={docRef}
                    onChange={(e) => setDocRef(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo / Descrição *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    movementType === 'entrada' ? 'Ex: Compra de lote fornecedor X' :
                    movementType === 'saida' ? 'Ex: Venda balcão / Ordem de serviço #400' :
                    'Ex: Inventário de contagem física periódica'
                  }
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg text-xs font-bold transition-colors shadow-xs ${
                    movementType === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    movementType === 'saida' ? 'bg-rose-600 hover:bg-rose-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Confirmar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
