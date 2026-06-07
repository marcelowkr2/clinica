'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Plus, 
  Eye, 
  Edit, 
  Trash, 
  Search, 
  Filter,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Download,
  CreditCard, 
  Banknote,
  Calendar,
  User,
  Package,
  XCircle
} from 'lucide-react';
import { VetLayout } from '@/components/ui/VetLayout';
import { vendasService, Venda } from '@/services/vendas';

export default function VendasPage() {
  const router = useRouter();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'pago' | 'cancelado'>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [estatisticas, setEstatisticas] = useState({
    totalVendas: 0,
    vendasPagas: 0,
    vendasPendentes: 0,
    faturamentoTotal: 0
  });
  const itemsPerPage = 10;

  useEffect(() => {
    loadVendas();
    loadEstatisticas();
  }, []);

  const loadVendas = async () => {
    setLoading(true);
    try {
      const vendasData = await vendasService.getVendas();
      setVendas(vendasData);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticas = async () => {
    try {
      const stats = await vendasService.getEstatisticas();
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleUpdateStatus = async (vendaId: number, novoStatus: 'pendente' | 'pago' | 'cancelado') => {
    try {
      await vendasService.updateStatusVenda(vendaId, novoStatus);
      
      // Atualizar a venda na lista local
      setVendas(prevVendas => 
        prevVendas.map(venda => 
          venda.id === vendaId 
            ? { ...venda, status: novoStatus, updated_at: new Date().toISOString() }
            : venda
        )
      );
      
      // Recarregar estatísticas
      loadEstatisticas();
      
      alert('Status da venda atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status da venda');
    }
  };

  const filteredVendas = vendas.filter(venda => {
    const matchesSearch = venda.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venda.numero_venda.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || venda.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedVendas = filteredVendas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredVendas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVendas = paginatedVendas;

  const formatStatus = (status: string) => {
    const statusMap = {
      'pendente': 'Pendente',
      'pago': 'Pago',
      'cancelado': 'Cancelado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const formatFormaPagamento = (forma: string) => {
    const formaMap = {
      'dinheiro': 'Dinheiro',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'pix': 'PIX',
      'transferencia': 'Transferência'
    };
    return formaMap[forma as keyof typeof formaMap] || forma;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getPaymentIcon = (forma: string) => {
    switch (forma) {
      case 'dinheiro': return <Banknote className="w-4 h-4" />;
      case 'cartao_credito': 
      case 'cartao_debito': return <CreditCard className="w-4 h-4" />;
      case 'pix': return <DollarSign className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentText = (forma: string) => {
    switch (forma) {
      case 'dinheiro': return 'Dinheiro';
      case 'cartao_credito': return 'Cartão Crédito';
      case 'cartao_debito': return 'Cartão Débito';
      case 'pix': return 'PIX';
      case 'transferencia': return 'Transferência';
      default: return forma;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        await vendasService.deleteVenda(id);
        await loadVendas();
        await loadEstatisticas();
        alert('Venda excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir venda:', error);
        alert('Erro ao excluir venda');
      }
    }
  };

  const handleExport = async () => {
    try {
      await vendasService.exportarVendas();
    } catch (error) {
      console.error('Erro ao exportar vendas:', error);
      alert('Erro ao exportar vendas');
    }
  };

  const totalVendas = estatisticas.totalVendas;
  const vendasPagas = estatisticas.vendasPagas;
  const vendasPendentes = estatisticas.vendasPendentes;
  const faturamentoTotal = estatisticas.faturamentoTotal;

  return (
    <VetLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
            <p className="text-gray-600">Gerencie vendas e pagamentos</p>
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
            <button
               className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
               onClick={() => router.push('/vendas/nova')}
             >
               <Plus className="h-4 w-4" />
               Nova Venda
             </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                <p className="text-2xl font-bold text-gray-900">{totalVendas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendas Pagas</p>
                <p className="text-2xl font-bold text-gray-900">{vendasPagas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{vendasPendentes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Banknote className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Faturamento</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {parseFloat(faturamentoTotal || 0).toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por cliente ou número da venda..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando vendas...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Mostrando {currentVendas.length} de {filteredVendas.length} vendas
            </p>
            
            {currentVendas.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma venda encontrada</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'todos' 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Comece criando sua primeira venda.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentVendas.map((venda) => (
                  <div key={venda.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <ShoppingCart className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{venda.numero_venda}</h3>
                          <p className="text-sm text-gray-500">{venda.cliente_nome}</p>
                          
                          {/* Produtos vendidos */}
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Produtos:</p>
                            <div className="space-y-1">
                              {venda.itens.slice(0, 2).map((item) => (
                                <div key={item.id} className="flex items-center gap-2 text-xs text-gray-600">
                                  {item.produto_imagem && (
                                    <img 
                                      src={item.produto_imagem} 
                                      alt={item.produto_nome}
                                      className="w-4 h-4 rounded object-cover flex-shrink-0"
                                    />
                                  )}
                                  <span className="flex-1 truncate">{item.produto_nome}</span>
                                  <span className="text-xs text-gray-500">x{item.quantidade}</span>
                                </div>
                              ))}
                              {venda.itens.length > 2 && (
                                <p className="text-xs text-gray-500">+{venda.itens.length - 2} mais</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(venda.status)}`}>
                          {getStatusText(venda.status)}
                        </span>
                        
                        {/* Imagem do primeiro produto */}
                        {venda.itens.length > 0 && venda.itens[0].produto_imagem && (
                          <img 
                            src={venda.itens[0].produto_imagem} 
                            alt={venda.itens[0].produto_nome}
                            className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200 flex-shrink-0"
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>Cliente: {venda.cliente_nome}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Data: {new Date(venda.data_venda).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        {getPaymentIcon(venda.forma_pagamento)}
                        <span className="ml-2">Pagamento: {getPaymentText(venda.forma_pagamento)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="w-4 h-4 mr-2" />
                        <span>{venda.itens.length} item{venda.itens.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-gray-900">
                          R$ {parseFloat(venda.total || 0).toFixed(2).replace('.', ',')}
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Botões de Status */}
                          {venda.status === 'pendente' && (
                            <button
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                              title="Marcar como Pago"
                              onClick={() => handleUpdateStatus(venda.id, 'pago')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          {venda.status === 'pago' && (
                            <button
                              className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
                              title="Marcar como Pendente"
                              onClick={() => handleUpdateStatus(venda.id, 'pendente')}
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}
                          
                          {venda.status !== 'cancelado' && (
                            <button
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Cancelar Venda"
                              onClick={() => handleUpdateStatus(venda.id, 'cancelado')}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Separador */}
                          <div className="w-px h-4 bg-gray-300 mx-1"></div>
                          
                          {/* Botões de Ação */}
                          <button
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Visualizar"
                            onClick={() => router.push(`/vendas/visualizar/${venda.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Editar"
                            onClick={() => router.push(`/vendas/editar/${venda.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Excluir"
                            onClick={() => handleDelete(venda.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                      <span className="font-medium">{Math.min(endIndex, filteredVendas.length)}</span> de{' '}
                      <span className="font-medium">{filteredVendas.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </VetLayout>
  );
}