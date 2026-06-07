'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { VetLayout } from '@/components/ui/VetLayout';
import { estoqueService, Produto, EstatisticasEstoque } from '@/services/estoque';

export default function EstoquePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasEstoque | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('todas');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const itemsPerPage = 12;

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [produtosData, estatisticasData] = await Promise.all([
        estoqueService.getProdutos(),
        estoqueService.getEstatisticas()
      ]);
      setProdutos(produtosData);
      setEstatisticas(estatisticasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    try {
      const result = await estoqueService.importarProdutos(file);
      await loadData(); // Recarregar dados após importação
      
      let message = `Importação concluída!\n${result.success} produtos importados com sucesso.`;
      if (result.errors.length > 0) {
        message += `\n\nErros encontrados:\n${result.errors.join('\n')}`;
      }
      alert(message);
    } catch (error) {
      console.error('Erro ao importar produtos:', error);
      alert('Erro ao importar produtos. Verifique o formato do arquivo.');
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await estoqueService.exportarProdutos();
    } catch (error) {
      console.error('Erro ao exportar produtos:', error);
      alert('Erro ao exportar produtos.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await estoqueService.deleteProduto(id);
      await loadData(); // Recarregar dados após exclusão
      alert('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto.');
    }
  };

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.marca.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFilter === 'todas' || produto.categoria === categoriaFilter;
    const matchesStatus = statusFilter === 'todos' || produto.status === statusFilter;
    return matchesSearch && matchesCategoria && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProdutos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProdutos = filteredProdutos.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-yellow-100 text-yellow-800';
      case 'descontinuado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'inativo': return 'Inativo';
      case 'descontinuado': return 'Descontinuado';
      default: return status;
    }
  };

  const isEstoqueBaixo = (produto: Produto) => {
    return produto.quantidade_atual <= produto.quantidade_minima;
  };

  const totalProdutos = estatisticas?.totalProdutos || produtos.length;
  const produtosAtivos = estatisticas?.produtosAtivos || produtos.filter(p => p.status === 'ativo').length;
  const produtosEstoqueBaixo = estatisticas?.produtosEstoqueBaixo || produtos.filter(p => isEstoqueBaixo(p)).length;
  const valorTotalEstoque = estatisticas?.valorTotalEstoque || produtos.reduce((acc, p) => acc + (p.quantidade_atual * p.preco_compra), 0);

  const categorias = [...new Set(produtos.map(p => p.categoria))];

  return (
    <VetLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
            <p className="text-gray-600">Gerencie produtos e controle de inventário</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />
            <button
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={importLoading}
            >
              <Upload className="h-4 w-4" />
              {importLoading ? 'Importando...' : 'Importar'}
            </button>
            <button
              className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              onClick={handleExport}
              disabled={exportLoading}
            >
              <Download className="h-4 w-4" />
              {exportLoading ? 'Exportando...' : 'Exportar'}
            </button>
            <button
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => router.push('/estoque/novo-produto')}
            >
              <Plus className="h-4 w-4" />
              Novo Produto
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{totalProdutos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produtos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{produtosAtivos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-gray-900">{produtosEstoqueBaixo}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {parseFloat(valorTotalEstoque || 0).toFixed(2).replace('.', ',')}
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
                placeholder="Buscar por nome, código ou marca..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
            >
              <option value="todas">Todas as Categorias</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="descontinuado">Descontinuado</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando produtos...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Mostrando {currentProdutos.length} de {filteredProdutos.length} produtos
            </p>
            
            {currentProdutos.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600">
                  {searchTerm || categoriaFilter !== 'todas' || statusFilter !== 'todos'
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Comece adicionando seu primeiro produto.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProdutos.map((produto) => (
                  <div key={produto.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    {/* Imagem do produto */}
                    {produto.imagem && (
                      <div className="mb-4">
                        <img
                          src={produto.imagem}
                          alt={produto.nome}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{produto.codigo}</h3>
                          <p className="text-sm text-gray-500">{produto.categoria}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(produto.status)}`}>
                          {getStatusText(produto.status)}
                        </span>
                        {isEstoqueBaixo(produto) && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Baixo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{produto.nome}</h4>
                      <p className="text-sm text-gray-600 mb-1">Marca: {produto.marca}</p>
                      <p className="text-sm text-gray-600 mb-1">Localização: {produto.localizacao}</p>
                      {produto.data_validade && (
                        <p className="text-sm text-gray-600">
                          Validade: {new Date(produto.data_validade).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Estoque atual:</span>
                        <span className={`font-semibold ${isEstoqueBaixo(produto) ? 'text-red-600' : 'text-gray-900'}`}>
                          {produto.quantidade_atual} {produto.unidade_medida}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Estoque mínimo:</span>
                        <span className="text-sm text-gray-900">{produto.quantidade_minima} {produto.unidade_medida}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Preço de venda:</span>
                        <span className="font-semibold text-green-600">
                          R$ {parseFloat(produto.preco_venda || 0).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Valor total: <span className="font-semibold text-gray-900">
                            R$ {(parseFloat(produto.quantidade_atual || 0) * parseFloat(produto.preco_compra || 0)).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Visualizar"
                            onClick={() => router.push(`/estoque/visualizar/${produto.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Editar"
                            onClick={() => router.push(`/estoque/editar/${produto.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Excluir"
                            onClick={() => handleDelete(produto.id)}
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
                      <span className="font-medium">{Math.min(endIndex, filteredProdutos.length)}</span> de{' '}
                      <span className="font-medium">{filteredProdutos.length}</span> resultados
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