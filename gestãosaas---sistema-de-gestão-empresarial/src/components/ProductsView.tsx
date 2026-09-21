import React, { useState } from 'react';
import { Product, UserRole } from '../types';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  ArrowLeftRight, 
  Barcode, 
  DollarSign, 
  TrendingUp,
  Boxes
} from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  currentRole: UserRole;
  onSaveProduct: (product: Partial<Product>) => void;
  onDeleteProduct: (productId: number) => void;
  onQuickMove: (productId: number) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  currentRole,
  onSaveProduct,
  onDeleteProduct,
  onQuickMove
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const canEdit = currentRole === 'admin' || currentRole === 'dono' || currentRole === 'gerente';

  const categories = Array.from(new Set(products.map(p => p.categoria)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.codigo_barras && p.codigo_barras.includes(search));
    const matchesCat = selectedCategory === 'todas' || p.categoria === selectedCategory;
    return matchesSearch && matchesCat && p.ativo;
  });

  const handleOpenAdd = () => {
    setEditingProduct({
      nome: '',
      sku: '',
      codigo_barras: '',
      categoria: 'Geral',
      preco_custo: 0,
      preco_venda: 0,
      estoque_atual: 0,
      estoque_minimo: 5,
      unidade_medida: 'UN',
      localizacao: '',
      ativo: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.nome || !editingProduct?.sku) {
      alert('Preencha os campos obrigatórios (Nome e SKU)');
      return;
    }
    onSaveProduct(editingProduct);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Catálogo e Gestão de Produtos</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre itens, defina preços de custo/venda, monitore margens e configure limites de estoque mínimo.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, SKU ou código de barras..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="todas">Todas as Categorias ({products.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Produto & SKU</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-right">Preço de Custo</th>
                <th className="py-3 px-4 text-right">Preço de Venda</th>
                <th className="py-3 px-4 text-center">Margem</th>
                <th className="py-3 px-4 text-center">Estoque Atual</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Nenhum produto cadastrado ou correspondente à busca.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => {
                  const isCritico = prod.estoque_atual <= prod.estoque_minimo;
                  const isEsgotado = prod.estoque_atual === 0;
                  const margem = prod.preco_custo > 0 
                    ? (((prod.preco_venda - prod.preco_custo) / prod.preco_custo) * 100).toFixed(0)
                    : '100';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{prod.nome}</div>
                        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold">SKU: {prod.sku}</span>
                          {prod.codigo_barras && (
                            <span className="text-slate-400 flex items-center gap-0.5">
                              <Barcode className="w-3 h-3" /> {prod.codigo_barras}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[11px]">
                          {prod.categoria}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        {formatCurrency(prod.preco_custo)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(prod.preco_venda)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold text-[11px]">
                          <TrendingUp className="w-3 h-3" /> +{margem}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                            isEsgotado
                              ? 'bg-red-100 text-red-800'
                              : isCritico
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {prod.estoque_atual} {prod.unidade_medida}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Mín: {prod.estoque_minimo}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {prod.localizacao || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onQuickMove(prod.id)}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Movimentar estoque (Entrada/Saída)"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(prod)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Editar produto"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remover produto "${prod.nome}"?`)) {
                                    onDeleteProduct(prod.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir produto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct.id ? 'Editar Produto' : 'Cadastrar Novo Produto'}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Teclado Mecânico RGB"
                  value={editingProduct.nome || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, nome: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TEC-RGB-01"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Código de Barras (EAN)</label>
                  <input
                    type="text"
                    placeholder="789..."
                    value={editingProduct.codigo_barras || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, codigo_barras: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Periféricos"
                    value={editingProduct.categoria || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoria: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unidade de Medida</label>
                  <select
                    value={editingProduct.unidade_medida || 'UN'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unidade_medida: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="UN">Unidade (UN)</option>
                    <option value="CX">Caixa (CX)</option>
                    <option value="KG">Quilo (KG)</option>
                    <option value="LT">Litro (LT)</option>
                    <option value="MT">Metro (MT)</option>
                    <option value="PC">Peça (PC)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.preco_custo || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, preco_custo: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.preco_venda || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, preco_venda: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {editingProduct.id ? 'Estoque Atual (Somente Leitura)' : 'Estoque Inicial'}
                  </label>
                  <input
                    type="number"
                    disabled={Boolean(editingProduct.id)}
                    min="0"
                    value={editingProduct.estoque_atual || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, estoque_atual: parseInt(e.target.value) || 0 })}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none ${
                      editingProduct.id ? 'bg-slate-100 text-slate-500 border-slate-200' : 'border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estoque Mínimo (Alerta)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.estoque_minimo || 5}
                    onChange={(e) => setEditingProduct({ ...editingProduct, estoque_minimo: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Localização no Depósito / Loja</label>
                <input
                  type="text"
                  placeholder="Ex: Corredor B, Prateleira 4"
                  value={editingProduct.localizacao || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, localizacao: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

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
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
